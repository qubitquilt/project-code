/**
 * Project parsing service for GitHub project tags and paths
 */

import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { CommandResult } from '../types/index.js';
import { ConfigManager } from './config.js';

export interface ParsedProjectTag {
  fullName: string;
  owner: string;
  platform: 'bitbucket' | 'github' | 'gitlab';
  repo: string;
}

export interface ProjectPathInfo {
  absolutePath: string;
  exists: boolean;
  owner: string;
  relativePath: string;
  repo: string;
  rootFolder: string;
}

export interface ProjectParseOptions {
  customRootFolder?: string;
  projectTag: string;
}

/**
 * Project parsing service class
 */
export class ProjectParser {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * Extract owner and repo from various formats
   */
   extractOwnerAndRepo(projectTag: string): CommandResult<{ owner: string; repo: string }> {
     const parseResult = this.parseProjectTag(projectTag);

     if (!parseResult.success) {
       return {
         error: parseResult.error,
         success: false,
       };
     }

     const { owner, repo } = parseResult.data!;

     return {
       data: { owner, repo },
       success: true,
     };
   }

  /**
   * Get supported project tag formats
   */
  getSupportedFormats(): string[] {
    return [
      'owner/repo',
      'platform:owner/repo',
      'https://github.com/owner/repo',
      'https://gitlab.com/owner/repo',
      'https://bitbucket.org/owner/repo',
    ];
  }

   /**
    * Normalize project tag for consistent processing
    */
  normalizeProjectTag(projectTag: string): string {
    // Remove leading/trailing whitespace
    let normalized = projectTag.trim();

    // Remove trailing .git extension
    normalized = normalized.replace(/\.git$/, '');

    // Remove trailing slashes
    normalized = normalized.replace(/\/$/, '');

    return normalized;
  }

   /**
    * Parse project tag and resolve to filesystem path
    */
   parseProjectPath(options: ProjectParseOptions): CommandResult<ProjectPathInfo> {
     try {
       // Parse the project tag first
       const parseResult = this.parseProjectTag(options.projectTag);
       if (!parseResult.success) {
         return {
           error: parseResult.error,
           success: false,
         };
       }

       const { owner, repo } = parseResult.data!;

       // Get root folder from options or config
       const rootFolder = options.customRootFolder || this.getDefaultRootFolder();

       // Build the full path
       const absolutePath = resolve(join(rootFolder, owner, repo));
       const relativePath = join(owner, repo);

       // Check if path exists
       const exists = existsSync(absolutePath);

       const pathInfo: ProjectPathInfo = {
         absolutePath,
         exists,
         owner,
         relativePath,
         repo,
         rootFolder,
       };

       return {
         data: pathInfo,
         success: true,
       };
     } catch (error) {
       return {
         error: `Failed to parse project path: ${error instanceof Error ? error.message : String(error)}`,
         success: false,
       };
     }
   }

