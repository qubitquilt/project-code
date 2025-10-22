# Project Code CLI - Configuration Guide

Comprehensive guide to configuring and customizing Project Code CLI for your development workflow.

## 📖 Table of Contents

- [Configuration File](#configuration-file)
- [Root Folders](#root-folders)
- [Authentication](#authentication)
- [Project Discovery](#project-discovery)
- [UI Settings](#ui-settings)
- [VS Code Integration](#vs-code-integration)
- [Advanced Configuration](#advanced-configuration)
- [Configuration Commands](#configuration-commands)

---

## Configuration File

Project Code CLI stores configuration in `~/.project-code/config.json`.

### Default Configuration

```json
{
  "defaultRootFolder": "~/code",
  "rootFolders": ["~/code"],
  "auth": {
    "enabled": true,
    "defaultProvider": "github",
    "providers": {
      "github": { "enabled": true },
      "gitlab": { "enabled": false },
      "bitbucket": { "enabled": false },
      "local": { "enabled": true }
    },
    "tokenValidationInterval": 300000
  },
  "project": {
    "excludePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/coverage/**"
    ],
    "includePatterns": [
      "**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx",
      "**/*.py", "**/*.java", "**/*.cs", "**/*.php"
    ],
    "maxDepth": 5,
    "supportedTypes": [
      "javascript", "typescript", "python", "java",
      "csharp", "php", "ruby", "go", "rust"
    ]
  },
  "ui": {
    "showDescriptions": true,
    "showTags": true,
    "sortBy": "name",
    "sortOrder": "asc",
    "theme": "auto"
  },
  "vscode": {
    "enabled": true
  }
}
```

### Configuration Locations

- **Primary**: `~/.project-code/config.json`
- **Custom**: Set with `PROJECT_CODE_CONFIG_PATH` environment variable
- **Backup**: Create manual copies for safe keeping

---

## Root Folders

Configure directories where Project Code CLI searches for projects.

### Adding Root Folders

```bash
# Add a root folder
project-code config add root ~/code

# Add multiple root folders
project-code config add root ~/projects
project-code config add root ~/work

# Add with custom name
project-code config add root ~/experiments --name "Experimental Projects"
```

### Managing Root Folders

```bash
# List current root folders
project-code config list | grep rootFolders

# Remove a root folder (edit config file manually)
code ~/.project-code/config.json
```

### Best Practices for Root Folders

**Organize by Purpose:**
```
~/code/
├── personal/     # Personal projects
├── work/         # Work-related projects
├── experiments/  # Testing and prototypes
└── archives/     # Completed/old projects
```

**Organize by Technology:**
```
~/code/
├── web/          # JavaScript/TypeScript projects
├── mobile/       # React Native/Flutter projects
├── data/         # Python/R projects
└── systems/      # Go/Rust/C++ projects
```

**Organize by Client:**
```
~/code/
├── client-a/     # Projects for client A
├── client-b/     # Projects for client B
└── internal/     # Internal tools and scripts
```

---

## Authentication

Configure authentication providers and security settings.

### Provider Configuration

```bash
# Enable/disable providers
project-code config set auth.providers.github.enabled true
project-code config set auth.providers.gitlab.enabled false

# Set default provider
project-code config set auth.defaultProvider github

# Configure token validation interval (in milliseconds)
project-code config set auth.tokenValidationInterval 600000
```

### Security Settings

```json
{
  "auth": {
    "tokenValidationInterval": 300000,
    "secureStorage": true,
    "encryptTokens": true
  }
}
```

### Multiple Accounts

For managing multiple accounts, edit the configuration manually:

```json
{
  "auth": {
    "providers": {
      "github": {
        "enabled": true,
        "accounts": {
          "personal": { "token": "encrypted_token_here" },
          "work": { "token": "encrypted_token_here" }
        }
      }
    }
  }
}
```

---

## Project Discovery

Configure how Project Code CLI discovers and identifies projects.

### Scan Settings

```bash
# Set maximum scan depth
project-code config set project.maxDepth 8

# Configure scan intervals
project-code config set project.scanInterval 30000

# Enable/disable specific project types
project-code config set project.supportedTypes '["javascript","typescript","python","react"]'
```

### Include/Exclude Patterns

**Default Include Patterns:**
- `**/*.js`, `**/*.ts`, `**/*.jsx`, `**/*.tsx`
- `**/*.py`, `**/*.java`, `**/*.cs`, `**/*.php`
- `**/package.json`, `**/requirements.txt`, `**/Cargo.toml`

**Default Exclude Patterns:**
- `**/node_modules/**`, `**/dist/**`, `**/build/**`
- `**/.git/**`, `**/coverage/**`, `**/tmp/**`

### Custom Patterns

Edit `~/.project-code/config.json` to add custom patterns:

```json
{
  "project": {
    "includePatterns": [
      "**/*.js", "**/*.ts", "**/*.py",
      "**/*.md", "**/*.txt", "**/*.yml"
    ],
    "excludePatterns": [
      "**/node_modules/**", "**/dist/**",
      "**/temp/**", "**/backup/**"
    ]
  }
}
```

---

## UI Settings

Customize the appearance and behavior of CLI output.

### Display Options

```bash
# Show/hide project descriptions
project-code config set ui.showDescriptions true

# Show/hide tags
project-code config set ui.showTags true

# Set sort order
project-code config set ui.sortBy name
project-code config set ui.sortOrder asc

# Set theme (for future GUI version)
project-code config set ui.theme auto
```

### Available UI Options

| Setting | Values | Description |
|---------|--------|-------------|
| `sortBy` | `name`, `path`, `type`, `updatedAt` | Sort projects by field |
| `sortOrder` | `asc`, `desc` | Sort direction |
| `theme` | `auto`, `dark`, `light` | Color theme |
| `showDescriptions` | `true`, `false` | Show project descriptions |
| `showTags` | `true`, `false` | Show project tags |

### Table Formatting

```bash
# Configure table display
project-code config set ui.table.showHeaders true
project-code config set ui.table.maxWidth 120
project-code config set ui.table.truncatePaths true
```

---

## VS Code Integration

Configure how Project Code CLI integrates with VS Code.

### Basic Setup

```bash
# Enable VS Code integration
project-code config set vscode.enabled true

# Set custom VS Code path (if not in PATH)
project-code config set vscode.executablePath /usr/local/bin/code

# Configure user data directory
project-code config set vscode.userDataDir ~/Library/Application\ Support/Code

# Set extensions directory
project-code config set vscode.extensionsDir ~/.vscode/extensions
```

### Advanced VS Code Configuration

```json
{
  "vscode": {
    "enabled": true,
    "executablePath": "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
    "userDataDir": "~/Library/Application Support/Code",
    "extensionsDir": "~/.vscode/extensions",
    "workspacePath": "~/code",
    "autoOpen": false,
    "reuseWindow": true,
    "newWindow": false
  }
}
```

### VS Code Settings Integration

Project Code CLI can integrate with VS Code workspace settings:

```bash
# Configure workspace settings
project-code config set vscode.workspaceSettings '{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true
}'
```

---

## Advanced Configuration

### Environment Variables

Override configuration with environment variables:

```bash
# Custom config path
export PROJECT_CODE_CONFIG_PATH="/custom/path/config.json"

# Custom root folders
export PROJECT_CODE_ROOT_FOLDERS="~/code,~/projects,~/work"

# Debug mode
export DEBUG="project-code:*"
```

### Configuration Profiles

Create different configuration profiles for different workflows:

**Work Profile:**
```json
{
  "defaultRootFolder": "~/work",
  "rootFolders": ["~/work", "~/clients"],
  "ui": { "sortBy": "type", "theme": "dark" }
}
```

**Personal Profile:**
```json
{
  "defaultRootFolder": "~/personal",
  "rootFolders": ["~/personal", "~/experiments"],
  "ui": { "sortBy": "updatedAt", "theme": "light" }
}
```

### Project Templates

Configure custom project templates:

```json
{
  "templates": {
    "react-app": {
      "type": "react",
      "files": ["public/", "src/", "package.json"],
      "dependencies": ["react", "react-dom"],
      "devDependencies": ["vite", "@types/react"]
    }
  }
}
```

---

## Configuration Commands

### Viewing Configuration

```bash
# Display current configuration
project-code config list

# View specific section
project-code config list | jq '.ui'

# Export configuration
project-code config list > backup-config.json
```

### Modifying Configuration

```bash
# Set UI preferences
project-code config set ui.theme dark
project-code config set ui.sortBy type

# Configure project discovery
project-code config set project.maxDepth 10
project-code config set project.excludePatterns '["**/temp/**", "**/backup/**"]'

# Configure authentication
project-code config set auth.defaultProvider github
project-code config set auth.tokenValidationInterval 600000
```

### Adding Complex Configuration

For complex changes, edit the configuration file directly:

```bash
# Open configuration in editor
code ~/.project-code/config.json

# Or use any text editor
nano ~/.project-code/config.json
vim ~/.project-code/config.json
```

### Resetting Configuration

```bash
# Reset to defaults with confirmation
project-code config reset

# Reset without confirmation
project-code config reset --confirm

# Reset specific sections
project-code config reset --section ui
```

---

## Configuration Validation

Project Code CLI validates configuration on load:

### Validation Rules

- **Root folders**: Must be absolute paths
- **Max depth**: Must be between 1-10
- **Theme**: Must be `auto`, `dark`, or `light`
- **Providers**: Must be valid provider names
- **Patterns**: Must be valid glob patterns

### Checking Configuration

```bash
# Validate current configuration
project-code config validate

# Check for deprecated settings
project-code config validate --strict

# View validation errors
project-code config validate --verbose
```

### Fixing Configuration Issues

If configuration is invalid:

1. **Check the error message**:
   ```bash
   project-code config validate
   ```

2. **Fix the specific issue**:
   ```bash
   # Example: Fix invalid theme
   project-code config set ui.theme dark
   ```

3. **Reset if necessary**:
   ```bash
   project-code config reset
   ```

---

## Migration Guide

### Migrating from Python Version

If migrating from the Python version of Project Code:

1. **Export Python configuration**:
    ```bash
    # From Python version
    project-code config export > config.json
    ```

2. **Update paths for new version**:
    ```bash
    # Edit the exported config to match new format
    code config.json
    ```

3. **Import to TypeScript version**:
    ```bash
    # Copy to new location
    cp config.json ~/.project-code/config.json
    ```

### Version Upgrades

When upgrading Project Code CLI:

1. **Backup current configuration**:
    ```bash
    cp ~/.project-code/config.json ~/.project-code/config.json.backup
    ```

2. **Update the CLI**:
    ```bash
    npm update -g project-code
    ```

3. **Check for configuration changes**:
    ```bash
    project-code config validate
    ```

---

## Troubleshooting Configuration

### Common Issues

**"Configuration file not found"**
```bash
# Create default configuration
project-code project list

# Or manually create directory and config
mkdir -p ~/.project-code
project-code config reset
```

**"Invalid configuration"**
```bash
# Validate and fix
project-code config validate

# Reset if needed
project-code config reset
```

**"Root folder not accessible"**
```bash
# Check permissions
ls -la ~/code

# Fix permissions
chmod 755 ~/code

# Update configuration
project-code config set rootFolders '["~/code"]'
```

### Debug Configuration

```bash
# Enable debug logging
DEBUG=project-code:* project-code project list

# Check configuration file syntax
cat ~/.project-code/config.json | jq .

# Test with minimal configuration
project-code config reset
project-code config set rootFolders '["~/code"]'
```

### Getting Help

```bash
# Configuration help
project-code config --help

# Specific command help
project-code config set --help
project-code config add --help

# Report configuration issues
project-code --help  # Find issue tracker URL
```

---

## Best Practices

### Security
- **Encrypt sensitive data** in configuration
- **Use environment variables** for sensitive values
- **Regularly rotate** authentication tokens
- **Backup configuration** before making changes

### Performance
- **Limit root folders** to only what you need
- **Set reasonable maxDepth** (default 5 is usually good)
- **Use specific include patterns** to speed up scanning
- **Exclude unnecessary directories**

### Organization
- **Use descriptive names** for root folders
- **Group related projects** in subdirectories
- **Use consistent naming conventions**
- **Regularly clean up** old projects

---

*For command reference, see [Command Reference](COMMAND_REFERENCE.md). For examples, see [Examples](EXAMPLES.md).*