/**
 * Initialize existing directories as projects with proper structure
 */

import { Args, Command, Flags } from '@oclif/core';
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

import { DirectoryManager } from '../../lib/directory-manager.js';
import { VSCodeService } from '../../lib/vscode-service.js';

/**
 * Init command class
 */
export default class ProjectInit extends Command {
  static args = {
    path: Args.string({
      description: 'Path to the directory to initialize (defaults to current directory)',
      required: false,
    }),
  };
static description = 'Initialize an existing directory as a project with proper structure';
static examples = [
    '<%= config.bin %> <%= command.id %> my-project',
    '<%= config.bin %> <%= command.id %> . --name "My Awesome Project"',
    '<%= config.bin %> <%= command.id %> ~/projects/my-app --type node --vscode',
    '<%= config.bin %> <%= command.id %> /path/to/project --description "A sample project"',
  ];
static flags = {
    description: Flags.string({
      char: 'd',
      description: 'Project description',
    }),
    help: Flags.help({
      char: 'h',
    }),
    name: Flags.string({
      char: 'n',
      description: 'Project name (defaults to directory name)',
    }),
    type: Flags.string({
      char: 't',
      description: 'Project type',
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
    vscode: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Open in VS Code after initialization',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectInit);

    try {
      // Initialize services
      const directoryManager = new DirectoryManager();
      const vscodeService = new VSCodeService();

      // Determine target path
      const targetPath = args.path ?? process.cwd();

      this.log(`🚀 Initializing project in: ${targetPath}`);

      // Validate target directory
      const validationResult = await directoryManager.validateProjectDirectory(targetPath);
      if (!validationResult.success) {
        this.error(`Directory validation failed: ${validationResult.error}`);
        return;
      }

      if (!validationResult.data!.canCreate && !validationResult.data!.exists) {
        this.error(`Cannot initialize project in non-existent directory: ${targetPath}`);
        return;
      }

      // Get project name from flag or directory name
      const projectName = flags.name || this.getDirectoryName(targetPath);

      if (!this.isValidProjectName(projectName)) {
        this.error(`Invalid project name: ${projectName}. Project names can only contain letters, numbers, hyphens, and underscores.`);
        return;
      }

      // Ensure directory exists
      const ensureResult = await directoryManager.ensureDirectory(targetPath);
      if (!ensureResult.success) {
        this.error(`Failed to ensure directory exists: ${ensureResult.error}`);
        return;
      }

      const projectPath = ensureResult.data!;

      // Check if project is already initialized
      const isAlreadyInitialized = await this.isProjectInitialized(projectPath);

      if (isAlreadyInitialized && !flags.force) {
        this.error(`Project appears to already be initialized at: ${projectPath}. Use --force to reinitialize.`);
        return;
      }

      // Create project files
      await this.createProjectFiles(projectPath, projectName, flags.description, flags.type);

      // Initialize git repository if not exists
      await this.initializeGitRepository(projectPath);

      this.log(`✅ Successfully initialized project: ${projectName}`);
      this.log(`   Location: ${projectPath}`);

      // Open in VS Code if requested
      if (flags.vscode) {
        this.log(`💻 Opening in VS Code...`);

        const projectInfo = {
          lastModified: new Date(),
          name: projectName,
          path: projectPath,
          type: (flags.type as 'angular' | 'clojure' | 'cpp' | 'csharp' | 'css' | 'django' | 'docker' | 'dotnet' | 'express' | 'fastapi' | 'flask' | 'gatsby' | 'go' | 'haskell' | 'html' | 'java' | 'javascript' | 'kotlin' | 'kubernetes' | 'lua' | 'matlab' | 'nestjs' | 'nextjs' | 'nodejs' | 'nuxtjs' | 'perl' | 'php' | 'python' | 'r' | 'react' | 'ruby' | 'rust' | 'scala' | 'shell' | 'spring' | 'svelte' | 'swift' | 'terraform' | 'typescript' | 'unknown' | 'vue') || 'unknown',
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
      this.log('🎉 Project initialized successfully!');
      this.log('');
      this.log('Next steps:');
      this.log(`  cd ${projectPath}`);

      if (!flags.vscode) {
        this.log(`  code ${projectPath}  # Open in VS Code`);
      }

      this.log(`  # Start developing your project`);

    } catch (error) {
      this.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create Go project files
   */
  private async createGoProjectFiles(projectPath: string, projectName: string, _description?: string): Promise<void> {

    const goModContent = `module ${projectName}

go 1.19
`;

    await fs.writeFile(join(projectPath, 'go.mod'), goModContent, 'utf8');

    const mainGoContent = `package main

import "fmt"

func main() {
    fmt.Printf("Hello, ${projectName}!\\n")
    fmt.Println("Your project is ready to go! 🚀")
}
`;

    await fs.writeFile(join(projectPath, 'main.go'), mainGoContent, 'utf8');
  }

  /**
   * Create Node.js project files
   */
  private async createNodejsProjectFiles(projectPath: string, projectName: string, _description?: string): Promise<void> {

    const packageJsonContent = {
      author: '',
      description: _description || 'A project initialized with Project Code CLI',
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

    const indexJsContent = `/**
 * ${projectName}
 * A project initialized with Project Code CLI
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
  }

  /**
   * Create project files
   */
  private async createProjectFiles(
    projectPath: string,
    projectName: string,
    _description?: string,
    type?: string,
  ): Promise<void> {

    try {
      // Create README.md
      const readmeContent = this.generateReadmeContent(projectName, _description, type);
      await fs.writeFile(join(projectPath, 'README.md'), readmeContent, 'utf8');

      // Create .gitignore
      const gitignoreContent = this.generateGitignoreContent(type);
      await fs.writeFile(join(projectPath, '.gitignore'), gitignoreContent, 'utf8');

      // Create project-specific files based on type
      switch (type) {
      case 'go': {
        await this.createGoProjectFiles(projectPath, projectName, _description);
      
      break;
      }
 
      case 'javascript':
      case 'nodejs':
      case 'typescript': {
        await this.createNodejsProjectFiles(projectPath, projectName, _description);
      
      break;
      }

      case 'python': {
        await this.createPythonProjectFiles(projectPath, projectName, _description);
      
      break;
      }

      case 'rust': {
        await this.createRustProjectFiles(projectPath, projectName, _description);
      
      break;
      }
      // No default
      }

      this.log(`   📄 Created README.md`);
      this.log(`   📄 Created .gitignore`);

      if (type && ['go', 'javascript', 'nodejs', 'python', 'rust', 'typescript'].includes(type)) {
        this.log(`   📄 Created ${type}-specific project files`);
      }

    } catch (error) {
      this.warn(`Failed to create some project files: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create Python project files
   */
  private async createPythonProjectFiles(projectPath: string, projectName: string, _description?: string): Promise<void> {

    // Create requirements.txt
    await fs.writeFile(join(projectPath, 'requirements.txt'), '# Add your Python dependencies here\n', 'utf8');

    // Create main.py
    const mainPyContent = `#!/usr/bin/env python3
"""
${projectName}
A project initialized with Project Code CLI
"""

def main():
    """Main function"""
    print(f"Hello, {projectName}!")
    print("Your project is ready to go! 🚀")

if __name__ == "__main__":
    main()
`;

    await fs.writeFile(join(projectPath, 'main.py'), mainPyContent, 'utf8');

    // Create setup.py
    const setupPyContent = `from setuptools import setup, find_packages

setup(
    name="${projectName}",
    version="0.1.0",
    description="${_description || 'A project initialized with Project Code CLI'}",
    author="",
    packages=find_packages(),
    python_requires=">=3.6",
)
`;

    await fs.writeFile(join(projectPath, 'setup.py'), setupPyContent, 'utf8');
  }

  /**
   * Create Rust project files
   */
  private async createRustProjectFiles(projectPath: string, projectName: string, _description?: string): Promise<void> {

    const cargoTomlContent = `[package]
name = "${projectName}"
version = "0.1.0"
edition = "2021"
description = "${_description || 'A project initialized with Project Code CLI'}"
author = [""]

[dependencies]
`;

    await fs.writeFile(join(projectPath, 'Cargo.toml'), cargoTomlContent, 'utf8');

    const mainRsContent = `fn main() {
    println!("Hello, ${projectName}!");
    println!("Your project is ready to go! 🚀");
}
`;

    await fs.mkdir(join(projectPath, 'src'), { recursive: true });
    await fs.writeFile(join(projectPath, 'src', 'main.rs'), mainRsContent, 'utf8');
  }

  /**
   * Generate .gitignore content
   */
  private generateGitignoreContent(type?: string): string {
    const basePatterns = `# Dependencies
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

# Coverage directory
coverage/

# Temporary folders
tmp/
temp/
`;

    // Add type-specific patterns
    switch (type) {
      case 'go': {
        return basePatterns + `
# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
go.work
`;
      }

      case 'python': {
        return basePatterns + `
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/
`;
      }

      case 'rust': {
        return basePatterns + `
# Rust
/target/
Cargo.lock
`;
      }

      default: {
        return basePatterns;
      }
    }
  }

  /**
   * Generate README content
   */
  private generateReadmeContent(projectName: string, description?: string, type?: string): string {
    const typeTitle = type ? ` (${type})` : '';

    return `# ${projectName}${typeTitle}

${description || 'A project initialized with Project Code CLI'}

## Getting Started

This project was initialized with [Project Code CLI](https://github.com/qubitquilt/project-code).

${type ? `**Project Type:** ${type}` : ''}

## Installation

\`\`\`bash
# Navigate to project directory
cd ${projectName}

# Install dependencies (if applicable)
${this.getInstallCommand(type)}
\`\`\`

## Development

\`\`\`bash
# Start development
${this.getDevCommand(type)}
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
`;
  }

  /**
   * Get development command for project type
   */
  private getDevCommand(type?: string): string {
    switch (type) {
      case 'go': {
        return 'go run .';
      }

      case 'javascript':
      case 'nodejs':
      case 'typescript': {
        return 'npm run dev';
      }

      case 'python': {
        return 'python main.py';
      }

      case 'rust': {
        return 'cargo run';
      }

      default: {
        return '# Start development based on your project type';
      }
    }
  }

  /**
   * Get directory name from path
   */
  private getDirectoryName(path: string): string {
    const parts = path.split(/[/\\]/);
    return parts.at(-1) || 'project';
  }

  /**
   * Get install command for project type
   */
  private getInstallCommand(type?: string): string {
    switch (type) {
      case 'go': {
        return 'go mod download';
      }

      case 'javascript':
      case 'nodejs':
      case 'typescript': {
        return 'npm install';
      }

      case 'python': {
        return 'pip install -r requirements.txt';
      }

      case 'rust': {
        return 'cargo build';
      }

      default: {
        return '# Install dependencies based on your project type';
      }
    }
  }

  /**
   * Initialize git repository
   */
  private async initializeGitRepository(projectPath: string): Promise<void> {

    try {
      // Check if git is already initialized
      try {
        execSync('git rev-parse --git-dir', { cwd: projectPath, stdio: 'pipe' });
        this.log(`   📦 Git repository already initialized`);
        return;
      } catch {
        // Git not initialized, continue
      }

      // Initialize git repository
      execSync('git init', { cwd: projectPath, stdio: 'inherit' });

      // Add all files
      execSync('git add .', { cwd: projectPath, stdio: 'inherit' });

      // Create initial commit
      execSync('git commit -m "Initial commit: Project initialized with Project Code CLI"', {
        cwd: projectPath,
        stdio: 'inherit',
      });

      this.log(`   📦 Initialized git repository`);
    } catch (error) {
      this.warn(`Failed to initialize git repository: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if project is already initialized
   */
  private async isProjectInitialized(projectPath: string): Promise<boolean> {

    try {
      // Check for common project files
      const indicators = [
        'README.md',
        'package.json',
        'requirements.txt',
        'Cargo.toml',
        'go.mod',
        'composer.json',
        '.gitignore',
      ];

      const checks = indicators.map(indicator => fs.access(join(projectPath, indicator)).catch(() => false));
      const results = await Promise.all(checks);
      return results.some(result => result !== false);
    } catch {
      return false;
    }
  }

  /**
   * Validate project name format
   */
  private isValidProjectName(name: string): boolean {
    return /^[a-zA-Z0-9._-]+$/.test(name) && name.length > 0 && name.length <= 100;
  }
}