  /**
   * Parse a project tag in various formats
   */
  parseProjectTag(projectTag: string): CommandResult<ParsedProjectTag> {
    try {
      // Handle different project tag formats
      const cleanTag = projectTag.trim();

      // Check for platform prefixes like "github:owner/repo"
      if (cleanTag.includes(':')) {
        return this.parsePlatformPrefixedTag(cleanTag);
      }

      // Check for URL formats
      if (cleanTag.includes('/') && (cleanTag.startsWith('http') || cleanTag.includes('github.com'))) {
        return this.parseUrlFormat(cleanTag);
      }

      // Default to simple "owner/repo" format
      return this.parseSimpleFormat(cleanTag);
    } catch (error) {
      return {
        error: `Failed to parse project tag "${projectTag}": ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Check if a path would be valid for project creation
   */
  validateProjectPath(pathInfo: ProjectPathInfo): CommandResult<boolean> {
    // Check if parent directory exists or can be created
    const parentDir = join(pathInfo.absolutePath, '..');

    if (!existsSync(parentDir)) {
      // This is OK - we'll create the directory structure
      return {
        data: true,
        message: 'Parent directory will be created',
        success: true,
      };
    }

    // Check if target path exists and is not empty
    if (pathInfo.exists) {
      // Check if directory is empty or just a git repo
      try {
        const entries = readdirSync(pathInfo.absolutePath);

        // Allow if it's just a .git directory (empty repo)
        if (entries.length === 0 || (entries.length === 1 && entries[0] === '.git')) {
          return {
            data: true,
            message: 'Directory exists but appears to be an empty git repository',
            success: true,
          };
        }

        return {
          error: `Directory already exists and is not empty: ${pathInfo.absolutePath}`,
          success: false,
        };
      } catch (error) {
        return {
          error: `Failed to check directory contents: ${error instanceof Error ? error.message : String(error)}`,
          success: false,
        };
      }
    }

    return {
      data: true,
      message: 'Path is valid for project creation',
      success: true,
    };
  }

  /**
   * Validate project tag format
   */
   validateProjectTag(projectTag: string): CommandResult<boolean> {
     const result = this.parseProjectTag(projectTag);

     if (result.success) {
       return {
         data: true,
         message: `Valid project tag: ${result.data!.fullName}`,
         success: true,
       };
     }

     return {
       error: result.error,
       success: false,
     };
   }

  /**
   * Get default root folder from configuration
   */
  private getDefaultRootFolder(): string {
    const config = this.configManager.getConfig();
    return config?.defaultRootFolder || join(process.env.HOME || '~', 'code');
  }

  /**
   * Parse platform-prefixed tag format like "github:owner/repo"
   */
  private parsePlatformPrefixedTag(tag: string): CommandResult<ParsedProjectTag> {
    const [platform, rest] = tag.split(':');

    if (!platform || !rest) {
      return {
        error: `Invalid platform-prefixed format: ${tag}. Expected format: "platform:owner/repo"`,
        success: false,
      };
    }

    const normalizedPlatform = platform.toLowerCase() as 'bitbucket' | 'github' | 'gitlab';

    if (!['bitbucket', 'github', 'gitlab'].includes(normalizedPlatform)) {
      return {
        error: `Unsupported platform: ${platform}. Supported platforms: github, gitlab, bitbucket`,
        success: false,
      };
    }

    return this.parseSimpleFormat(rest, normalizedPlatform);
  }

  /**
   * Parse simple "owner/repo" format
   */
  private parseSimpleFormat(tag: string, platform: 'bitbucket' | 'github' | 'gitlab' = 'github'): CommandResult<ParsedProjectTag> {
    const parts = tag.split('/');

    if (parts.length !== 2) {
      return {
        error: `Invalid project tag format: ${tag}. Expected format: "owner/repo"`,
        success: false,
      };
    }

    const [owner, repo] = parts;

    if (!owner || !repo) {
      return {
        error: `Invalid project tag: ${tag}. Both owner and repo are required.`,
        success: false,
      };
    }

    // Validate characters
    if (!/^[a-zA-Z0-9._-]+$/.test(owner)) {
      return {
        error: `Invalid owner name: ${owner}. Owner names can only contain letters, numbers, dots, hyphens, and underscores.`,
        success: false,
      };
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(repo)) {
      return {
        error: `Invalid repo name: ${repo}. Repo names can only contain letters, numbers, dots, hyphens, and underscores.`,
        success: false,
      };
    }

    const parsedTag: ParsedProjectTag = {
      fullName: `${owner}/${repo}`,
      owner,
      platform,
      repo,
    };

    return {
      data: parsedTag,
      success: true,
    };
  }

  /**
   * Parse URL format like "https://github.com/owner/repo"
   */
  private parseUrlFormat(url: string): CommandResult<ParsedProjectTag> {
    try {
      let cleanUrl = url.trim();

      // Remove trailing slashes and .git extension
      cleanUrl = cleanUrl.replace(/\/$/, '').replace(/\.git$/, '');

      // Extract platform and path from URL
      let platform: 'bitbucket' | 'github' | 'gitlab';
      let pathPart: string;

      if (cleanUrl.includes('github.com')) {
        platform = 'github';
        pathPart = cleanUrl.split('github.com/')[1];
      } else if (cleanUrl.includes('gitlab.com')) {
        platform = 'gitlab';
        pathPart = cleanUrl.split('gitlab.com/')[1];
      } else if (cleanUrl.includes('bitbucket.org')) {
        platform = 'bitbucket';
        pathPart = cleanUrl.split('bitbucket.org/')[1];
      } else {
        return {
          error: `Unsupported URL format: ${url}`,
          success: false,
        };
      }

      if (!pathPart || !pathPart.includes('/')) {
        return {
          error: `Invalid URL format: ${url}. Expected format: https://platform.com/owner/repo`,
          success: false,
        };
      }

      return this.parseSimpleFormat(pathPart, platform);
    } catch (error) {
      return {
        error: `Failed to parse URL format: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }
}