import { Args, Command, Flags } from '@oclif/core';

import { ConfigManager } from '../../lib/config.js';
import { ProjectCodeConfig } from '../../types/index.js';

/**
 * Add configuration settings
 */
export default class ConfigAdd extends Command {
  static args = {
    key: Args.string({
      description: 'Configuration key (e.g., "root-folder", "vscode.enabled", "ui.theme")',
      required: false,
    }),
    value: Args.string({
      description: 'Configuration value',
      required: false,
    }),
  };
static description = 'Add or update configuration settings';
static examples = [
    '<%= config.bin %> <%= command.id %> root-folder ~/projects',
    '<%= config.bin %> <%= command.id %> vscode.enabled true',
    '<%= config.bin %> <%= command.id %> ui.theme dark',
    '<%= config.bin %> <%= command.id %> project.max-depth 3',
  ];
static flags = {
    'reset-defaults': Flags.boolean({
      description: 'Reset configuration to defaults',
    }),
    'show-current': Flags.boolean({
      description: 'Show current configuration',
    }),
    'validate': Flags.boolean({
      description: 'Validate current configuration',
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ConfigAdd);

    try {
      const configManager = ConfigManager.getInstance();

      // Handle reset to defaults
      if (flags['reset-defaults']) {
        this.log('🔄 Resetting configuration to defaults...');

        const result = configManager.resetConfig();
        if (!result.success) {
          this.error(`Failed to reset configuration: ${result.error}`);
          return;
        }

        this.log('✅ Configuration reset to defaults');
        this.log(`Configuration file: ${configManager.getConfigPath()}`);
        return;
      }

      // Handle show current configuration
      if (flags['show-current']) {
        const loadResult = configManager.loadConfig();
        if (!loadResult.success) {
          this.error(`Failed to load configuration: ${loadResult.error}`);
          return;
        }

        const config = configManager.getConfig();
        if (!config) {
          this.error('No configuration available');
          return;
        }

        this.log('📋 Current Configuration:');
        this.log(JSON.stringify(config, null, 2));
        return;
      }

      // Handle validate configuration
      if (flags.validate) {
        const config = configManager.getConfig();
        if (!config) {
          this.error('No configuration loaded');
          return;
        }

        const result = configManager.validateConfig(config);
        if (!result.success) {
          this.error(`Configuration validation failed: ${result.error}`);
          return;
        }

        this.log('✅ Configuration is valid');
        return;
      }

      // Handle key-value updates
      if (args.key) {
        await this.handleKeyValueUpdate(configManager, args.key, args.value);
      } else {
        // Interactive mode or show help
        this.log('Configuration Management');
        this.log('======================');
        this.log('');
        this.log('Examples:');
        this.log('  Add root folder:        project-code config add root-folder ~/projects');
        this.log('  Enable VS Code:         project-code config add vscode.enabled true');
        this.log('  Set UI theme:           project-code config add ui.theme dark');
        this.log('  Set max depth:          project-code config add project.max-depth 3');
        this.log('');
        this.log('Options:');
        this.log('  Show current config:    project-code config add --show-current');
        this.log('  Validate config:        project-code config add --validate');
        this.log('  Reset to defaults:      project-code config add --reset-defaults');
        this.log('');
        this.log(`Configuration file: ${configManager.getConfigPath()}`);
      }

    } catch (error) {
      this.error(`Failed to manage configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle key-value configuration updates
   */
  private async handleKeyValueUpdate(
    configManager: ConfigManager,
    key: string,
    value: string | undefined
  ): Promise<void> {
    // Load current configuration
    const loadResult = configManager.loadConfig();
    if (!loadResult.success) {
      this.error(`Failed to load configuration: ${loadResult.error}`);
      return;
    }

    const currentConfig = configManager.getConfig();
    if (!currentConfig) {
      this.error('Configuration not available');
      return;
    }

    // Parse and validate the key-value pair
    const updateResult = await this.parseKeyValueUpdate(key, value, currentConfig);
    if (!updateResult.success) {
      this.error(updateResult.error!);
      return;
    }

    // Apply the update
    const result = configManager.updateConfig(updateResult.data!);
    if (!result.success) {
      this.error(`Failed to update configuration: ${result.error}`);
      return;
    }

    this.log(`✅ Updated ${key} = ${value || 'default'}`);
    this.log(`Configuration saved to: ${configManager.getConfigPath()}`);
  }

  /**
   * Parse key-value configuration update
   */
  private async parseKeyValueUpdate(
    key: string,
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): Promise<{ data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; }> {
    const keyParts = key.split('.');

    switch (keyParts[0]) {
      case 'project': {
        return this.parseProjectConfig(keyParts, key, value, currentConfig);
      }

      case 'root-folder': {
        return this.parseRootFolderConfig(value);
      }

      case 'ui': {
        return this.parseUIConfig(keyParts, key, value, currentConfig);
      }

      case 'vscode': {
        return this.parseVSCodeConfig(keyParts, key, value, currentConfig);
      }

      default: {
        return { error: `Unknown configuration key: ${key}`, success: false };
      }
    }
  }

  /**
   * Parse project configuration settings
   */
  private parseProjectConfig(
    keyParts: string[],
    key: string,
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    switch (keyParts[1]) {
      case 'exclude-patterns': {
        return this.parseProjectExcludePatterns(value, currentConfig);
      }

      case 'include-patterns': {
        return this.parseProjectIncludePatterns(value, currentConfig);
      }

      case 'max-depth': {
        return this.parseProjectMaxDepth(value);
      }

      default: {
        return { error: `Unknown project setting: ${key}`, success: false };
      }
    }
  }

  /**
   * Parse project exclude patterns configuration
   */
  private parseProjectExcludePatterns(
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    if (!value) {
      return { error: 'Exclude patterns value is required', success: false };
    }

    return {
      data: {
        project: {
          excludePatterns: value.split(',').map(p => p.trim()),
          includePatterns: currentConfig.project?.includePatterns || [],
          maxDepth: currentConfig.project?.maxDepth || 5,
          supportedTypes: currentConfig.project?.supportedTypes || []
        }
      },
      success: true
    };
  }

  /**
   * Parse project include patterns configuration
   */
  private parseProjectIncludePatterns(
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    if (!value) {
      return { error: 'Include patterns value is required', success: false };
    }

    return {
      data: {
        project: {
          excludePatterns: currentConfig.project?.excludePatterns || [],
          includePatterns: value.split(',').map(p => p.trim()),
          maxDepth: currentConfig.project?.maxDepth || 5,
          supportedTypes: currentConfig.project?.supportedTypes || []
        }
      },
      success: true
    };
  }

  /**
   * Parse project max depth configuration
   */
  private parseProjectMaxDepth(
    value: string | undefined
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    const depth = value ? Number.parseInt(value, 10) : 5;
    if (Number.isNaN(depth) || depth < 1 || depth > 10) {
      return { error: 'Project max depth must be a number between 1 and 10', success: false };
    }

    return {
      data: {
        project: {
          excludePatterns: [],
          includePatterns: [],
          maxDepth: depth,
          supportedTypes: []
        }
      },
      success: true
    };
  }

  /**
   * Parse root folder configuration
   */
  private parseRootFolderConfig(
    value: string | undefined
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    if (!value) {
      return { error: 'Root folder value is required', success: false };
    }

    return {
      data: {
        defaultRootFolder: value,
        rootFolders: [value]
      },
      success: true
    };
  }

  /**
   * Parse UI configuration settings
   */
  private parseUIConfig(
    keyParts: string[],
    key: string,
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    switch (keyParts[1]) {
      case 'show-descriptions': {
        return this.parseUIShowDescriptions(value, currentConfig);
      }

      case 'show-tags': {
        return this.parseUIShowTags(value, currentConfig);
      }

      case 'sort-by': {
        return this.parseUISortBy(value);
      }

      case 'sort-order': {
        return this.parseUISortOrder(value);
      }

      case 'theme': {
        return this.parseUITheme(value);
      }

      default: {
        return { error: `Unknown UI setting: ${key}`, success: false };
      }
    }
  }

  /**
   * Parse UI show descriptions configuration
   */
  private parseUIShowDescriptions(
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    return {
      data: {
        ui: {
          showDescriptions: value?.toLowerCase() === 'true',
          showTags: currentConfig.ui?.showTags || false,
          sortBy: currentConfig.ui?.sortBy || 'name',
          sortOrder: currentConfig.ui?.sortOrder || 'asc',
          theme: currentConfig.ui?.theme || 'auto'
        }
      },
      success: true
    };
  }

  /**
   * Parse UI show tags configuration
   */
  private parseUIShowTags(
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    return {
      data: {
        ui: {
          showDescriptions: currentConfig.ui?.showDescriptions || false,
          showTags: value?.toLowerCase() === 'true',
          sortBy: currentConfig.ui?.sortBy || 'name',
          sortOrder: currentConfig.ui?.sortOrder || 'asc',
          theme: currentConfig.ui?.theme || 'auto'
        }
      },
      success: true
    };
  }

  /**
   * Parse UI sort by configuration
   */
  private parseUISortBy(
    value: string | undefined
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    if (!value || !['name', 'path', 'type', 'updatedAt'].includes(value)) {
      return { error: 'Sort by must be one of: name, path, type, updatedAt', success: false };
    }

    return {
      data: {
        ui: {
          showDescriptions: false,
          showTags: false,
          sortBy: value as 'name' | 'path' | 'type' | 'updatedAt',
          sortOrder: 'asc',
          theme: 'auto'
        }
      },
      success: true
    };
  }

  /**
   * Parse UI sort order configuration
   */
  private parseUISortOrder(
    value: string | undefined
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    if (!value || !['asc', 'desc'].includes(value)) {
      return { error: 'Sort order must be one of: asc, desc', success: false };
    }

    return {
      data: {
        ui: {
          showDescriptions: false,
          showTags: false,
          sortBy: 'name',
          sortOrder: value as 'asc' | 'desc',
          theme: 'auto'
        }
      },
      success: true
    };
  }

  /**
   * Parse UI theme configuration
   */
  private parseUITheme(
    value: string | undefined
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    if (!value || !['auto', 'dark', 'light'].includes(value)) {
      return { error: 'UI theme must be one of: auto, dark, light', success: false };
    }

    return {
      data: {
        ui: {
          showDescriptions: false,
          showTags: false,
          sortBy: 'name',
          sortOrder: 'asc',
          theme: value as 'auto' | 'dark' | 'light'
        }
      },
      success: true
    };
  }

  /**
   * Parse VS Code configuration settings
   */
  private parseVSCodeConfig(
    keyParts: string[],
    key: string,
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    switch (keyParts[1]) {
      case 'enabled': {
        return this.parseVSCodeEnabled(value, currentConfig);
      }

      case 'executable-path': {
        return this.parseVSCodeExecutablePath(value, currentConfig);
      }

      case 'extensions-dir': {
        return this.parseVSCodeExtensionsDir(value, currentConfig);
      }

      case 'user-data-dir': {
        return this.parseVSCodeUserDataDir(value, currentConfig);
      }

      default: {
        return { error: `Unknown VS Code setting: ${key}`, success: false };
      }
    }
  }

  /**
   * Parse VS Code enabled configuration
   */
  private parseVSCodeEnabled(
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    return {
      data: {
        vscode: {
          enabled: value?.toLowerCase() === 'true',
          executablePath: currentConfig.vscode?.executablePath,
          extensionsDir: currentConfig.vscode?.extensionsDir,
          userDataDir: currentConfig.vscode?.userDataDir
        }
      },
      success: true
    };
  }

  /**
   * Parse VS Code executable path configuration
   */
  private parseVSCodeExecutablePath(
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    return {
      data: {
        vscode: {
          enabled: currentConfig.vscode?.enabled || false,
          executablePath: value,
          extensionsDir: currentConfig.vscode?.extensionsDir,
          userDataDir: currentConfig.vscode?.userDataDir
        }
      },
      success: true
    };
  }

  /**
   * Parse VS Code extensions directory configuration
   */
  private parseVSCodeExtensionsDir(
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    return {
      data: {
        vscode: {
          enabled: currentConfig.vscode?.enabled || false,
          executablePath: currentConfig.vscode?.executablePath,
          extensionsDir: value,
          userDataDir: currentConfig.vscode?.userDataDir
        }
      },
      success: true
    };
  }

  /**
   * Parse VS Code user data directory configuration
   */
  private parseVSCodeUserDataDir(
    value: string | undefined,
    currentConfig: ProjectCodeConfig
  ): { data: Partial<ProjectCodeConfig>; success: true; } | { error: string; success: false; } {
    return {
      data: {
        vscode: {
          enabled: currentConfig.vscode?.enabled || false,
          executablePath: currentConfig.vscode?.executablePath,
          extensionsDir: currentConfig.vscode?.extensionsDir,
          userDataDir: value
        }
      },
      success: true
    };
  }
}