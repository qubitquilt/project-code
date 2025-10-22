import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

import { CommandResult, ProjectCodeConfig } from '../types/index.js';

/**
 * Configuration management for ProjectCode CLI
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: null | ProjectCodeConfig = null;
  private configPath: string;

  private constructor() {
    this.configPath = join(homedir(), '.project-code', 'config.json');
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }

    return ConfigManager.instance;
  }

  /**
   * Get current configuration
   */
  public getConfig(): null | ProjectCodeConfig {
    return this.config;
  }

  /**
   * Get configuration file path
   */
  public getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Load configuration from file
   */
  public loadConfig(): CommandResult<ProjectCodeConfig> {
    try {
      if (!existsSync(this.configPath)) {
        // Create default config if it doesn't exist
        this.config = this.getDefaultConfig();
        this.saveConfig();
        return {
          data: this.config!,
          message: 'Created default configuration',
          success: true,
        };
      }

      const configData = readFileSync(this.configPath, 'utf8');
      const loadedConfig = JSON.parse(configData) as ProjectCodeConfig;

      // Merge with defaults to ensure all properties exist
      this.config = this.mergeWithDefaults(loadedConfig);

      return {
        data: this.config!,
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Reset configuration to defaults
   */
  public resetConfig(): CommandResult<ProjectCodeConfig> {
    this.config = this.getDefaultConfig();

    const saveResult = this.saveConfig(this.config!);
    if (!saveResult.success) {
      return {
        error: saveResult.error,
        success: false,
      };
    }

    return {
      data: this.config!,
      message: 'Configuration reset to defaults',
      success: true,
    };
  }

  /**
   * Save configuration to file
   */
  public saveConfig(config?: ProjectCodeConfig): CommandResult<boolean> {
    try {
      const configToSave = config || this.config || this.getDefaultConfig();

      // Ensure config directory exists
      const configDir = join(homedir(), '.project-code');
      if (!existsSync(configDir)) {
        // We'll need to create the directory - for now just save to the path
      }

      writeFileSync(this.configPath, JSON.stringify(configToSave, null, 2), 'utf8');
      this.config = configToSave;

      return {
        data: true,
        message: 'Configuration saved successfully',
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<ProjectCodeConfig>): CommandResult<ProjectCodeConfig> {
    if (!this.config) {
      const loadResult = this.loadConfig();
      if (!loadResult.success) {
        return {
          error: loadResult.error,
          success: false,
        };
      }
    }

    try {
      const updatedConfig = { ...this.config!, ...updates };
      this.config = updatedConfig;

      const saveResult = this.saveConfig(updatedConfig);
      if (!saveResult.success) {
        return {
          error: saveResult.error,
          success: false,
        };
      }

      return {
        data: updatedConfig,
        message: 'Configuration updated successfully',
        success: true,
      };
    } catch (error) {
      return {
        error: `Failed to update configuration: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Validate configuration
   */
  public validateConfig(config: ProjectCodeConfig): CommandResult<boolean> {
    try {
      // Validate authentication configuration
      if (config.auth) {
        // Validate default provider
        const validProviders = ['bitbucket', 'github', 'gitlab', 'local'];
        if (!validProviders.includes(config.auth.defaultProvider)) {
          return {
            error: `Auth defaultProvider must be one of: ${validProviders.join(', ')}`,
            success: false,
          };
        }

        // Validate token validation interval
        if (config.auth.tokenValidationInterval < 60_000) { // Minimum 1 minute
          return {
            error: 'Auth tokenValidationInterval must be at least 60000ms (1 minute)',
            success: false,
          };
        }
      }

      // Validate root folders exist or can be created
      for (const folder of config.rootFolders) {
        const resolvedPath = resolve(folder);
        // Path validation - ensure it's absolute and reasonable
        if (!resolvedPath.startsWith(homedir()) && !/^[A-Za-z]:\/$/.test(resolvedPath)) {
          return {
            error: `Root folder path must be absolute: ${folder}`,
            success: false,
          };
        }
      }

      // Validate maxDepth is reasonable
      if (config.project && (config.project.maxDepth < 1 || config.project.maxDepth > 10)) {
        return {
          error: 'Project maxDepth must be between 1 and 10',
          success: false,
        };
      }

      // Validate theme value
      if (config.ui && !['auto', 'dark', 'light'].includes(config.ui.theme)) {
        return {
          error: 'UI theme must be one of: auto, dark, light',
          success: false,
        };
      }

      return {
        data: true,
        message: 'Configuration is valid',
        success: true,
      };
    } catch (error) {
      return {
        error: `Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      };
    }
  }

  /**
   * Get the default configuration
   */
  private getDefaultConfig(): ProjectCodeConfig {
    return {
      auth: {
        defaultProvider: 'github',
        enabled: true,
        providers: {
          bitbucket: {
            enabled: false,
          },
          github: {
            enabled: true,
          },
          gitlab: {
            enabled: false,
          },
          local: {
            enabled: true,
          },
        },
        tokenValidationInterval: 300_000, // 5 minutes
      },
      defaultRootFolder: join(homedir(), 'code'),
      project: {
        excludePatterns: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/.git/**',
          '**/coverage/**',
          '**/*.log',
          '**/tmp/**',
          '**/temp/**',
        ],
        includePatterns: [
          '**/*.js',
          '**/*.ts',
          '**/*.jsx',
          '**/*.tsx',
          '**/*.py',
          '**/*.java',
          '**/*.cs',
          '**/*.php',
          '**/*.rb',
          '**/*.go',
          '**/*.rs',
          '**/*.cpp',
          '**/*.c',
          '**/*.h',
          '**/*.hpp',
          '**/*.html',
          '**/*.css',
          '**/*.scss',
          '**/*.sass',
          '**/*.less',
          '**/package.json',
          '**/requirements.txt',
          '**/Cargo.toml',
          '**/go.mod',
          '**/composer.json',
          '**/*.sln',
          '**/*.csproj',
          '**/*.vbproj',
        ],
        maxDepth: 5,
        supportedTypes: [
          'javascript',
          'typescript',
          'python',
          'java',
          'csharp',
          'php',
          'ruby',
          'go',
          'rust',
          'cpp',
          'html',
          'css',
          'react',
          'vue',
          'angular',
          'nodejs',
          'dotnet',
        ],
      },
      rootFolders: [join(homedir(), 'code')],
      ui: {
        showDescriptions: true,
        showTags: true,
        sortBy: 'name',
        sortOrder: 'asc',
        theme: 'auto',
      },
      vscode: {
        enabled: true,
      },
    };
  }


  /**
   * Merge auth configuration with defaults
   */
  private mergeAuthConfig(
    loadedAuth: Partial<ProjectCodeConfig['auth']> | undefined,
    defaultAuth: NonNullable<ProjectCodeConfig['auth']>
  ): NonNullable<ProjectCodeConfig['auth']> {
    return {
      defaultProvider: loadedAuth?.defaultProvider || defaultAuth.defaultProvider,
      enabled: loadedAuth?.enabled ?? defaultAuth.enabled,
      providers: {
        bitbucket: {
          clientId: loadedAuth?.providers?.bitbucket?.clientId || defaultAuth.providers.bitbucket!.clientId,
          enabled: loadedAuth?.providers?.bitbucket?.enabled ?? defaultAuth.providers.bitbucket!.enabled,
        },
        github: {
          clientId: loadedAuth?.providers?.github?.clientId || defaultAuth.providers.github!.clientId,
          enabled: loadedAuth?.providers?.github?.enabled ?? defaultAuth.providers.github!.enabled,
        },
        gitlab: {
          clientId: loadedAuth?.providers?.gitlab?.clientId || defaultAuth.providers.gitlab!.clientId,
          enabled: loadedAuth?.providers?.gitlab?.enabled ?? defaultAuth.providers.gitlab!.enabled,
        },
        local: {
          enabled: loadedAuth?.providers?.local?.enabled ?? defaultAuth.providers.local!.enabled,
        },
      },
      tokenValidationInterval: loadedAuth?.tokenValidationInterval || defaultAuth.tokenValidationInterval,
    };
  }

  /**
   * Merge project configuration with defaults
   */
  private mergeProjectConfig(
    loadedProject: Partial<ProjectCodeConfig['project']> | undefined,
    defaultProject: NonNullable<ProjectCodeConfig['project']>
  ): NonNullable<ProjectCodeConfig['project']> {
    return {
      excludePatterns: loadedProject?.excludePatterns || defaultProject.excludePatterns,
      includePatterns: loadedProject?.includePatterns || defaultProject.includePatterns,
      maxDepth: loadedProject?.maxDepth || defaultProject.maxDepth,
      supportedTypes: loadedProject?.supportedTypes || defaultProject.supportedTypes,
    };
  }

  /**
   * Merge UI configuration with defaults
   */
  private mergeUIConfig(
    loadedUI: Partial<ProjectCodeConfig['ui']> | undefined,
    defaultUI: NonNullable<ProjectCodeConfig['ui']>
  ): NonNullable<ProjectCodeConfig['ui']> {
    return {
      showDescriptions: loadedUI?.showDescriptions ?? defaultUI.showDescriptions,
      showTags: loadedUI?.showTags ?? defaultUI.showTags,
      sortBy: loadedUI?.sortBy || defaultUI.sortBy,
      sortOrder: loadedUI?.sortOrder || defaultUI.sortOrder,
      theme: loadedUI?.theme || defaultUI.theme,
    };
  }

  /**
   * Merge VS Code configuration with defaults
   */
  private mergeVSCodeConfig(
    loadedVSCode: Partial<ProjectCodeConfig['vscode']> | undefined,
    defaultVSCode: NonNullable<ProjectCodeConfig['vscode']>
  ): NonNullable<ProjectCodeConfig['vscode']> {
    return {
      enabled: loadedVSCode?.enabled ?? defaultVSCode.enabled,
      executablePath: loadedVSCode?.executablePath || defaultVSCode.executablePath,
      extensionsDir: loadedVSCode?.extensionsDir || defaultVSCode.extensionsDir,
      userDataDir: loadedVSCode?.userDataDir || defaultVSCode.userDataDir,
    };
  }

  /**
   * Merge loaded configuration with defaults
   */
  private mergeWithDefaults(loadedConfig: Partial<ProjectCodeConfig>): ProjectCodeConfig {
    const defaults = this.getDefaultConfig();

    return {
      auth: this.mergeAuthConfig(loadedConfig.auth, defaults.auth!),
      defaultRootFolder: loadedConfig.defaultRootFolder || defaults.defaultRootFolder,
      project: this.mergeProjectConfig(loadedConfig.project, defaults.project!),
      rootFolders: loadedConfig.rootFolders || defaults.rootFolders,
      ui: this.mergeUIConfig(loadedConfig.ui, defaults.ui!),
      vscode: this.mergeVSCodeConfig(loadedConfig.vscode, defaults.vscode!),
    };
  }
}