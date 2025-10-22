/**
 * Directory hierarchy management service for Project Code CLI
 */

import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { CommandResult } from '../types/index.js';
import { ConfigManager } from './config.js';

export interface DirectoryCreationOptions {
  path: string;
  permissions?: number;
  skipIfExists?: boolean;
}

export interface DirectoryValidationResult {
  canCreate: boolean;
  exists: boolean;
  isEmpty: boolean;
  path: string;
  reason?: string;
}

export interface DirectoryHierarchyOptions {
  basePath: string;
  createIntermediate?: boolean;
  permissions?: number;
}

/**
 * Directory management service class
 */
export class DirectoryManager {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * Clean up empty directories
   */
  async cleanupEmptyDirectories(basePath: string, maxDepth = 5): Promise<CommandResult<string[]>> {
    try {
      const absolutePath = resolve(basePath);
      const removedPaths: string[] = [];

      if (!(await fs.promises.access(absolutePath).then(() => true).catch(() => false))) {
        return {
          data: removedPaths,
          message: 'Base path does not exist',
          success: true,
        };
      }

      await this.removeEmptyDirectoriesRecursive(absolutePath, removedPaths, maxDepth, 0);

      return {
        data: removedPaths,
        message: `Cleaned up ${removedPaths.length} empty directories`,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to cleanup directories: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Create directory with full path hierarchy
   */
  async createDirectory(options: DirectoryCreationOptions): Promise<CommandResult<string>> {
    try {
      const { path, permissions = 0o755, skipIfExists = false } = options;

      // Resolve to absolute path
      const absolutePath = resolve(path);

      // Check if directory already exists
      if (await fs.promises.access(absolutePath).then(() => true).catch(() => false)) {
        if (skipIfExists) {
          return {
            data: absolutePath,
            message: `Directory already exists: ${absolutePath}`,
            success: true,
          };
        }

        // Check if it's actually a directory
        const stats = await fs.promises.stat(absolutePath);
        if (!stats.isDirectory()) {
          return {
            error: `Path exists but is not a directory: ${absolutePath}`,
            success: false,
          };
        }

        return {
          data: absolutePath,
          message: `Directory already exists: ${absolutePath}`,
          success: true,
        };
      }

      // Create parent directories if needed
      const parentDir = dirname(absolutePath);
      if (!(await fs.promises.access(parentDir).then(() => true).catch(() => false))) {
        await this.createDirectoryHierarchy({
          basePath: parentDir,
          permissions,
        });
      }

      // Create the target directory
      await fs.promises.mkdir(absolutePath, { mode: permissions, recursive: true });

      return {
        data: absolutePath,
        message: `Successfully created directory: ${absolutePath}`,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to create directory: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Create full directory hierarchy from base path
   */
  async createDirectoryHierarchy(options: DirectoryHierarchyOptions): Promise<CommandResult<string[]>> {
    try {
      const { basePath, permissions = 0o755 } = options;
      const createdPaths: string[] = [];

      // Resolve to absolute path
      const absolutePath = resolve(basePath);

      // Check if already exists
      if (await fs.promises.access(absolutePath).then(() => true).catch(() => false)) {
        return {
          data: createdPaths,
          message: `Directory already exists: ${absolutePath}`,
          success: true,
        };
      }

      // Create each level of the hierarchy
      const parts = absolutePath.split(/[/\\]/);
      let currentPath = '';

      for (const part of parts) {
        if (part) { // Skip empty parts
          currentPath = join(currentPath, part);

          if (!(await fs.promises.access(currentPath).then(() => true).catch(() => false))) {
            await fs.promises.mkdir(currentPath, { mode: permissions });
            createdPaths.push(currentPath);
          }
        }
      }

      return {
        data: createdPaths,
        message: `Successfully created directory hierarchy: ${createdPaths.join(', ')}`,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to create directory hierarchy: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Create directory hierarchy for project structure
   */
  async createProjectHierarchy(owner: string, repo: string, customRoot?: string): Promise<CommandResult<string>> {
    try {
      // Get root folder from config or custom path
      const rootFolder = customRoot || this.getDefaultRootFolder();
      const projectPath = resolve(join(rootFolder, owner, repo));

      // Create the directory
      const result = await this.createDirectory({
        path: projectPath,
        permissions: 0o755,
        skipIfExists: false,
      });

      if (!result.success) {
        return result;
      }

      return {
        data: projectPath,
        message: `Successfully created project hierarchy: ${projectPath}`,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to create project hierarchy: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Ensure directory exists, creating if necessary
   */
  async ensureDirectory(path: string, permissions?: number): Promise<CommandResult<string>> {
    try {
      const absolutePath = resolve(path);

      if (await fs.promises.access(absolutePath).then(() => true).catch(() => false)) {
        const stats = await fs.promises.stat(absolutePath);
        if (!stats.isDirectory()) {
          return {
            error: `Path exists but is not a directory: ${absolutePath}`,
            success: false,
          };
        }

        return {
          data: absolutePath,
          message: `Directory already exists: ${absolutePath}`,
          success: true,
        };
      }

      // Create directory with parent hierarchy
      return this.createDirectory({
        path: absolutePath,
        permissions,
        skipIfExists: true,
      });
    } catch (error) {
      return {
        error: `Failed to ensure directory: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Get directory size information
   */
   async getDirectoryInfo(path: string): Promise<CommandResult<{ fileCount: number; path: string; size: number; }>> {
    try {
      const absolutePath = resolve(path);

      if (!(await fs.promises.access(absolutePath).then(() => true).catch(() => false))) {
        return {
          error: `Directory does not exist: ${absolutePath}`,
          success: false,
        };
      }

      const stats = await fs.promises.stat(absolutePath);
      if (!stats.isDirectory()) {
        return {
          error: `Path is not a directory: ${absolutePath}`,
          success: false,
        };
      }

      const info = await this.calculateDirectorySize(absolutePath);

      return {
        data: {
          fileCount: info.fileCount,
          path: absolutePath,
          size: info.size,
        },
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to get directory info: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Validate directory for project creation
   */
   async validateProjectDirectory(path: string): Promise<CommandResult<DirectoryValidationResult>> {
    try {
      const absolutePath = resolve(path);

      // Check if path exists
      if (await fs.promises.access(absolutePath).then(() => true).catch(() => false)) {
        const stats = await fs.promises.stat(absolutePath);

        if (!stats.isDirectory()) {
          return {
            error: `Path exists but is not a directory: ${absolutePath}`,
            success: false,
          };
        }

        // Check if directory is empty or contains only git files
        const entries = await this.getDirectoryEntries(absolutePath);
        const isEmpty = entries.length === 0;
        const isGitOnly = entries.length === 1 && entries[0] === '.git';

        return {
          data: {
            canCreate: isEmpty || isGitOnly,
            exists: true,
            isEmpty,
            path: absolutePath,
            reason: isEmpty || isGitOnly ? undefined : 'Directory is not empty',
          },
          success: true,
        };
      }

      // Path doesn't exist - check if parent exists
      const parentDir = dirname(absolutePath);
      const parentExists = await fs.promises.access(parentDir).then(() => true).catch(() => false);

      if (!parentExists) {
        return {
          error: `Parent directory does not exist: ${parentDir}`,
          success: false,
        };
      }

      return {
        data: {
          canCreate: true,
          exists: false,
          isEmpty: true,
          path: absolutePath,
        },
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to validate directory: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Calculate directory size and file count
   */
   private async calculateDirectorySize(path: string): Promise<{ fileCount: number; size: number; }> {
    let size = 0;
    let fileCount = 0;

    try {
      const entries = await this.getDirectoryEntries(path);

      for (const entry of entries) {
        if (entry === '.' || entry === '..') {
          continue;
        }

        const entryPath = join(path, entry);
        try {
          const stats = await fs.promises.stat(entryPath);

          if (stats.isDirectory()) {
            const subDirInfo = await this.calculateDirectorySize(entryPath);
            size += subDirInfo.size;
            fileCount += subDirInfo.fileCount;
          } else if (stats.isFile()) {
            size += stats.size;
            fileCount++;
          }
        } catch {
          // Skip entries that can't be accessed
        }
      }
    } catch {
      // Error reading directory
    }

    return { fileCount, size };
  }

  /**
   * Get default root folder from configuration
   */
  private getDefaultRootFolder(): string {
    const config = this.configManager.getConfig();
    return config?.defaultRootFolder || join(process.env.HOME || '~', 'code');
  }

  /**
   * Get directory entries
   */
   private async getDirectoryEntries(path: string): Promise<string[]> {
     try {
       return await fs.promises.readdir(path);
     } catch {
       return [];
     }
   }

  /**
   * Remove empty directories recursively
   */
  private async removeEmptyDirectoriesRecursive(
    currentPath: string,
    removedPaths: string[],
    maxDepth: number,
    currentDepth: number,
  ): Promise<void> {
    if (currentDepth >= maxDepth) {
      return;
    }

    try {
      const entries = await this.getDirectoryEntries(currentPath);

      // If directory is not empty, don't remove it
      if (entries.length > 0) {
        return;
      }

      // Try to remove the directory
      try {
        await fs.promises.rmdir(currentPath);
        removedPaths.push(currentPath);

        // Check parent directory
        const parentDir = dirname(currentPath);
        if (parentDir !== currentPath) {
          await this.removeEmptyDirectoriesRecursive(parentDir, removedPaths, maxDepth, currentDepth + 1);
        }
      } catch {
        // Directory not empty or couldn't be removed
      }
    } catch {
      // Error accessing directory
    }
  }
}