/**
 * GitHub API integration service for Project Code CLI
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { request } from 'node:https';
import { join, resolve } from 'node:path';

import { CommandResult } from '../types/index.js';
import { AuthService } from './auth-service.js';
import { ConfigManager } from './config.js';

/**
 * Utility function to make HTTP requests using Node.js built-in https module
 */
async function makeHttpRequest(url: string, options: { body?: string; headers?: Record<string, string>; method?: string } = {}): Promise<{ data: string; status: number }> {
  return new Promise((resolve, reject) => {
    const { body, headers = {}, method = 'GET' } = options;

    const urlObj = new URL(url);
    const requestOptions = {
      headers: {
        'User-Agent': 'Project-Code-CLI',
        ...headers,
      },
      hostname: urlObj.hostname,
      method,
      path: urlObj.pathname + urlObj.search,
      port: 443,
    };

    const req = request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ data, status: res.statusCode || 0 });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      req.write(body);
    }

    req.end();
  });
}

export interface GitHubRepository {
  clone_url: string;
  created_at: string;
  default_branch: string;
  description: null | string;
  full_name: string;
  html_url: string;
  id: number;
  name: string;
  owner: {
    login: string;
    type: string;
  };
  private: boolean;
  updated_at: string;
}

export interface GitHubCreateRepoOptions {
  description?: string;
  name: string;
  private?: boolean;
}

export interface GitHubCloneOptions {
  branch?: string;
  depth?: number;
  projectTag: string; // Format: "owner/repo"
}

/**
 * GitHub API service class
 */
export class GitHubService {
  private authService: AuthService;
  private configManager: ConfigManager;

