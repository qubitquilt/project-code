import { readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  GitignoreFile,
  GitignoreMatchResult,
  GitignoreOptions,
  GitignorePattern,
} from '../types/index.js';

/**
 * Gitignore pattern parser and matcher
 * Handles parsing .gitignore files and matching file paths against patterns
 */
export class GitignoreParser {
  private static readonly COMMENT_PREFIX = '#';
  private static readonly DIRECTORY_SEPARATOR = '/';
  private static readonly NEGATION_PREFIX = '!';
  private static readonly PATTERN_SEPARATORS = /[\/\\]/;

  /**
   * Find all .gitignore files in a directory tree
   */
  static findGitignoreFiles(startPath: string, maxDepth: number = 10): string[] {
    const gitignoreFiles: string[] = [];
    this.findGitignoreFilesRecursive(startPath, gitignoreFiles, 0, maxDepth);
    return gitignoreFiles;
  }

  /**
   * Match a file path against gitignore patterns
   */
  static matchPath(
    filePath: string,
    patterns: GitignorePattern[],
    options: GitignoreOptions
  ): GitignoreMatchResult {
    if (!options.enabled) {
      return { excluded: false };
    }

    let excluded = false;
    let lastMatchingPattern: GitignorePattern | undefined;
    let reason = '';

    // Process patterns in order
    for (const pattern of patterns) {
      const matches = this.patternMatches(filePath, pattern, options);

      if (matches) {
        if (pattern.negated) {
          // Negation pattern - include the file
          excluded = false;
          reason = `Included by negation pattern: ${pattern.pattern}`;
        } else {
          // Regular pattern - exclude the file
          excluded = true;
          lastMatchingPattern = pattern;
          reason = `Excluded by pattern: ${pattern.pattern}`;
        }
      }
    }

    return {
      excluded,
      matchedBy: lastMatchingPattern,
      reason,
    };
  }

