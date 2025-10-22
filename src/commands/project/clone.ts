/**
 * Clone GitHub repositories with project tag support
 */

import { Args, Command, Flags } from '@oclif/core';

import { DirectoryManager } from '../../lib/directory-manager.js';
import { GitHubService } from '../../lib/github-service.js';
import { ProjectParser } from '../../lib/project-parser.js';
import { VSCodeService } from '../../lib/vscode-service.js';

/**
 * Clone command class
 */
export default class ProjectClone extends Command {
  static args = {
    projectTag: Args.string({
      description: 'Project tag in format "owner/repo" or "platform:owner/repo"',
      required: true,
    }),
  };
static description = 'Clone a GitHub repository using project tag format';
static examples = [
    '<%= config.bin %> <%= command.id %> qubitquilt/project-code',
    '<%= config.bin %> <%= command.id %> github:qubitquilt/project-code',
    '<%= config.bin %> <%= command.id %> https://github.com/qubitquilt/project-code',
    '<%= config.bin %> <%= command.id %> qubitquilt/project-code --branch main',
    '<%= config.bin %> <%= command.id %> qubitquilt/project-code --depth 1',
    '<%= config.bin %> <%= command.id %> qubitquilt/project-code --root ~/custom/code',
    '<%= config.bin %> <%= command.id %> qubitquilt/project-code --vscode',
  ];
static flags = {
    branch: Flags.string({
      char: 'b',
      description: 'Branch to clone',
    }),
    depth: Flags.integer({
      char: 'd',
      description: 'Clone depth (shallow clone)',
      helpValue: '1',
    }),
    help: Flags.help({
      char: 'h',
    }),
    root: Flags.string({
      char: 'r',
      description: 'Custom root directory for project',
    }),
    vscode: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Open in VS Code after cloning',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectClone);

    try {
      // Initialize services
      const githubService = new GitHubService();
      const projectParser = new ProjectParser();
      const directoryManager = new DirectoryManager();
      const vscodeService = new VSCodeService();

      // Parse and validate project tag
      this.log(`🔍 Parsing project tag: ${args.projectTag}`);

      const parseResult = projectParser.parseProjectTag(args.projectTag);
      if (!parseResult.success) {
        this.error(`Invalid project tag: ${parseResult.error}`);
        return;
      }

      const { owner, platform, repo } = parseResult.data!;

      // Check platform support
      if (platform !== 'github') {
        this.error(`Platform "${platform}" is not yet supported. Currently only GitHub is supported.`);
        return;
      }

      // Validate project path
      this.log(`📁 Resolving project path...`);

      const pathResult = projectParser.parseProjectPath({
        customRootFolder: flags.root,
        projectTag: args.projectTag,
      });

      if (!pathResult.success) {
        this.error(`Failed to resolve project path: ${pathResult.error}`);
        return;
      }

      const { absolutePath, exists } = pathResult.data!;

      // Check if project already exists
      if (exists) {
        this.error(`Project already exists at: ${absolutePath}`);
        return;
      }

      // Validate directory can be created
      const validationResult = await directoryManager.validateProjectDirectory(absolutePath);
      if (!validationResult.success) {
        this.error(`Directory validation failed: ${validationResult.error}`);
        return;
      }

      if (!validationResult.data!.canCreate) {
        this.error(`Cannot create project directory: ${validationResult.data!.reason}`);
        return;
      }

      // Prepare clone options
      const cloneOptions = {
        branch: flags.branch,
        depth: flags.depth,
        projectTag: args.projectTag as string,
      };

      // Perform clone operation
      this.log(`🚀 Cloning repository ${owner}/${repo}...`);
      this.log(`   Target: ${absolutePath}`);

      const cloneResult = await githubService.cloneRepository(cloneOptions);

      if (!cloneResult.success) {
        this.error(`Failed to clone repository: ${cloneResult.error}`);
        return;
      }

      const clonedPath = cloneResult.data!;
      this.log(`✅ Successfully cloned ${args.projectTag} to ${clonedPath}`);

      // Open in VS Code if requested
      if (flags.vscode) {
        this.log(`💻 Opening in VS Code...`);

        // Create a minimal ProjectInfo object for the cloned project
        const projectInfo = {
          lastModified: new Date(),
          name: repo,
          path: clonedPath,
          type: 'unknown' as const,
        };

        const vscodeResult = await vscodeService.openProject(projectInfo);
        if (vscodeResult.success) {
          this.log(`✅ Opened ${clonedPath} in VS Code`);
        } else {
          this.warn(`Failed to open in VS Code: ${vscodeResult.error}`);
        }
      }

      // Show next steps
      this.log('');
      this.log('🎉 Project cloned successfully!');
      this.log('');
      this.log('Next steps:');
      this.log(`  cd ${clonedPath}`);

      if (!flags.vscode) {
        this.log(`  code ${clonedPath}  # Open in VS Code`);
      }

      this.log(`  # Start working on your project`);

    } catch (error) {
      this.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}