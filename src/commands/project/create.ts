/**
 * Create new GitHub repositories
 */

import { Args, Command, Flags } from '@oclif/core';
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

import { DirectoryManager } from '../../lib/directory-manager.js';
import { GitHubService } from '../../lib/github-service.js';
import { VSCodeService } from '../../lib/vscode-service.js';

/**
 * Create command class
 */
export default class ProjectCreate extends Command {
  static args = {
    name: Args.string({
      description: 'Name of the repository/project to create',
      required: true,
    }),
  };
static description = 'Create a new GitHub repository and optionally initialize locally';
static examples = [
    '<%= config.bin %> <%= command.id %> my-awesome-project',
    '<%= config.bin %> <%= command.id %> my-awesome-project --description "An awesome project"',
    '<%= config.bin %> <%= command.id %> my-awesome-project --private',
    '<%= config.bin %> <%= command.id %> my-awesome-project --init',
    '<%= config.bin %> <%= command.id %> my-awesome-project --github --init --vscode',
  ];
static flags = {
    description: Flags.string({
      char: 'd',
      description: 'Repository description',
    }),
    github: Flags.boolean({
      char: 'g',
      default: true,
      description: 'Create repository on GitHub',
    }),
    help: Flags.help({
      char: 'h',
    }),
    init: Flags.boolean({
      char: 'i',
      default: false,
      description: 'Initialize local project structure',
    }),
    private: Flags.boolean({
      char: 'p',
      default: false,
      description: 'Create private repository',
    }),
    vscode: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Open in VS Code after creation',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectCreate);

    try {
      // Initialize services
      const githubService = new GitHubService();
      const directoryManager = new DirectoryManager();
      const vscodeService = new VSCodeService();

      const projectName = args.name;

      // Validate project name
      if (!this.isValidProjectName(projectName)) {
        this.error(`Invalid project name: ${projectName}. Project names can only contain letters, numbers, hyphens, and underscores.`);
        return;
      }

      this.log(`🚀 Creating project: ${projectName}`);

      let createdRepository = null;

      // Create GitHub repository if requested
      if (flags.github) {
        this.log(`📡 Creating GitHub repository...`);

        const createResult = await githubService.createRepository({
          description: flags.description,
          name: projectName,
          private: flags.private,
        });

        if (!createResult.success) {
          this.error(`Failed to create GitHub repository: ${createResult.error}`);
          return;
        }

        createdRepository = createResult.data!;
        this.log(`✅ Created GitHub repository: ${createdRepository.full_name}`);
        this.log(`   URL: ${createdRepository.html_url}`);
        this.log(`   Clone URL: ${createdRepository.clone_url}`);
      }

      // Initialize local project structure if requested
      if (flags.init) {
        this.log(`📁 Initializing local project structure...`);

        // Create project directory
        const projectPath = await this.createProjectStructure(projectName, directoryManager);

        // Initialize git repository if GitHub repo was created
        if (createdRepository) {
          await this.initializeGitRepository(projectPath, createdRepository.clone_url);
        }

        // Create basic project files
        await this.createProjectFiles(projectPath, projectName, flags.description);

        this.log(`✅ Initialized local project at: ${projectPath}`);

        // Open in VS Code if requested
        if (flags.vscode) {
          this.log(`💻 Opening in VS Code...`);

          const projectInfo = {
            lastModified: new Date(),
            name: projectName,
            path: projectPath,
            type: 'unknown' as const,
          };

          const vscodeResult = await vscodeService.openProject(projectInfo);
          if (vscodeResult.success) {
            this.log(`✅ Opened ${projectPath} in VS Code`);
          } else {
            this.warn(`Failed to open in VS Code: ${vscodeResult.error}`);
          }
        }

        // Show next steps
        this.log('');
        this.log('🎉 Project created successfully!');
        this.log('');
        this.log('Next steps:');
        this.log(`  cd ${projectPath}`);

        if (createdRepository) {
          this.log(`  git remote add origin ${createdRepository.clone_url}`);
          this.log(`  git push -u origin main`);
        }

        if (!flags.vscode) {
          this.log(`  code ${projectPath}  # Open in VS Code`);
        }

        this.log(`  # Start developing your project`);
      } else {
        this.log('');
        this.log('🎉 Project created successfully!');
        this.log('');
        if (createdRepository) {
          this.log('To clone and start working locally:');
          this.log(`  project-code project clone ${createdRepository.full_name}`);
        }
      }

    } catch (error) {
      this.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create basic project files
   */
  private async createProjectFiles(projectPath: string, projectName: string, _description?: string): Promise<void> {

    try {
      // Create README.md
      const readmeContent = `# ${projectName}

${_description || 'A new project created with Project Code CLI'}

## Getting Started

This project was created with [Project Code CLI](https://github.com/qubitquilt/project-code).

## Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd ${projectName}

# Install dependencies (if applicable)
# npm install
# # or
# yarn install
\`\`\`

## Development

\`\`\`bash
# Start development server (if applicable)
# npm run dev
# # or
# yarn dev
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
`;

      await fs.writeFile(join(projectPath, 'README.md'), readmeContent, 'utf8');

      // Create .gitignore
      const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/
`;

      await fs.writeFile(join(projectPath, '.gitignore'), gitignoreContent, 'utf8');

      // Create basic package.json for Node.js projects
      const packageJsonContent = {
        author: '',
        description: _description || 'A new project created with Project Code CLI',
        keywords: ['project-code'],
        license: 'MIT',
        main: 'index.js',
        name: projectName,
        scripts: {
          dev: 'nodemon index.js',
          start: 'node index.js',
          test: 'jest',
        },
        version: '0.1.0',
      };

      await fs.writeFile(
        join(projectPath, 'package.json'),
        JSON.stringify(packageJsonContent, null, 2),
        'utf8'
      );

      // Create basic index.js
      const indexJsContent = `/**
 * ${projectName}
 * A new project created with Project Code CLI
 */

console.log('Hello, ${projectName}!');
console.log('Your project is ready to go! 🚀');

// Add your code here
function main() {
  console.log('Welcome to ${projectName}!');
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { main };
`;

      await fs.writeFile(join(projectPath, 'index.js'), indexJsContent, 'utf8');

    } catch (error) {
      this.warn(`Failed to create project files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create local project directory structure
   */
  private async createProjectStructure(projectName: string, directoryManager: DirectoryManager): Promise<string> {
    const projectPath = await directoryManager.createProjectHierarchy('local', projectName);

    if (!projectPath.success) {
      throw new Error(`Failed to create project directory: ${projectPath.error}`);
    }

    return projectPath.data!;
  }

  /**
   * Initialize git repository
   */
  private async initializeGitRepository(projectPath: string, _remoteUrl?: string): Promise<void> {

    try {
      // Initialize git repository
      execSync('git init', { cwd: projectPath, stdio: 'inherit' });

      // Add remote if provided
      if (_remoteUrl) {
        execSync(`git remote add origin ${_remoteUrl}`, { cwd: projectPath, stdio: 'inherit' });
      }

      // Create initial commit
      execSync('git add .', { cwd: projectPath, stdio: 'inherit' });
      execSync('git commit -m "Initial commit"', { cwd: projectPath, stdio: 'inherit' });
    } catch (error) {
      this.warn(`Failed to initialize git repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate project name format
   */
  private isValidProjectName(name: string): boolean {
    // GitHub repository name rules
    return /^[a-zA-Z0-9._-]+$/.test(name) && name.length > 0 && name.length <= 100;
  }
}