  /**
   * Parse gitignore content and return structured patterns
   */
  static parseGitignoreContent(content: string, baseDir: string = ''): GitignorePattern[] {
    const patterns: GitignorePattern[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith(this.COMMENT_PREFIX)) {
        continue;
      }

      const pattern = this.parsePattern(trimmedLine, baseDir, patterns.length + 1);
      if (pattern) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Parse a .gitignore file and return structured patterns
   */
  static parseGitignoreFile(filePath: string): GitignoreFile {
    try {
      const stats = statSync(filePath);
      const content = readFileSync(filePath, 'utf8');
      const patterns = this.parseGitignoreContent(content, dirname(filePath));

      return {
        error: undefined,
        lastModified: stats.mtime,
        path: filePath,
        patterns,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        lastModified: new Date(),
        path: filePath,
        patterns: [],
      };
    }
  }

  /**
   * Parse multiple .gitignore files and merge their patterns
   */
  static parseMultipleGitignoreFiles(
    filePaths: string[],
    options: GitignoreOptions
  ): GitignorePattern[] {
    const allPatterns: GitignorePattern[] = [];

    for (const filePath of filePaths) {
      const gitignoreFile = this.parseGitignoreFile(filePath);

      if (gitignoreFile.error) {
        console.warn(`Warning: Error parsing ${filePath}: ${gitignoreFile.error}`);
        continue;
      }

      allPatterns.push(...gitignoreFile.patterns);
    }

    return this.mergePatterns(allPatterns, options);
  }

  /**
   * Recursively find .gitignore files
   */
  private static findGitignoreFilesRecursive(
    dirPath: string,
    results: string[],
    currentDepth: number,
    maxDepth: number
  ): void {
    if (currentDepth >= maxDepth) {
      return;
    }

    try {
      const gitignorePath = join(dirPath, '.gitignore');
      const stats = statSync(gitignorePath);

      if (stats.isFile()) {
        results.push(gitignorePath);
      }
    } catch {
      // .gitignore doesn't exist, continue
    }

    // Continue searching in subdirectories
    try {
      const entries = statSync(dirPath);
      if (entries.isDirectory()) {
        // Note: In a real implementation, you'd need to read the directory contents
        // For now, we'll just check the current directory
      }
    } catch {
      // Directory doesn't exist or can't be read
    }
  }

  /**
   * Match directory patterns (patterns ending with /)
   */
  private static matchDirectoryPattern(path: string, pattern: string): boolean {
    const cleanPattern = pattern.slice(0, -1); // Remove trailing slash

    if (path === cleanPattern) {
      return true;
    }

    // Check if path is inside the directory
    if (path.startsWith(cleanPattern + this.DIRECTORY_SEPARATOR)) {
      return true;
    }

    return false;
  }

  /**
   * Match double wildcard patterns (**)
   */
  private static matchDoubleWildcard(path: string, pattern: string): boolean {
    const regex = this.patternToRegex(pattern);
    return regex.test(path);
  }

  /**
   * Match glob patterns with wildcards
   */
  private static matchGlobPattern(
    path: string,
    pattern: string,
    _options: GitignoreOptions
  ): boolean {
    // Handle ** (match any number of directories)
    if (pattern.includes('**')) {
      return this.matchDoubleWildcard(path, pattern);
    }

    // Handle * and ? wildcards
    return this.matchSimpleWildcard(path, pattern);
  }

  /**
   * Match simple wildcard patterns (* and ?)
   */
  private static matchSimpleWildcard(path: string, pattern: string): boolean {
    const regex = this.simplePatternToRegex(pattern);
    return regex.test(path);
  }

  /**
   * Merge patterns according to the specified strategy
   */
  private static mergePatterns(
    patterns: GitignorePattern[],
    options: GitignoreOptions
  ): GitignorePattern[] {
    if (options.patternCombinationStrategy === 'override') {
      // Later patterns override earlier ones
      return patterns;
    }

    if (options.patternCombinationStrategy === 'priority' && options.priorityOrder) {
      // Sort patterns by priority order
      return this.sortPatternsByPriority(patterns, options.priorityOrder);
    }

    // Default: merge strategy - combine all patterns
    return patterns;
  }

  /**
   * Normalize file path for consistent comparison
   */
  private static normalizePath(filePath: string): string {
    return filePath.replaceAll('\\', this.DIRECTORY_SEPARATOR);
  }

  /**
   * Normalize pattern for consistent comparison
   */
  private static normalizePattern(pattern: string): string {
    return pattern.replaceAll('\\', this.DIRECTORY_SEPARATOR);
  }

  /**
   * Parse a single gitignore pattern line
   */
  private static parsePattern(
    line: string,
    baseDir: string,
    lineNumber: number
  ): GitignorePattern | null {
    // Handle negation patterns
    const isNegated = line.startsWith(this.NEGATION_PREFIX);
    const patternText = isNegated ? line.slice(1) : line;

    if (!patternText.trim()) {
      return null;
    }

    return {
      directory: baseDir,
      lineNumber,
      negated: isNegated,
      originalLine: line,
      pattern: patternText,
    };
  }

  /**
   * Check if a pattern matches a file path
   */
  private static patternMatches(
    filePath: string,
    pattern: GitignorePattern,
    options: GitignoreOptions
  ): boolean {
    const normalizedPath = this.normalizePath(filePath);
    const normalizedPattern = this.normalizePattern(pattern.pattern);

    // Handle directory patterns
    if (pattern.pattern.endsWith(this.DIRECTORY_SEPARATOR)) {
      return this.matchDirectoryPattern(normalizedPath, normalizedPattern);
    }

    // Handle glob patterns
    return this.matchGlobPattern(normalizedPath, normalizedPattern, options);
  }

  /**
   * Convert gitignore pattern to regex
   */
  private static patternToRegex(pattern: string): RegExp {
    // Escape special regex characters except our wildcards
    const escapedPattern = pattern
      .replaceAll(/[.+^${}()|[\]\\]/g, String.raw`\$&`)
      .replaceAll('**', '.*') // ** matches any number of directories
      .replaceAll('*', '[^/]*') // * matches any characters except /
      .replaceAll('?', '[^/]'); // ? matches any single character except /

    // Add anchors for full path matching
    const regexPattern = '^' + escapedPattern + '$';

    return new RegExp(regexPattern);
  }

  /**
   * Convert simple pattern (no **) to regex
   */
  private static simplePatternToRegex(pattern: string): RegExp {
    const escapedPattern = pattern
      .replaceAll(/[.+^${}()|[\]\\]/g, String.raw`\$&`)
      .replaceAll('*', '.*')
      .replaceAll('?', '.');
    return new RegExp('^' + escapedPattern + '$');
  }

  /**
   * Sort patterns by priority order
   */
  private static sortPatternsByPriority(
    patterns: GitignorePattern[],
    _priorityOrder: ('global' | 'local' | 'root')[]
  ): GitignorePattern[] {
    // This is a simplified implementation
    // In a real scenario, you'd need to determine which category each pattern belongs to
    return patterns.sort(() => 0);
  }
}