  constructor() {
    this.authService = new AuthService();
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * Clone a GitHub repository using project tag format
   */
  async cloneRepository(options: GitHubCloneOptions): Promise<CommandResult<string>> {
    try {
      // Parse project tag
      const { owner, repo } = this.parseProjectTag(options.projectTag);

      // Get authentication status
      const authStatus = await this.authService.getAuthStatus();
      if (!authStatus.isAuthenticated || authStatus.provider !== 'github') {
        return {
          error: 'GitHub authentication required. Please run: project-code auth login github',
          success: false,
        };
      }

      // Get repository information from GitHub API
      const repoInfo = await this.getRepositoryInfo(owner, repo);
      if (!repoInfo.success || !repoInfo.data) {
        return {
          error: repoInfo.error || 'Failed to get repository information',
          success: false,
        };
      }

      // Determine target directory path
      const targetPath = this.buildProjectPath(owner, repo);

      // Check if directory already exists
      if (existsSync(targetPath)) {
        return {
          error: `Directory already exists: ${targetPath}`,
          success: false,
        };
      }

      // Create directory structure
      await this.createDirectoryStructure(targetPath);

      // Clone repository
      const cloneResult = await this.performClone(repoInfo.data.clone_url, targetPath, options);

      if (!cloneResult.success) {
        return {
          error: cloneResult.error,
          success: false,
        };
      }

      return {
        data: targetPath,
        message: `Successfully cloned ${options.projectTag} to ${targetPath}`,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Create a new GitHub repository
   */
  async createRepository(options: GitHubCreateRepoOptions): Promise<CommandResult<GitHubRepository>> {
    try {
      // Get authentication status
      const authStatus = await this.authService.getAuthStatus();
      if (!authStatus.isAuthenticated || authStatus.provider !== 'github') {
        return {
          error: 'GitHub authentication required. Please run: project-code auth login github',
          success: false,
        };
      }

      // Get access token for API calls
      const token = await this.getAccessToken();
      if (!token) {
        return {
          error: 'Failed to get GitHub access token',
          success: false,
        };
      }

      // Create repository via GitHub API
      const repository = await this.createRepositoryViaAPI(options, token);

      return {
        data: repository,
        message: `Successfully created GitHub repository: ${repository.full_name}`,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to create repository: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }


  /**
   * List user's GitHub repositories
   */
  async listRepositories(): Promise<CommandResult<GitHubRepository[]>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          error: 'GitHub authentication required',
          success: false,
        };
      }

      const response = await makeHttpRequest('https://api.github.com/user/repos?per_page=100', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        return {
          error: `GitHub API error: ${response.status}`,
          success: false,
        };
      }

      const repositories: GitHubRepository[] = JSON.parse(response.data);

      return {
        data: repositories,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to list repositories: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Validate GitHub repository access
   */
  async validateRepositoryAccess(owner: string, repo: string): Promise<CommandResult<boolean>> {
    const result = await this.getRepositoryInfo(owner, repo);

    if (result.success) {
      return {
        data: true,
        message: `Repository access validated: ${owner}/${repo}`,
        success: true,
      };
    }

    return {
      error: result.error,
      success: false,
    };
  }

  /**
   * Build target path for project
   */
  private buildProjectPath(owner: string, repo: string): string {
    const config = this.configManager.getConfig();
    const rootFolder = config?.defaultRootFolder || join(process.env.HOME || '~', 'code');

    return resolve(join(rootFolder, owner, repo));
  }

  /**
   * Create directory structure for project
   */
  private async createDirectoryStructure(targetPath: string): Promise<void> {
    const parentDir = join(targetPath, '..');

    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }
  }

  /**
   * Create repository via GitHub API
   */
  private async createRepositoryViaAPI(
    options: GitHubCreateRepoOptions,
    token: string,
  ): Promise<GitHubRepository> {
    const response = await makeHttpRequest('https://api.github.com/user/repos', {
      body: JSON.stringify({
        description: options.description,
        name: options.name,
        private: options.private ?? false,
      }),
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (response.status !== 201) {
      throw new Error(`GitHub API error: ${response.status} - ${response.data}`);
    }

    return JSON.parse(response.data);
  }

  /**
   * Get GitHub access token from auth service
   */
  private async getAccessToken(): Promise<null | string> {
    try {
      const authStatus = await this.authService.getAuthStatus();
      if (!authStatus.isAuthenticated || authStatus.provider !== 'github') {
        return null;
      }

      // For now, we'll use a placeholder - in a real implementation,
      // you'd need to modify the auth service to expose the token
      // or implement a method to get it securely
      return 'github-token-placeholder';
    } catch {
      return null;
    }
  }

  /**
   * Get repository information from GitHub API
   */
  private async getRepositoryInfo(owner: string, repo: string): Promise<CommandResult<GitHubRepository>> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          error: 'GitHub authentication required',
          success: false,
        };
      }

      const response = await makeHttpRequest(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return {
          error: `Repository not found: ${owner}/${repo}`,
          success: false,
        };
      }

      if (response.status === 401) {
        return {
          error: 'Invalid GitHub token or insufficient permissions',
          success: false,
        };
      }

      if (response.status !== 200) {
        return {
          error: `GitHub API error: ${response.status}`,
          success: false,
        };
      }

      const repository: GitHubRepository = JSON.parse(response.data);

      return {
        data: repository,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to fetch repository info: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Parse project tag in "owner/repo" format
   */
  private parseProjectTag(projectTag: string): { owner: string; repo: string } {
    const parts = projectTag.split('/');
    if (parts.length !== 2) {
      throw new Error(`Invalid project tag format: ${projectTag}. Expected format: "owner/repo"`);
    }

    const [owner, repo] = parts;
    if (!owner || !repo) {
      throw new Error(`Invalid project tag: ${projectTag}. Both owner and repo are required.`);
    }

    return { owner, repo };
  }

  /**
   * Perform git clone operation
   */
  private async performClone(
    cloneUrl: string,
    targetPath: string,
    options: GitHubCloneOptions,
  ): Promise<CommandResult<void>> {
    try {
      // Build git clone command
      let cloneCommand = `git clone ${cloneUrl} "${targetPath}"`;

      // Add depth option if specified
      if (options.depth && options.depth > 0) {
        cloneCommand += ` --depth ${options.depth}`;
      }

      // Add branch option if specified
      if (options.branch) {
        cloneCommand += ` --branch ${options.branch}`;
      }

      // Execute clone command
      execSync(cloneCommand, {
        cwd: join(targetPath, '..'),
        stdio: 'inherit',
      });

      return { success: true };
    } catch (error) {
      return {
        error: `Git clone failed: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }
}