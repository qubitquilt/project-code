/**
 * Core TypeScript interfaces and types for ProjectCode CLI
 */

export interface ProjectConfig {
  createdAt: Date;
  description?: string;
  isActive?: boolean;
  name: string;
  path: string;
  tags?: string[];
  type: ProjectType;
  updatedAt: Date;
  workspace?: string;
}

export interface ProjectCodeConfig {
  auth?: {
    defaultProvider: 'bitbucket' | 'github' | 'gitlab' | 'local';
    enabled: boolean;
    providers: {
      bitbucket?: {
        clientId?: string;
        enabled: boolean;
      };
      github?: {
        clientId?: string;
        enabled: boolean;
      };
      gitlab?: {
        clientId?: string;
        enabled: boolean;
      };
      local?: {
        enabled: boolean;
      };
    };
    tokenValidationInterval: number;
  };
  defaultRootFolder: string;
  project?: {
    excludePatterns: string[];
    gitignore?: {
      cacheSize: number;
      cacheTTL: number;
      enabled: boolean;
      includeGlobal: boolean;
      maxTraversalDepth: number;
      priority: 'config' | 'gitignore' | 'merge';
      strictMode: boolean;
    };
    includePatterns: string[];
    maxDepth: number;
    supportedTypes: ProjectType[];
  };
  rootFolders: string[];
  ui?: {
    showDescriptions: boolean;
    showTags: boolean;
    sortBy: 'name' | 'path' | 'type' | 'updatedAt';
    sortOrder: 'asc' | 'desc';
    theme: 'auto' | 'dark' | 'light';
  };
  vscode?: {
    enabled: boolean;
    executablePath?: string;
    extensionsDir?: string;
    userDataDir?: string;
  };
}

export interface ProjectInfo {
  description?: string;
  fileCount?: number;
  hasPackageJson?: boolean;
  hasTsConfig?: boolean;
  hasVSCodeSettings?: boolean;
  isGitRepo?: boolean;
  lastModified: Date;
  name: string;
  path: string;
  relativePath?: string;
  size?: number;
  tags?: string[];
  type: ProjectType;
  workspace?: string;
}

export interface VSCodeIntegration {
  executablePath?: string;
  extensionsDir?: string;
  isInstalled: boolean;
  userDataDir?: string;
  version?: string;
  workspacePath?: string;
}

export interface CommandResult<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface GitignoreOptions {
  cacheEnabled?: boolean;
  cacheSize?: number;
  cacheTTL?: number;
  enabled: boolean;
  includeGlobalGitignore?: boolean;
  includeNestedGitignores?: boolean;
  maxTraversalDepth?: number;
  patternCombinationStrategy: 'merge' | 'override' | 'priority';
  priorityOrder?: ('global' | 'local' | 'root')[];
  respectGitignoreInParentDirs?: boolean;
  strictMode?: boolean;
}

export interface ProjectDiscoveryOptions {
  excludePatterns?: string[];
  gitignore?: GitignoreOptions;
  includePatterns?: string[];
  maxDepth?: number;
  rootFolders?: string[];
  supportedTypes?: ProjectType[];
}

export interface ProjectHierarchyNode {
  children: ProjectHierarchyNode[];
  level: number;
  parent?: ProjectHierarchyNode;
  project: ProjectInfo;
}

export interface HierarchyDisplayOptions {
  maxDepth?: number;
  parentFilter?: string;
  showLevels?: boolean;
  showTree?: boolean;
}

export interface HierarchyTreeNode {
  isLast: boolean;
  node: ProjectHierarchyNode;
  prefix: string;
}

export type ProjectType =
  | 'angular'
  | 'clojure'
  | 'cpp'
  | 'csharp'
  | 'css'
  | 'django'
  | 'docker'
  | 'dotnet'
  | 'express'
  | 'fastapi'
  | 'flask'
  | 'gatsby'
  | 'go'
  | 'haskell'
  | 'html'
  | 'java'
  | 'javascript'
  | 'kotlin'
  | 'kubernetes'
  | 'lua'
  | 'matlab'
  | 'nestjs'
  | 'nextjs'
  | 'nodejs'
  | 'nuxtjs'
  | 'perl'
  | 'php'
  | 'python'
  | 'r'
  | 'react'
  | 'ruby'
  | 'rust'
  | 'scala'
  | 'shell'
  | 'spring'
  | 'svelte'
  | 'swift'
  | 'terraform'
  | 'typescript'
  | 'unknown'
  | 'vue';

export interface FileSystemEntry {
  isHidden?: boolean;
  lastModified: Date;
  name: string;
  path: string;
  size?: number;
  type: 'directory' | 'file';
}

export interface ProjectTemplate {
  dependencies?: string[];
  description: string;
  devDependencies?: string[];
  files: string[];
  name: string;
  scripts?: Record<string, string>;
  templatePath?: string;
  type: ProjectType;
  variables?: Record<string, string>;
}

export interface WorkspaceInfo {
  isMultiRoot?: boolean;
  name: string;
  path: string;
  projects: ProjectInfo[];
  vscodeConfig?: unknown;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  excludePatterns?: string[];
  includePatterns?: string[];
  maxResults?: number;
  query: string;
  type?: 'content' | 'filename' | 'path';
}

export interface SearchResult {
  column?: number;
  content?: string;
  file: string;
  line?: number;
  preview?: string;
}

export interface GitignorePattern {
  directory: string;
  lineNumber: number;
  negated: boolean;
  originalLine: string;
  pattern: string;
}

export interface GitignoreFile {
  error?: string;
  lastModified: Date;
  path: string;
  patterns: GitignorePattern[];
}

export interface GitignoreCache {
  files: Map<string, GitignoreFile>;
  hitCount: number;
  lastUpdated: Map<string, Date>;
  missCount: number;
}

export interface GitignoreMatchResult {
  excluded: boolean;
  matchedBy?: GitignorePattern;
  reason?: string;
}