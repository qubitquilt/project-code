/**
 * Initialize existing directories as projects with proper structure
 */

import { Args, Command, Flags } from '@oclif/core';
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

import { AuthService } from '../../lib/auth-service.js';
import { DirectoryManager } from '../../lib/directory-manager.js';
import { VSCodeService } from '../../lib/vscode-service.js';
import { AuthCredentials, AuthProvider } from '../../types/auth.js';

/**
 * Init command class
 */
export default class ProjectInit extends Command {
  static args = {
    path: Args.string({
      description: 'Path to the directory to initialize (defaults to current directory)',
      required: false,
    }),
  }
  static description = 'Initialize an existing directory as a project with proper structure'
  static examples = [
    '<%= config.bin %> <%= command.id %> my-project',
    '<%= config.bin %> <%= command.id %> . --name "My Awesome Project"',
    '<%= config.bin %> <%= command.id %> ~/projects/my-app --type node --vscode',
    '<%= config.bin %> <%= command.id %> /path/to/project --description "A sample project"',
  ]
  static flags = {
    // Authentication flags
    auth: Flags.boolean({
      char: 'a',
      default: false,
      description: 'Enable authentication for the project',
    }),
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
    provider: Flags.string({
      char: 'p',
      description: 'Authentication provider (github, gitlab, bitbucket, local)',
      options: ['github', 'gitlab', 'bitbucket', 'local'],
    }),
    token: Flags.string({
      char: 'k',
      description: 'Personal access token for authentication',
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
    username: Flags.string({
      char: 'u',
      description: 'Username for authentication',
    }),
    vscode: Flags.boolean({
      char: 'v',
      default: false,
      description: 'Open in VS Code after initialization',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(ProjectInit)

    try {
      // Initialize services
      const directoryManager = new DirectoryManager()
      const vscodeService = new VSCodeService()

      // ...

      // Pre-auth steps
      const {credentials, provider} = await this.getAuthenticationCredentials()

      // Determine target path
      const targetPath = args.path ?? process.cwd()

      this.log(`🚀 Initializing project in: ${targetPath}`)

      // Validate target directory
      const validationResult = await directoryManager.validateProjectDirectory(targetPath)
      if (!validationResult.success) {
        this.error(`Directory validation failed: ${validationResult.error}`)
        return
      }

      if (!validationResult.data!.canCreate && !validationResult.data!.exists) {
        this.error(`Cannot initialize project in non-existent directory: ${targetPath}`)
        return
      }

      // Get project name from flag or directory name
      const projectName = flags.name || this.getDirectoryName(targetPath)

      if (!this.isValidProjectName(projectName)) {
        this.error(
          `Invalid project name: ${projectName}. Project names can only contain letters, numbers, hyphens, and underscores.`,
        )
        return
      }

      // Ensure directory exists
      const ensureResult = await directoryManager.ensureDirectory(targetPath)
      if (!ensureResult.success) {
        this.error(`Failed to ensure directory exists: ${ensureResult.error}`)
        return
      }

      const projectPath = ensureResult.data!

      // Check if project is already initialized
      const isAlreadyInitialized = await this.isProjectInitialized(projectPath)

      if (isAlreadyInitialized && !flags.force) {
        this.error(`Project appears to already be initialized at: ${projectPath}. Use --force to reinitialize.`)
        return
      }

      // Create project files
      await this.createProjectFiles(projectPath, projectName, flags.description, flags.type)

      // Initialize git repository if not exists
      await this.initializeGitRepository(projectPath)

      this.log(`✅ Successfully initialized project: ${projectName}`)
      this.log(`   Location: ${projectPath}`)

      // Open in VS Code if requested
      if (flags.vscode) {
        this.log(`💻 Opening in VS Code...`)

        const projectInfo = {
          lastModified: new Date(),
          name: projectName,
          path: projectPath,
          type:
            (flags.type as
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
              | 'vue') || 'unknown',
        }

        const vscodeResult = await vscodeService.openProject(projectInfo)
        if (vscodeResult.success) {
          this.log(`✅ Opened ${projectPath} in VS Code`)
        } else {
          this.warn(`Failed to open in VS Code: ${vscodeResult.error}`)
        }
      }

      // Show next steps
      this.log('')
      this.log('🎉 Project initialized successfully!')
      this.log('')
      this.log('Next steps:')
      this.log(`  cd ${projectPath}`)

      if (!flags.vscode) {
        this.log(`  code ${projectPath}  # Open in VS Code`)
      }

      this.log(`  # Start developing your project`)
    } catch (error) {
      this.error(`Unexpected error: ${(error as any).message ?? String(error)}`)
    }
  }

  /**
   * Create Go project files
   */
  private async createGoProjectFiles(projectPath: string, projectName: string, _description?: string): Promise<void> {
    const goModContent = `module ${projectName}

go 1.19
`

    await fs.writeFile(join(projectPath, 'go.mod'), goModContent, 'utf8')

    const mainGoContent = `package main

import "fmt"

func main() {
    fmt.Printf("Hello, ${projectName}!\n")
    fmt.Println("Your project is ready to go! 🚀")
}
`

    await fs.writeFile(join(projectPath, 'main.go'), mainGoContent, 'utf8')
  }

  /**
   * Create Node.js project files
   */
  private async createNodejsProjectFiles(
    projectPath: string,
    projectName: string,
    _description?: string,
  ): Promise<void> {
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
    }

    await fs.writeFile(join(projectPath, 'package.json'), JSON.stringify(packageJsonContent, null, 2), 'utf8')

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
`

    await fs.writeFile(join(projectPath, 'index.js'), indexJsContent, 'utf8')
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
      const readmeContent = this.generateReadmeContent(projectName, _description, type)
      await fs.writeFile(join(projectPath, 'README.md'), readmeContent, 'utf8')

      // Create .gitignore
      const gitignoreContent = this.generateGitignoreContent(type)
      await fs.writeFile(join(projectPath, '.gitignore'), gitignoreContent, 'utf8')

      // Create project-specific files based on type
      switch (type) {
        case 'go': {
          await this.createGoProjectFiles(projectPath, projectName, _description)

          break
        }

        case 'javascript':
        case 'nodejs':
        case 'typescript': {
          await this.createNodejsProjectFiles(projectPath, projectName, _description)

          break
        }

        case 'python': {
          await this.createPythonProjectFiles(projectPath, projectName, _description)

          break
        }

        case 'rust': {
          await this.createRustProjectFiles(projectPath, projectName, _description)

          break
        }
        // No default
      }

      this.log(`   📄 Created README.md`)
      this.log(`   📄 Created .gitignore`)

      if (type && ['go', 'javascript', 'nodejs', 'python', 'rust', 'typescript'].includes(type)) {
        this.log(`   📄 Created ${type}-specific project files`)
      }
    } catch (error) {
      this.warn(`Failed to create some project files: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Create Python project files
   */
  private async createPythonProjectFiles(
    projectPath: string,
    projectName: string,
    _description?: string,
  ): Promise<void> {
    // Create requirements.txt
    await fs.writeFile(join(projectPath, 'requirements.txt'), '# Add your Python dependencies here\n', 'utf8')

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
`

    await fs.writeFile(join(projectPath, 'main.py'), mainPyContent, 'utf8')

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
`

    await fs.writeFile(join(projectPath, 'setup.py'), setupPyContent, 'utf8')
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
`

    await fs.writeFile(join(projectPath, 'Cargo.toml'), cargoTomlContent, 'utf8')

    const mainRsContent = `fn main() {
    println!("Hello, ${projectName}!");
    println!("Your project is ready to go! 🚀");
}
`

    await fs.mkdir(join(projectPath, 'src'), {recursive: true})
    await fs.writeFile(join(projectPath, 'src', 'main.rs'), mainRsContent, 'utf8')
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
`

    // Add type-specific patterns
    switch (type) {
      case 'go': {
        return (
          basePatterns +
          `
# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
go.work
`
        )
      }

      case 'python': {
        return (
          basePatterns +
          `
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
`
        )
      }

      case 'rust': {
        return (
          basePatterns +
          `
# Rust
/target/
Cargo.lock
`
        )
      }

      default: {
        return basePatterns
      }
    }
  }

  /**
   * Generate README content
   */
  private generateReadmeContent(projectName: string, description?: string, type?: string): string {
    const typeTitle = type ? ` (${type})` : ''

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
`
  }

  /**
   * Get authentication credentials based on flags and user choice
   */
  private async getAuthenticationCredentials(): Promise<{
    credentials: AuthCredentials | null
    provider: AuthProvider | null
  }> {
    const {flags} = await this.parse(ProjectInit)

    // Check if authentication is requested
    if (!flags.auth && !flags.token && !flags.provider) {
      // No authentication requested
      return {credentials: null, provider: null}
    }

    // Initialize auth service
    const authService = new AuthService()

    // If direct authentication with token is provided
    if (flags.token && flags.provider) {
      const provider = flags.provider as AuthProvider

      // Validate provider
      if (!['bitbucket', 'github', 'gitlab', 'local'].includes(provider)) {
        this.error(`Invalid provider: ${provider}. Supported providers: github, gitlab, bitbucket, local`)
        return {credentials: null, provider: null}
      }

      try {
        // Create credentials object
        const credentials: AuthCredentials = {
          personalAccessToken: flags.token,
          username: flags.username,
        }

        // For local provider, skip validation
        if (provider === 'local') {
          this.log('✅ Using local authentication')
          return {credentials, provider}
        }

        // Validate token with provider
        this.log(`🔐 Validating ${provider} token...`)

        const authResult = await authService.authenticate(provider, credentials, {
          suppressConsoleOutput: false,
        })

        if (!authResult.success) {
          this.error(`Authentication failed: ${authResult.error}`)
          return {credentials: null, provider: null}
        }

        this.log(`✅ Successfully authenticated with ${provider}`)
        return {credentials, provider}
      } catch (error) {
        this.error(`Authentication error: ${error instanceof Error ? error.message : String(error)}`)
        return {credentials: null, provider: null}
      }
    }

    // Interactive authentication mode
    if (flags.auth) {
      this.log('🔐 Starting interactive authentication...')

      try {
        // For interactive mode, we'll use the AuthWizard
        // Since AuthWizard is a React component that requires Ink (terminal UI),
        // we need to handle this differently in a CLI command context

        this.log('❓ Interactive authentication requires a terminal UI.')
        this.log('💡 For now, please use direct authentication with --token and --provider flags.')
        this.log('')
        this.log('Example:')
        this.log('  project-code project init . --auth --provider github --token ghp_your_token')
        this.log('')
        this.log('Or run the auth wizard separately:')
        this.log('  project-code auth login')

        this.error(
          'Interactive authentication not yet supported in init command. Use direct authentication with flags.',
        )
      } catch (error) {
        this.error(`Interactive authentication failed: ${error instanceof Error ? error.message : String(error)}`)
        return {credentials: null, provider: null}
      }
    }

    // If auth flag is set but no provider/token, show help
    if (flags.auth) {
      this.log('')
      this.log('Authentication options:')
      this.log('  --provider github|gitlab|bitbucket|local')
      this.log('  --token <your_token>')
      this.log('  --username <your_username>')
      this.log('')
      this.log('Example:')
      this.log('  project-code project init . --auth --provider github --token ghp_your_token')

      this.error('Authentication provider and token are required when using --auth flag')
      return {credentials: null, provider: null}
    }

    return {credentials: null, provider: null}
  }

  /**
   * Get development command for project type
   */
  private getDevCommand(type?: string): string {
    switch (type) {
      case 'go': {
        return 'go run .'
      }

      case 'javascript':
      case 'nodejs':
      case 'typescript': {
        return 'npm run dev'
      }

      case 'python': {
        return 'python main.py'
      }

      case 'rust': {
        return 'cargo run'
      }

      default: {
        return '# Start development based on your project type'
      }
    }
  }

  /**
   * Get directory name from path
   */
  private getDirectoryName(path: string): string {
    const parts = path.split(/[/\\]/)
    return parts.at(-1) || 'project'
  }

  /**
   * Get install command for project type
   */
  private getInstallCommand(type?: string): string {
    switch (type) {
      case 'csharp':
      case 'dotnet': {
        return 'dotnet restore'
      }

      case 'dart': {
        return 'flutter pub get'
      }

      case 'go': {
        return 'go mod tidy'
      }

      case 'java': {
        return 'mvn install'
      }

      case 'javascript':
      case 'nodejs':
      case 'typescript': {
        return 'npm install'
      }

      case 'php': {
        return 'composer install'
      }

      case 'python': {
        return 'pip install -r requirements.txt'
      }

      case 'ruby': {
        return 'bundle install'
      }

      case 'rust': {
        return 'cargo build'
      }

      case 'swift': {
        return 'swift package resolve'
      }

      default: {
        return 'npm install  # or your preferred package manager'
      }
    }
  }

  /**
   * Initialize git repository if not exists
   */
  private async initializeGitRepository(projectPath: string): Promise<void> {
    const gitDir = join(projectPath, '.git')

    try {
      // Check if .git directory already exists
      await fs.access(gitDir)
      this.log('   📁 Git repository already exists')
    } catch {
      // .git directory doesn't exist, create new repository
      try {
        this.log('   📁 Initializing git repository...')

        // Initialize git repository
        execSync('git init', {
          cwd: projectPath,
          stdio: 'pipe',
        })

        // Create initial commit
        execSync('git add .', {
          cwd: projectPath,
          stdio: 'pipe',
        })

        execSync('git commit -m "Initial commit: Project initialized with Project Code CLI"', {
          cwd: projectPath,
          stdio: 'pipe',
        })

        this.log('   ✅ Git repository initialized with initial commit')
      } catch (error) {
        this.warn(`Failed to initialize git repository: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  // ...getAuthenticationCredentials...

  // ...getInstallCommand...

  // ...initializeGitRepository...

  // ...isProjectInitialized...

  // ...isValidProjectName...
}