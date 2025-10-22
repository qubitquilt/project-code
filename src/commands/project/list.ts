import {Command, Flags} from '@oclif/core'
import { relative } from 'node:path'

import {ConfigManager} from '../../lib/config.js'
import {ProjectDiscoveryService} from '../../lib/project-discovery.js'
import {VSCodeService} from '../../lib/vscode-service.js'
import {HierarchyDisplayOptions, ProjectCodeConfig, ProjectHierarchyNode, ProjectInfo, ProjectType} from '../../types/index.js'

/**
 * List discovered projects
 */
export default class ProjectList extends Command {
  static description = 'List all discovered projects'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --type javascript',
    '<%= config.bin %> <%= command.id %> --search "my-project"',
    '<%= config.bin %> <%= command.id %> --format json',
    '<%= config.bin %> <%= command.id %> --tree',
    '<%= config.bin %> <%= command.id %> --hierarchy --parent ~/code/work',
    '<%= config.bin %> <%= command.id %> --depth 3',
  ]
static flags = {
    depth: Flags.integer({
      char: 'd',
      default: 10,
      description: 'Maximum hierarchy depth to display',
    }),
    format: Flags.string({
      char: 'f',
      default: 'table',
      description: 'Output format',
      options: ['table', 'json'],
    }),
    hierarchy: Flags.boolean({
      char: 'h',
      default: false,
      description: 'Display projects with hierarchy information',
    }),
    'max-depth': Flags.integer({
      default: 5,
      description: 'Maximum directory depth to scan',
    }),
    parent: Flags.string({
      char: 'p',
      description: 'Filter projects by parent directory',
    }),
    search: Flags.string({
      char: 's',
      description: 'Search projects by name or path',
    }),
    'show-hidden': Flags.boolean({
      default: false,
      description: 'Show hidden files and directories',
    }),
    tree: Flags.boolean({
      char: 't',
      default: false,
      description: 'Display projects in tree format',
    }),
    type: Flags.string({
      char: 't',
      description: 'Filter projects by type',
      options: [
        'angular',
        'clojure',
        'cpp',
        'csharp',
        'css',
        'django',
        'docker',
        'dotnet',
        'express',
        'fastapi',
        'flask',
        'gatsby',
        'go',
        'haskell',
        'html',
        'java',
        'javascript',
        'kotlin',
        'kubernetes',
        'lua',
        'matlab',
        'nestjs',
        'nextjs',
        'nodejs',
        'nuxtjs',
        'perl',
        'php',
        'python',
        'r',
        'react',
        'ruby',
        'rust',
        'scala',
        'shell',
        'spring',
        'svelte',
        'swift',
        'terraform',
        'typescript',
        'unknown',
        'vue',
      ],
    }),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(ProjectList)

    try {
      // Initialize services
      const configManager = ConfigManager.getInstance()
      const projectDiscovery = new ProjectDiscoveryService()
      const vscodeService = new VSCodeService()

      // Load configuration
      const configResult = configManager.loadConfig()
      if (!configResult.success) {
        this.error(`Failed to load configuration: ${configResult.error}`)
        return
      }

      // Discover projects
      this.log('🔍 Discovering projects...')

      const discoveryOptions = {
        maxDepth: flags['max-depth'],
      }

      const projects = await projectDiscovery.discoverProjects(discoveryOptions)

      // Handle hierarchy display options
      const hierarchyOptions: HierarchyDisplayOptions = {
        maxDepth: flags.depth,
        parentFilter: flags.parent,
        showLevels: flags.hierarchy,
        showTree: flags.tree,
      }

      if (projects.length === 0) {
        this.log('No projects found.')
        return
      }

      // Apply filters
      let filteredProjects = projects

      // Filter by type
      if (flags.type) {
        filteredProjects = projectDiscovery.filterProjectsByType(filteredProjects, [flags.type as ProjectType])
        this.log(`Filtered to ${filteredProjects.length} ${flags.type} projects`)
      }

      // Filter by search
      if (flags.search) {
        filteredProjects = projectDiscovery.searchProjects(filteredProjects, flags.search)
        this.log(`Found ${filteredProjects.length} projects matching "${flags.search}"`)
      }

      if (filteredProjects.length === 0) {
        this.log('No projects match the specified criteria.')
        return
      }

      // Sort projects
      filteredProjects.sort((a, b) => {
        const config = configManager.getConfig()
        const sortBy = config?.ui?.sortBy || 'name'
        const sortOrder = config?.ui?.sortOrder || 'asc'

        let comparison = 0

        switch (sortBy) {
          case 'name': {
            comparison = a.name.localeCompare(b.name)
            break
          }

          case 'path': {
            comparison = a.path.localeCompare(b.path)
            break
          }

          case 'type': {
            comparison = a.type.localeCompare(b.type)
            break
          }

          case 'updatedAt': {
            comparison = a.lastModified.getTime() - b.lastModified.getTime()
            break
          }

          default: {
            comparison = a.name.localeCompare(b.name)
          }
        }

        return sortOrder === 'desc' ? -comparison : comparison
      })

      // Display results
      if (flags.format === 'json') {
        this.log(JSON.stringify(filteredProjects, null, 2))
      } else if (hierarchyOptions.showTree) {
        this.displayProjectsTree(filteredProjects, hierarchyOptions)
      } else if (hierarchyOptions.showLevels) {
        this.displayProjectsHierarchyTable(filteredProjects, hierarchyOptions, configManager.getConfig())
      } else {
        this.displayProjectsTable(filteredProjects, configManager.getConfig() || {} as ProjectCodeConfig)
      }

      // Show VS Code integration status
      const vscodeInfo = vscodeService.getVSCodeInfo()
      if (vscodeInfo?.isInstalled) {
        this.log(`\n💡 VS Code detected (${vscodeInfo.version}). Use 'project open' to open projects.`)
      } else {
        this.log('\n⚠️  VS Code not detected. Install VS Code to enable project opening.')
      }
    } catch (error) {
      this.error(`Failed to list projects: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Display hierarchy table with level information
   */
  private displayHierarchyTable(projects: ProjectInfo[], config: ProjectCodeConfig): void {
    const showDescriptions = config?.ui?.showDescriptions !== false
    const showTags = config?.ui?.showTags !== false

    // Calculate column widths
    const levelWidth = 5
    const nameWidth = Math.max(...projects.map((p) => p.name.length), 4)
    const typeWidth = Math.max(...projects.map((p) => p.type.length), 4)
    const pathWidth = Math.min(40, Math.max(...projects.map((p) => this.getRelativePath(p.path).length), 4))

    // Header
    const totalWidth = levelWidth + nameWidth + typeWidth + pathWidth + (showDescriptions ? 15 : 0) + 12 // 12 for separators
    this.log(''.padEnd(totalWidth, '─'))
    const header = `${'Level'.padEnd(levelWidth)} │ ${'Name'.padEnd(nameWidth)} │ ${'Type'.padEnd(typeWidth)} │ ${'Path'.padEnd(pathWidth)}${showDescriptions ? ' │ Description' : ''}`
    this.log(header)
    this.log(''.padEnd(totalWidth, '─'))

    // Rows
    for (const project of projects) {
      const relativePath = this.getRelativePath(project.path)
      const truncatedPath = relativePath.length > pathWidth ? '...' + relativePath.slice(-(pathWidth - 3)) : relativePath

      const row = `${'0'.padEnd(levelWidth)} │ ${project.name.padEnd(nameWidth)} │ ${project.type.padEnd(typeWidth)} │ ${truncatedPath.padEnd(pathWidth)}${showDescriptions && project.description ? ` │ ${project.description}` : ''}`
      this.log(row)

      // Show tags if enabled and available
      if (showTags && project.tags && project.tags.length > 0) {
        this.log(`${''.padEnd(levelWidth)}   ${''.padEnd(nameWidth)}   ${''.padEnd(typeWidth)}   ${''.padEnd(pathWidth)}   🏷️  ${project.tags.join(', ')}`)
      }
    }

    this.log(''.padEnd(totalWidth, '─'))
    this.log(`Total: ${projects.length} projects`)
  }

  /**
   * Display projects in hierarchy-aware table format
   */
  private displayProjectsHierarchyTable(projects: ProjectInfo[], options: HierarchyDisplayOptions, config: unknown): void {
    this.log('')
    this.log('📊 Projects (Hierarchy View)')
    this.log('')

    // Build hierarchy and apply options
    const projectDiscoveryService = new ProjectDiscoveryService()
    const hierarchyNodes = projectDiscoveryService.buildProjectHierarchy(projects)
    const filteredNodes = projectDiscoveryService.applyHierarchyOptions(hierarchyNodes, options)

    // Flatten hierarchy for table display
    const flattenedProjects = projectDiscoveryService.flattenHierarchy(filteredNodes)

    // Display as table with level information
    this.displayHierarchyTable(flattenedProjects, config as ProjectCodeConfig)
  }

  /**
   * Display projects in table format
   */
  private displayProjectsTable(projects: ProjectInfo[], config: ProjectCodeConfig): void {
    const showDescriptions = config?.ui?.showDescriptions !== false
    const showTags = config?.ui?.showTags !== false

    // Calculate column widths
    const nameWidth = Math.max(...projects.map((p) => p.name.length), 4)
    const typeWidth = Math.max(...projects.map((p) => p.type.length), 4)
    const pathWidth = Math.min(60, Math.max(...projects.map((p) => this.getRelativePath(p.path).length), 4))

    // Header
    this.log('')
    this.log('📁 Projects')
    const totalWidth = nameWidth + typeWidth + pathWidth + (showDescriptions ? 15 : 0) + 6 // 6 for separators
    this.log(''.padEnd(totalWidth, '─'))

    const header = `${'Name'.padEnd(nameWidth)} │ ${'Type'.padEnd(typeWidth)} │ ${'Path'.padEnd(pathWidth)}${showDescriptions ? ' │ Description' : ''}`
    this.log(header)
    this.log(''.padEnd(totalWidth, '─'))

    // Rows
    for (const project of projects) {
      const relativePath = this.getRelativePath(project.path)
      const truncatedPath =
        relativePath.length > pathWidth ? '...' + relativePath.slice(-(pathWidth - 3)) : relativePath

      const row = `${project.name.padEnd(nameWidth)} │ ${project.type.padEnd(typeWidth)} │ ${truncatedPath.padEnd(pathWidth)}${showDescriptions && project.description ? ` │ ${project.description}` : ''}`
      this.log(row)

      // Show tags if enabled and available
      if (showTags && project.tags && project.tags.length > 0) {
        this.log(`${''.padEnd(nameWidth)}   ${''.padEnd(typeWidth)}   ${''.padEnd(pathWidth)}   🏷️  ${project.tags.join(', ')}`)
      }
    }

    this.log(''.padEnd(totalWidth, '─'))
    this.log(`Total: ${projects.length} projects`)
  }

  /**
   * Display projects in tree format
   */
  private displayProjectsTree(projects: ProjectInfo[], options: HierarchyDisplayOptions): void {
    this.log('')
    this.log('🌳 Projects (Tree View)')
    this.log('')

    // Build hierarchy
    const projectDiscoveryService = new ProjectDiscoveryService()
    const hierarchyNodes = projectDiscoveryService.buildProjectHierarchy(projects)

    // Apply parent filter if specified
    let filteredNodes = hierarchyNodes
    if (options.parentFilter) {
      filteredNodes = this.filterHierarchyByParent(hierarchyNodes, options.parentFilter)
    }

    // Apply depth limit if specified
    if (options.maxDepth !== undefined) {
      filteredNodes = this.limitHierarchyDepth(filteredNodes, options.maxDepth)
    }

    // Display tree
    for (const node of filteredNodes) {
      this.displayTreeNode(node, '', true)
    }

    this.log('')
    this.log(`Total: ${projects.length} projects`)
  }

  /**
   * Display a single tree node with proper indentation
   */
  private displayTreeNode(node: ProjectHierarchyNode, prefix: string, isLast: boolean): void {
    const connector = isLast ? '└── ' : '├── '
    const nextPrefix = prefix + (isLast ? '    ' : '│   ')

    // Display current node
    const { project } = node
    const levelIndicator = node.level > 0 ? `${'  '.repeat(node.level)}` : ''
    this.log(`${levelIndicator}${connector}${project.name}/ (${project.type})`)

    // Display children
    const children = node.children || []
    for (let i = 0; i < children.length; i++) {
      this.displayTreeNode(children[i], nextPrefix, i === children.length - 1)
    }
  }

  /**
   * Filter hierarchy nodes by parent directory
   */
  private filterHierarchyByParent(nodes: ProjectHierarchyNode[], parentFilter: string): ProjectHierarchyNode[] {
    const filtered: ProjectHierarchyNode[] = []

    for (const node of nodes) {
      if (node.project.path.startsWith(parentFilter) || parentFilter.startsWith(node.project.path)) {
        filtered.push(node)
      }
    }

    return filtered
  }

  /**
   * Flatten hierarchy for table display
   */
  private flattenHierarchy(node: ProjectHierarchyNode, result: ProjectInfo[]): void {
    result.push(node.project)

    const children = node.children || []
    for (const child of children) {
      this.flattenHierarchy(child, result)
    }
  }

  /**
   * Get relative path from user's home directory
   */
  private getRelativePath(absolutePath: string): string {
    return relative(process.env.HOME || '', absolutePath)
  }

  /**
   * Limit hierarchy depth
   */
  private limitHierarchyDepth(nodes: ProjectHierarchyNode[], maxDepth: number): ProjectHierarchyNode[] {
    const limited: ProjectHierarchyNode[] = []

    for (const node of nodes) {
      if (node.level <= maxDepth) {
        limited.push(node)
      }
    }

    return limited
  }
}
