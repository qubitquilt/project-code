import { existsSync, readdirSync, readFileSync , statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import {
  HierarchyDisplayOptions,
  ProjectDiscoveryOptions,
  ProjectHierarchyNode,
  ProjectInfo,
  ProjectType,
} from '../types/index.js';
import { ConfigManager } from './config.js';


/**
 * Project discovery service for scanning and identifying code projects
 */
export class ProjectDiscoveryService {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = ConfigManager.getInstance();
  }

  /**
   * Apply hierarchy display options to nodes
   */
  public applyHierarchyOptions(nodes: ProjectHierarchyNode[], options: HierarchyDisplayOptions): ProjectHierarchyNode[] {
    let filteredNodes = nodes;

    // Apply parent filter if specified
    if (options.parentFilter) {
      filteredNodes = this.filterHierarchyByParent(filteredNodes, options.parentFilter);
    }

    // Apply depth limit if specified
    if (options.maxDepth !== undefined) {
      filteredNodes = this.limitHierarchyDepth(filteredNodes, options.maxDepth);
    }

    return filteredNodes;
  }

  /**
   * Build project hierarchy from discovered projects
   */
  public buildProjectHierarchy(projects: ProjectInfo[]): ProjectHierarchyNode[] {
    const rootNodes: ProjectHierarchyNode[] = [];
    const nodeMap = new Map<string, ProjectHierarchyNode>();

    // Create nodes for all projects
    for (const project of projects) {
      const node: ProjectHierarchyNode = {
        children: [],
        level: 0,
        project,
      };
      nodeMap.set(project.path, node);
    }

    // Build hierarchy
    for (const [path, node] of nodeMap) {
      const parentPath = this.getParentDirectory(path);

      if (parentPath && nodeMap.has(parentPath)) {
        const parentNode = nodeMap.get(parentPath)!;
        node.parent = parentNode;
        node.level = parentNode.level + 1;
        parentNode.children.push(node);
      } else {
        node.level = 0;
        rootNodes.push(node);
      }
    }

    return rootNodes;
  }

  /**
   * Discover projects in the configured root folders
   */
  public async discoverProjects(options?: ProjectDiscoveryOptions): Promise<ProjectInfo[]> {
    const config = this.configManager.getConfig();
    if (!config) {
      throw new Error('Configuration not loaded');
    }

    const rootFolders = options?.rootFolders || config.rootFolders;
    const maxDepth = options?.maxDepth || config.project?.maxDepth || 5;
    const excludePatterns = options?.excludePatterns || config.project?.excludePatterns || [];
    const includePatterns = options?.includePatterns || config.project?.includePatterns || [];
    const supportedTypes = options?.supportedTypes || config.project?.supportedTypes || [];

    const projects: ProjectInfo[] = [];

    const scanPromises = rootFolders
      .filter(rootFolder => existsSync(rootFolder))
      .map(rootFolder =>
        this.scanDirectory(
          rootFolder,
          rootFolder,
          0,
          maxDepth,
          excludePatterns,
          includePatterns,
          supportedTypes
        )
      );

    const projectArrays = await Promise.all(scanPromises);
    for (const folderProjects of projectArrays) {
      projects.push(...folderProjects);
    }

    return projects;
  }

  /**
   * Filter hierarchy nodes by parent directory
   */
  public filterHierarchyByParent(nodes: ProjectHierarchyNode[], parentFilter: string): ProjectHierarchyNode[] {
    const filtered: ProjectHierarchyNode[] = [];

    for (const node of nodes) {
      if (node.project.path.startsWith(parentFilter) || parentFilter.startsWith(node.project.path)) {
        filtered.push(node);
      }
    }

    return filtered;
  }

  /**
   * Filter projects by type
   */
  public filterProjectsByType(projects: ProjectInfo[], types: ProjectType[]): ProjectInfo[] {
    if (types.length === 0) {
      return projects;
    }

    return projects.filter(project => types.includes(project.type));
  }

  /**
   * Flatten hierarchy for table display
   */
  public flattenHierarchy(nodes: ProjectHierarchyNode[]): ProjectInfo[] {
    const result: ProjectInfo[] = [];

    for (const node of nodes) {
      this.flattenHierarchyNode(node, result);
    }

    return result;
  }

  /**
   * Get hierarchy statistics
   */
  public getHierarchyStats(nodes: ProjectHierarchyNode[]): { avgDepth: number; maxDepth: number; totalProjects: number; } {
    const allNodes = this.flattenHierarchy(nodes);
    const totalProjects = allNodes.length;
    const maxDepth = Math.max(...nodes.map(node => this.getMaxDepth(node)));
    const avgDepth = nodes.length > 0 ? nodes.reduce((sum, node) => sum + node.level, 0) / nodes.length : 0;

    return { avgDepth, maxDepth, totalProjects };
  }

  /**
   * Limit hierarchy depth
   */
  public limitHierarchyDepth(nodes: ProjectHierarchyNode[], maxDepth: number): ProjectHierarchyNode[] {
    const limited: ProjectHierarchyNode[] = [];

    for (const node of nodes) {
      if (node.level <= maxDepth) {
        limited.push(node);
      }
    }

    return limited;
  }

  /**
   * Search projects by name or path
   */
  public searchProjects(projects: ProjectInfo[], query: string): ProjectInfo[] {
    const lowerQuery = query.toLowerCase();

    return projects.filter(project =>
      project.name.toLowerCase().includes(lowerQuery) ||
      project.path.toLowerCase().includes(lowerQuery) ||
      (project.description && project.description.toLowerCase().includes(lowerQuery)) ||
      (project.tags && project.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  /**
   * Analyze a directory to determine if it's a project
   */
  private async analyzeDirectory(directoryPath: string, files: string[]): Promise<null | ProjectInfo> {
    const fileNames = files.map(f => f.toLowerCase());

    // Skip directories that don't contain any project indicators
    const hasProjectIndicators = this.hasProjectIndicators(fileNames);
    if (!hasProjectIndicators) {
      return null;
    }

    const projectType = this.determineProjectType(files, directoryPath);
    const relativePath = relative(process.cwd(), directoryPath);

    // Get directory stats
    let size = 0;
    let fileCount = 0;

    try {
      const stats = this.getDirectoryStats(directoryPath);
      size = stats.size;
      fileCount = stats.fileCount;
    } catch {
      // If we can't get stats, continue with zero values
    }

    const projectInfo: ProjectInfo = {
      fileCount,
      hasPackageJson: fileNames.includes('package.json'),
      hasTsConfig: fileNames.includes('tsconfig.json'),
      hasVSCodeSettings: fileNames.includes('.vscode'),
      isGitRepo: fileNames.includes('.git'),
      lastModified: this.getLastModifiedTime(directoryPath),
      name: this.getProjectName(directoryPath),
      path: directoryPath,
      relativePath,
      size,
      type: projectType,
    };

    return projectInfo;
  }

  /**
   * Determine Java project type based on file patterns
   */
  private determineJavaProjectType(fileNames: string[]): ProjectType {
    if (fileNames.some(f => f.includes('.kt'))) return 'kotlin';
    if (fileNames.some(f => f.includes('.scala'))) return 'scala';
    return 'java';
  }

  /**
   * Determine Node.js project type based on package.json dependencies
   */
  private determineNodeProjectType(files: string[], directoryPath: string): ProjectType {
    const packageJsonPath = join(directoryPath, 'package.json');

    try {
      const packageContent = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };

      if (deps.typescript) return 'typescript';
      if (deps.react) return 'react';
      if (deps.vue) return 'vue';
      if (deps.angular) return 'angular';
      if (deps.next) return 'nextjs';
      if (deps.nuxt) return 'nuxtjs';
      if (deps.express) return 'express';
      if (deps.nestjs) return 'nestjs';
      if (deps.gatsby) return 'gatsby';

      return 'nodejs';
    } catch {
      return 'javascript';
    }
  }

  /**
   * Get project type based on file patterns
   */
  private determineProjectType(files: string[], directoryPath: string): ProjectType {
    const fileNames = files.map(f => f.toLowerCase());

    // Check for Node.js/JavaScript/TypeScript projects
    if (fileNames.includes('package.json')) {
      return this.determineNodeProjectType(files, directoryPath);
    }

    // Check for Python projects
    if (fileNames.includes('requirements.txt') || fileNames.includes('setup.py') || fileNames.includes('pyproject.toml')) {
      return 'python';
    }

    // Check for Rust projects
    if (fileNames.includes('cargo.toml')) {
      return 'rust';
    }

    // Check for Go projects
    if (fileNames.includes('go.mod')) {
      return 'go';
    }

    // Check for PHP projects
    if (fileNames.includes('composer.json')) {
      return 'php';
    }

    // Check for Ruby projects
    if (fileNames.includes('gemfile')) {
      return 'ruby';
    }

    // Check for Java projects
    if (fileNames.includes('pom.xml') || fileNames.includes('build.gradle')) {
      return this.determineJavaProjectType(fileNames);
    }

    // Check for C# projects
    if (fileNames.includes('.csproj') || fileNames.includes('.sln') || fileNames.includes('.vbproj')) {
      return 'csharp';
    }

    // Check for C++ projects
    if (fileNames.some(f => f.endsWith('.cpp') || f.endsWith('.h') || f.endsWith('.hpp'))) {
      return 'cpp';
    }

    // Check for Swift projects
    if (fileNames.some(f => f.endsWith('.swift'))) {
      return 'swift';
    }

    // Check for web projects
    if (fileNames.some(f => f.endsWith('.html')) && fileNames.some(f => f.endsWith('.css') || f.endsWith('.scss') || f.endsWith('.sass'))) {
      return 'html';
    }

    // Check for Docker projects
    if (fileNames.includes('dockerfile')) {
      return 'docker';
    }

    // Check for Terraform projects
    if (fileNames.some(f => f.endsWith('.tf'))) {
      return 'terraform';
    }

    return 'unknown';
  }


  /**
   * Helper method to recursively flatten a hierarchy node
   */
  private flattenHierarchyNode(node: ProjectHierarchyNode, result: ProjectInfo[]): void {
    result.push(node.project);

    const children = node.children || [];
    for (const child of children) {
      this.flattenHierarchyNode(child, result);
    }
  }

  /**
   * Get directory statistics
   */
  private getDirectoryStats(directoryPath: string): { fileCount: number; size: number; } {
    let size = 0;
    let fileCount = 0;

    const scan = (currentPath: string) => {
      try {
        const entries = readdirSync(currentPath);

        for (const entry of entries) {
          const entryPath = join(currentPath, entry);
          const stat = statSync(entryPath);

          if (stat.isFile()) {
            size += stat.size;
            fileCount++;
          } else if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist' && entry !== 'build') {
            scan(entryPath);
          }
        }
      } catch {
        // Skip directories that can't be read
      }
    };

    scan(directoryPath);
    return { fileCount, size };
  }

  /**
   * Get last modified time of directory
   */
  private getLastModifiedTime(directoryPath: string): Date {
    try {
      const stat = statSync(directoryPath);
      return stat.mtime;
    } catch {
      return new Date();
    }
  }

  /**
   * Helper method to get maximum depth of a node
   */
  private getMaxDepth(node: ProjectHierarchyNode): number {
    if (node.children.length === 0) {
      return node.level;
    }

    return Math.max(node.level, ...node.children.map(child => this.getMaxDepth(child)));
  }

  /**
   * Get parent directory path
   */
  private getParentDirectory(path: string): null | string {
    const parentPath = join(path, '..');
    return parentPath === path ? null : parentPath;
  }

  /**
   * Get project name from directory path
   */
  private getProjectName(directoryPath: string): string {
    return directoryPath.split(sep).pop() || 'Unknown Project';
  }

  /**
   * Check if directory has project indicators
   */
  private hasProjectIndicators(files: string[]): boolean {
    const projectFiles = [
      'package.json',
      'requirements.txt',
      'setup.py',
      'pyproject.toml',
      'cargo.toml',
      'go.mod',
      'composer.json',
      'gemfile',
      'pom.xml',
      'build.gradle',
      '.csproj',
      '.sln',
      '.vbproj',
      'dockerfile',
      '.tf',
      'index.html',
      'app.js',
      'main.js',
      'server.js',
      'app.py',
      'main.py',
      'program.cs',
      'main.go',
      'lib.rs',
      'src/main/java',
      'src/main/kotlin',
      'src/main/scala',
    ];

    return projectFiles.some(projectFile => files.includes(projectFile)) ||
           files.some(f => f.endsWith('.js') && f !== '.gitignore') ||
           files.some(f => f.endsWith('.py') && f !== '.gitignore') ||
           files.some(f => f.endsWith('.cs') && f !== '.gitignore') ||
           files.some(f => f.endsWith('.go') && f !== '.gitignore') ||
           files.some(f => f.endsWith('.rs') && f !== '.gitignore');
  }

  /**
   * Scan a directory for projects
   */
  private async scanDirectory(
    rootPath: string,
    currentPath: string,
    currentDepth: number,
    maxDepth: number,
    excludePatterns: string[],
    includePatterns: string[],
    supportedTypes: ProjectType[]
  ): Promise<ProjectInfo[]> {
    const projects: ProjectInfo[] = [];

    try {
      if (currentDepth >= maxDepth) {
        return projects;
      }

      if (!existsSync(currentPath)) {
        return projects;
      }

      const entries = readdirSync(currentPath);
      const files = entries.filter(entry => {
        const entryPath = join(currentPath, entry);
        const stat = statSync(entryPath);

        if (stat.isDirectory()) {
          // Check if directory should be excluded
          return !this.shouldExclude(entryPath, excludePatterns);
        }

        return stat.isFile();
      });

      // Check if this directory contains a project
      const projectInfo = await this.analyzeDirectory(currentPath, files);
      if (projectInfo) {
        projects.push(projectInfo);
      }

      // Recursively scan subdirectories
      const directories = entries.filter(entry => {
        const entryPath = join(currentPath, entry);
        return statSync(entryPath).isDirectory() && !this.shouldExclude(entryPath, excludePatterns);
      });

      const subDirPromises = directories.map(directory => {
        const subPath = join(currentPath, directory);
        return this.scanDirectory(
          rootPath,
          subPath,
          currentDepth + 1,
          maxDepth,
          excludePatterns,
          includePatterns,
          supportedTypes
        );
      });

      const subProjectArrays = await Promise.all(subDirPromises);
      for (const subProjects of subProjectArrays) {
        projects.push(...subProjects);
      }
    } catch (error) {
      // Skip directories that can't be read
      console.warn(`Warning: Could not read directory ${currentPath}: ${error}`);
    }

    return projects;
  }

  /**
   * Check if path should be excluded based on patterns
   */
  private shouldExclude(path: string, excludePatterns: string[]): boolean {
    return excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replaceAll('**', '.*').replaceAll('*', '[^/]*'));
      return regex.test(path);
    });
  }
}