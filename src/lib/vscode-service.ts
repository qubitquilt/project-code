import { execSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

import {CommandResult, ProjectInfo, VSCodeIntegration} from '../types/index.js'
import {ConfigManager} from './config.js'

/**
 * VS Code integration service for opening projects and managing workspaces
 */
export class VSCodeService {
  private configManager: ConfigManager
  private vscodeInfo: null | VSCodeIntegration = null

  constructor() {
    this.configManager = ConfigManager.getInstance()
  }

  /**
   * Detect VS Code installation and get version info
   */
  public async detectVSCode(): Promise<CommandResult<VSCodeIntegration>> {
    try {
      // Try to find VS Code executable
      const executablePath = await this.findVSCodeExecutable()

      if (!executablePath) {
        return {
          error: 'VS Code executable not found',
          success: false,
        }
      }

      // Get VS Code version
      const version = await this.getVSCodeVersion(executablePath)

      // Get user data directory
      const userDataDir = this.getVSCodeUserDataDir()

      // Get extensions directory
      const extensionsDir = this.getVSCodeExtensionsDir()

      this.vscodeInfo = {
        executablePath,
        extensionsDir,
        isInstalled: true,
        userDataDir,
        version,
      }

      return {
        data: this.vscodeInfo,
        message: 'VS Code detected successfully',
        success: true,
      }
    } catch (error) {
      return {
        error: `Failed to detect VS Code: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      }
    }
  }

  /**
   * Get VS Code integration info
   */
  public getVSCodeInfo(): null | VSCodeIntegration {
    return this.vscodeInfo
  }

  /**
   * Check if VS Code is currently running
   */
  public async isVSCodeRunning(): Promise<boolean> {
    try {
      // Try to detect running VS Code processes
      // This is platform-specific and may not be reliable
      const output = execSync('ps aux | grep -i "visual studio code" | grep -v grep', {encoding: 'utf8'})
      return output.trim().length > 0
    } catch {
      return false
    }
  }

  /**
   * Open a project in VS Code
   */
  public async openProject(project: ProjectInfo): Promise<CommandResult<boolean>> {
    try {
      if (!this.vscodeInfo) {
        const detectResult = await this.detectVSCode()
        if (!detectResult.success) {
          return {
            error: 'VS Code not detected',
            success: false,
          }
        }
      }

      const config = this.configManager.getConfig()
      if (!config?.vscode?.enabled) {
        return {
          error: 'VS Code integration is disabled in configuration',
          success: false,
        }
      }

      // Use 'code' command to open the project
      const args = [project.path]

      // Check if we should open in a new window
      const shouldOpenNewWindow = this.shouldOpenInNewWindow(project)
      if (shouldOpenNewWindow) {
        args.unshift('--new-window')
      }

      // Execute VS Code
      await this.executeVSCode(args)

      return {
        data: true,
        message: `Opened project "${project.name}" in VS Code`,
        success: true,
      }
    } catch (error) {
      return {
        error: `Failed to open project in VS Code: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      }
    }
  }

  /**
   * Open multiple projects as a workspace
   */
  public async openWorkspace(projects: ProjectInfo[], workspaceName?: string): Promise<CommandResult<boolean>> {
    try {
      if (!this.vscodeInfo) {
        const detectResult = await this.detectVSCode()
        if (!detectResult.success) {
          return {
            error: 'VS Code not detected',
            success: false,
          }
        }
      }

      const config = this.configManager.getConfig()
      if (!config?.vscode?.enabled) {
        return {
          error: 'VS Code integration is disabled in configuration',
          success: false,
        }
      }

      if (projects.length === 0) {
        return {
          error: 'No projects provided',
          success: false,
        }
      }

      // Create workspace configuration
      const workspaceConfig = {
        extensions: {
          recommendations: this.getRecommendedExtensions(projects),
        },
        folders: projects.map((project) => ({
          name: project.name,
          path: project.path,
        })),
        settings: {},
      }

      // Save workspace file temporarily
      const workspacePath = await this.createTemporaryWorkspace(workspaceConfig, workspaceName)

      // Open workspace in VS Code
      const args = [workspacePath]
      await this.executeVSCode(args)

      return {
        data: true,
        message: `Opened workspace with ${projects.length} projects in VS Code`,
        success: true,
      }
    } catch (error) {
      return {
        error: `Failed to open workspace in VS Code: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      }
    }
  }

  /**
   * Create temporary workspace file
   */
  private async createTemporaryWorkspace(workspaceConfig: { extensions: { recommendations: string[] }; folders: Array<{ name: string; path: string }>; settings: Record<string, unknown> }, workspaceName?: string): Promise<string> {
    const fs = await import('node:fs/promises')
    const os = await import('node:os')
    const { join: pathJoin } = await import('node:path')

    const tempDir = os.tmpdir()
    const workspaceFileName = workspaceName
      ? `${workspaceName.replaceAll(/[^a-zA-Z0-9-_]/g, '_')}.code-workspace`
      : `project-code-workspace-${Date.now()}.code-workspace`

    const workspacePath = pathJoin(tempDir, workspaceFileName)

    await fs.writeFile(workspacePath, JSON.stringify(workspaceConfig, null, 2), 'utf8')

    return workspacePath
  }

  /**
   * Execute VS Code with arguments
   */
  private async executeVSCode(args: string[]): Promise<void> {
    if (!this.vscodeInfo?.executablePath) {
      throw new Error('VS Code executable path not available')
    }

    return new Promise((resolve, reject) => {
      const vscodeProcess = spawn(this.vscodeInfo!.executablePath!, args, {
        detached: true,
        stdio: 'inherit',
      })

      vscodeProcess.on('error', (error) => {
        reject(error)
      })

      vscodeProcess.on('exit', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`VS Code exited with code ${code}`))
        }
      })

      // Unref the process so it can run independently
      vscodeProcess.unref()
    })
  }

  /**
   * Find VS Code executable path
   */
  private async findVSCodeExecutable(): Promise<null | string> {
    const possiblePaths = [
      // macOS
      '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
      '/Applications/VS Code.app/Contents/Resources/app/bin/code',
      // Windows
      String.raw`C:\Program Files\Microsoft VS Code\bin\code.cmd`,
      String.raw`C:\Program Files\Microsoft VS Code\bin\code`,
      String.raw`C:\Users\%USERNAME%\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd`,
      String.raw`C:\Users\%USERNAME%\AppData\Local\Programs\Microsoft VS Code\bin\code`,
      // Linux
      '/usr/bin/code',
      '/usr/local/bin/code',
      '/snap/bin/code',
      '/opt/visual-studio-code/bin/code',
    ]

    // Try common executable names first
    const commonExecutables = ['code']

    for (const executable of commonExecutables) {
      try {
        execSync(`which ${executable}`, {stdio: 'ignore'})
        return executable
      } catch {
        // Continue searching
      }
    }

    // Try specific paths
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        return path
      }
    }

    return null
  }

  /**
   * Get recommended extensions based on project types
   */
  private getRecommendedExtensions(projects: ProjectInfo[]): string[] {
    const extensions = new Set<string>()
    const projectTypes = new Set(projects.map((p) => p.type))

    // TypeScript/JavaScript projects
    if (projectTypes.has('typescript') || projectTypes.has('javascript') || projectTypes.has('nodejs')) {
      extensions.add('ms-vscode.vscode-typescript-next')
    }

    // React projects
    if (projectTypes.has('react')) {
      extensions.add('ms-vscode.vscode-react-typescript')
    }

    // Vue projects
    if (projectTypes.has('vue')) {
      extensions.add('vue.volar')
    }

    // Angular projects
    if (projectTypes.has('angular')) {
      extensions.add('angular.ng-template')
    }

    // Python projects
    if (projectTypes.has('python')) {
      extensions.add('ms-python.python')
      extensions.add('ms-python.black-formatter')
    }

    // C# projects
    if (projectTypes.has('csharp')) {
      extensions.add('ms-dotnettools.csharp')
    }

    // Go projects
    if (projectTypes.has('go')) {
      extensions.add('golang.go')
    }

    // Rust projects
    if (projectTypes.has('rust')) {
      extensions.add('rust-lang.rust-analyzer')
    }

    // Docker projects
    if (projectTypes.has('docker')) {
      extensions.add('ms-azuretools.vscode-docker')
    }

    return [...extensions]
  }

  /**
   * Get VS Code extensions directory
   */
  private getVSCodeExtensionsDir(): string {
    const config = this.configManager.getConfig()

    if (config?.vscode?.extensionsDir) {
      return resolve(config.vscode.extensionsDir)
    }

    // Default extensions directories
    const possibleDirs = [
      join(homedir(), '.vscode', 'extensions'),
      join(homedir(), 'AppData', 'Local', 'Programs', 'Microsoft VS Code', 'resources', 'app', 'extensions'),
      join(homedir(), 'Library', 'Application Support', 'Code', 'extensions'),
    ]

    for (const dir of possibleDirs) {
      if (existsSync(dir)) {
        return dir
      }
    }

    return possibleDirs[0] // Return first option as fallback
  }

  /**
   * Get VS Code user data directory
   */
  private getVSCodeUserDataDir(): string {
    const config = this.configManager.getConfig()

    if (config?.vscode?.userDataDir) {
      return resolve(config.vscode.userDataDir)
    }

    // Default user data directories
    const possibleDirs = [
      join(homedir(), '.vscode'),
      join(homedir(), 'AppData', 'Roaming', 'Code'),
      join(homedir(), 'Library', 'Application Support', 'Code'),
    ]

    for (const dir of possibleDirs) {
      if (existsSync(dir)) {
        return dir
      }
    }

    return possibleDirs[0] // Return first option as fallback
  }

  /**
   * Get VS Code version
   */
  private async getVSCodeVersion(executablePath: string): Promise<string> {
    try {
      const output = execSync(`"${executablePath}" --version`, {encoding: 'utf8'})
      const lines = output.trim().split('\n')
      return lines[0] || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  /**
   * Determine if project should be opened in new window
   */
  private shouldOpenInNewWindow(_project: ProjectInfo): boolean {
    // For now, always open in new window for consistency
    // This could be made configurable in the future
    return true
  }
}
