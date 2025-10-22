import { Args, Command, Flags } from '@oclif/core';

import { ConfigManager } from '../../lib/config.js';
import { ProjectDiscoveryService } from '../../lib/project-discovery.js';
import { VSCodeService } from '../../lib/vscode-service.js';
import { ProjectInfo, ProjectType } from '../../types/index.js';

/**
 * Open projects in VS Code
 */
export default class ProjectOpen extends Command {
  static args = {
    project: Args.string({
      description: 'Specific project name or path to open',
      required: false,
    }),
  };
static description = 'Open projects in VS Code';
static examples = [
    '<%= config.bin %> <%= command.id %> my-project',
    '<%= config.bin %> <%= command.id %> --all',
    '<%= config.bin %> <%= command.id %> --type javascript',
    '<%= config.bin %> <%= command.id %> --search "react-app"',
    '<%= config.bin %> <%= command.id %> --workspace "my-workspace"',
  ];
static flags = {
    all: Flags.boolean({
      char: 'a',
      description: 'Open all discovered projects as a workspace',
      exclusive: ['type', 'search'],
    }),
    'new-window': Flags.boolean({
      char: 'n',
      default: true,
      description: 'Open in a new VS Code window',
    }),
    search: Flags.string({
      char: 's',
      description: 'Open projects matching search query',
    }),
    type: Flags.string({
      char: 't',
      description: 'Open all projects of specified type',
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
    workspace: Flags.string({
      char: 'w',
      description: 'Name for the workspace when opening multiple projects',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectOpen);

    try {
      // Initialize services
      const configManager = ConfigManager.getInstance();
      const projectDiscovery = new ProjectDiscoveryService();
      const vscodeService = new VSCodeService();

      // Load configuration
      const configResult = configManager.loadConfig();
      if (!configResult.success) {
        this.error(`Failed to load configuration: ${configResult.error}`);
        return;
      }

      // Check VS Code availability
      const vscodeDetectResult = await vscodeService.detectVSCode();
      if (!vscodeDetectResult.success) {
        this.error('VS Code not detected. Please install VS Code to use this feature.');
        return;
      }

      this.log(`💡 VS Code detected (${vscodeDetectResult.data!.version})`);

      // Discover projects
      this.log('🔍 Discovering projects...');
      const projects = await projectDiscovery.discoverProjects();

      if (projects.length === 0) {
        this.log('No projects found.');
        return;
      }

      // Determine which projects to open
      let projectsToOpen: ProjectInfo[] = [];

      if (flags.all) {
        // Open all projects as workspace
        projectsToOpen = projects;
        this.log(`Opening all ${projects.length} projects as workspace...`);
      } else if (flags.type) {
        // Filter by type
        projectsToOpen = projectDiscovery.filterProjectsByType(projects, [flags.type as ProjectType]);
        this.log(`Opening ${projectsToOpen.length} ${flags.type} projects...`);
      } else if (flags.search) {
        // Filter by search
        projectsToOpen = projectDiscovery.searchProjects(projects, flags.search);
        this.log(`Opening ${projectsToOpen.length} projects matching "${flags.search}"...`);
      } else if (args.project) {
        // Find specific project
        const specificProject = this.findProjectByNameOrPath(projects, args.project);
        if (!specificProject) {
          this.error(`Project not found: ${args.project}`);
          return;
        }

        projectsToOpen = [specificProject];
        this.log(`Opening project: ${specificProject.name}`);
      } else {
        // Interactive selection (fallback)
        projectsToOpen = await this.selectProjectsInteractively(projects);
      }

      if (projectsToOpen.length === 0) {
        this.log('No projects to open.');
        return;
      }

      // Open projects
      if (projectsToOpen.length === 1) {
        // Open single project
        const result = await vscodeService.openProject(projectsToOpen[0]);
        if (!result.success) {
          this.error(`Failed to open project: ${result.error}`);
          return;
        }

        this.log(`✅ Opened "${projectsToOpen[0].name}" in VS Code`);
      } else {
        // Open as workspace
        const result = await vscodeService.openWorkspace(projectsToOpen, flags.workspace);
        if (!result.success) {
          this.error(`Failed to open workspace: ${result.error}`);
          return;
        }

        this.log(`✅ Opened workspace with ${projectsToOpen.length} projects in VS Code`);
      }

      // Show helpful information
      if (projectsToOpen.length > 1) {
        this.log(`\n📋 Workspace contains:`);
        for (const project of projectsToOpen) {
          this.log(`  • ${project.name} (${project.type})`);
        }
      }

    } catch (error) {
      this.error(`Failed to open projects: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Find project by name or path
   */
  private findProjectByNameOrPath(projects: ProjectInfo[], query: string): null | ProjectInfo {
    // Exact match first
    let project = projects.find(p => p.name === query || p.path === query);
    if (project) {
      return project;
    }

    // Partial match
    project = projects.find(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.path.toLowerCase().includes(query.toLowerCase())
    );

    return project || null;
  }

  /**
   * Interactive project selection (placeholder for future implementation)
   */
  private async selectProjectsInteractively(projects: ProjectInfo[]): Promise<ProjectInfo[]> {
    // For now, just open the first project as fallback
    // In the future, this could use inquirer for interactive selection
    this.log('No specific project selected. Use --all, --type, --search, or specify a project name.');
    this.log('Opening the first discovered project...');

    return projects.slice(0, 1);
  }
}