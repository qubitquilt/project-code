# Project Code CLI

> 🚀 **A powerful CLI tool for managing code projects with VS Code integration**

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/project-code.svg)](https://npmjs.org/package/project-code)
[![Downloads/week](https://img.shields.io/npm/dw/project-code.svg)](https://npmjs.org/package/project-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Project Code CLI (project-code) helps developers manage their code projects efficiently with seamless VS Code integration. Discover, organize, and work with projects across multiple directories with powerful filtering, authentication, and automation features.

## ✨ Features

- **🔍 Smart Project Discovery** - Automatically find and catalog projects in your directories
- **📁 Multi-Directory Support** - Organize projects across multiple root folders
- **⚡ VS Code Integration** - Open projects directly in VS Code with one command
- **🔐 Git Provider Authentication** - Secure authentication with GitHub, GitLab, Bitbucket, and Local providers
- **📦 Project Cloning** - Clone repositories using simple project tags
- **🏗️ Project Initialization** - Set up new projects with proper structure and templates
- **🎨 Customizable UI** - Configure display options, themes, and sorting preferences
- **🔧 Flexible Configuration** - Extensive configuration options for all workflows
- **📊 Multiple Output Formats** - Table and JSON output for scripting and automation

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g project-code

# Verify installation
project-code --version
```

## 📋 System Requirements

- **Node.js** >= 18.0.0
- **npm** or **yarn** package manager
- **Git** (for cloning repositories)
- **VS Code** (optional, for VS Code integration)

### Basic Setup

```bash
# Set up your code directory
mkdir -p ~/code
project-code config add root ~/code

# Authenticate with GitHub (optional but recommended)
project-code auth login --provider github --token YOUR_GITHUB_TOKEN

# Or use Local provider for offline work
project-code auth login --provider local

# Discover your projects
project-code project list

# Open a project in VS Code
project-code project open my-project

# Clone a public repository
project-code project clone microsoft/vscode

# Or clone private repository (requires GitHub authentication)
project-code project clone your-username/private-repo
```

**🎉 That's it!** You're ready to manage your projects with Project Code CLI.

## 📚 Documentation

Complete documentation is available in the [`docs/`](docs/) directory:

- **[📖 Init Guide](docs/INIT_GUIDE.md)** - Comprehensive setup walkthrough for new users
- **[💻 Command Reference](docs/COMMAND_REFERENCE.md)** - Complete documentation of all commands and options
- **[⚙️ Configuration Guide](docs/CONFIGURATION.md)** - How to configure directories, authentication, and preferences
- **[💡 Examples](docs/EXAMPLES.md)** - Real-world usage examples and workflows
- **[🏗️ Directory Structure](docs/DIRECTORY_STRUCTURE.md)** - Directory conventions and hierarchy best practices
- **[🔐 Authentication](docs/AUTHENTICATION.md)** - Secure GitHub authentication setup

## 🛠️ Commands

### Hello Commands

| Command | Description |
|---------|-------------|
| `project-code hello <person> --from <name>` | Say hello to someone from someone else |
| `project-code hello:world` | Say hello world |

### Project Management

| Command | Description |
|---------|-------------|
| `project-code project list [options]` | List all discovered projects with filtering and formatting options |
| `project-code project open <name>` | Open project in VS Code |
| `project-code project init [path]` | Initialize directory as project |
| `project-code project clone <repo>` | Clone GitHub repository |
| `project-code project create <name>` | Create new project |

#### Project List Options
```bash
# Filter by project type
project-code project list --type nodejs
project-code project list --type react,python

# Search projects
project-code project list --search "my-project"
project-code project list --search "urgent|priority"

# Output formats
project-code project list --format json > projects.json
project-code project list --tree
project-code project list --hierarchy

# Advanced filtering
project-code project list --parent ~/code/work
project-code project list --show-hidden
project-code project list --max-depth 10
```

### Authentication

| Command | Description |
|---------|-------------|
| `project-code auth login --provider <provider>` | Authenticate with Git provider |
| `project-code auth logout` | Log out from current provider |
| `project-code auth status` | Check authentication status |

#### Authentication Examples
```bash
# GitHub authentication
project-code auth login --provider github --token ghp_your_token_here

# Local provider (no token required)
project-code auth login --provider local

# With username for clarity
project-code auth login --provider github --token ghp_token --username your-username

# Check current status
project-code auth status
```

### Configuration

| Command | Description |
|---------|-------------|
| `project-code config list` | Display current configuration |
| `project-code config add <type> <value>` | Add configuration values |
| `project-code config set <key> <value>` | Set configuration values |
| `project-code config reset` | Reset to default configuration |

#### Configuration Examples
```bash
# Root directories
project-code config add root ~/code
project-code config add root ~/work --name "Work Projects"

# UI settings
project-code config set ui.theme dark
project-code config set ui.sortBy type
project-code config set ui.showDescriptions false

# VS Code integration
project-code config set vscode.enabled true
project-code config set vscode.executablePath /usr/local/bin/code

# Project defaults
project-code config set project.defaultType nodejs
project-code config set project.maxDepth 8
```

## 💡 Common Workflows

### Daily Development

```bash
# See all your projects
project-code project list

# Focus on today's work
project-code project list --search "urgent|priority"

# Open main project
project-code project open my-main-project

# Clone public repository for reference
project-code project clone microsoft/vscode --vscode

# Or clone private repository (requires authentication)
project-code project clone your-username/private-repo --vscode
```

### Project Organization

```bash
# Set up organized structure
mkdir -p ~/code/{web,mobile,api,tools,experiments}

# Configure root folders
project-code config add root ~/code/web
project-code config add root ~/code/mobile
project-code config add root ~/code/api

# Initialize projects in appropriate locations
project-code project init ~/code/web/my-app --type react
project-code project init ~/code/api/my-service --type nodejs
```

### Team Collaboration

```bash
# Set up shared project structure
project-code config add root /shared/team-projects

# Everyone uses same configuration
cp /shared/team-config.json ~/.project-code/config.json

# Team members see same project list
project-code project list --format table
```

## 🔧 Configuration

### Basic Configuration

```bash
# Set up root directories
project-code config add root ~/code
project-code config add root ~/work

# Configure UI preferences
project-code config set ui.theme dark
project-code config set ui.sortBy type

# Set default project type
project-code config set project.defaultType nodejs
```

### VS Code Integration

```bash
# Enable VS Code integration
project-code config set vscode.enabled true

# Set custom VS Code path (if needed)
project-code config set vscode.executablePath /usr/local/bin/code
```

## 🔐 Authentication

Project Code CLI supports authentication with multiple providers. Currently supported providers are GitHub, GitLab, Bitbucket, and Local.

### GitHub Setup

1. **Create Personal Access Token**:
    - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
    - Generate new token with `repo` scope

2. **Authenticate**:
    ```bash
    project-code auth login \
      --provider github \
      --token ghp_your_token_here
    ```

3. **Verify**:
    ```bash
    project-code auth status
    ```

### Local Provider Setup

The Local provider allows you to work with projects without requiring external authentication. This is useful for:

- Local development and testing
- Working with private repositories without tokens
- Offline project management

**Setup**:
```bash
# Authenticate with Local provider (no token required)
project-code auth login --provider local

# Or with a token for consistency
project-code auth login --provider local --token any-value

# Verify authentication
project-code auth status
```

**Use Cases**:
- Managing local projects without Git hosting
- Testing CLI functionality
- Working in environments without internet access
- Development and debugging workflows

## 📁 Directory Structure

Follow the `~/code` convention for optimal organization:

```
~/code/
├── personal/           # Personal projects
│   ├── websites/       # Personal websites
│   └── tools/          # Personal utilities
├── work/               # Work projects
│   ├── current/        # Active projects
│   └── clients/        # Client work
├── experiments/        # Testing & prototypes
└── archives/           # Completed projects
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

- 🐛 **Issues**: [Bug reports and feature requests](https://github.com/qubitquilt/project-code/issues)
- 💬 **Discussions**: [Questions and discussions](https://github.com/qubitquilt/project-code/discussions)
- 📖 **Documentation**: Help improve our docs
- 🧪 **Testing**: Help test new features

## 🔧 Troubleshooting

### Common Issues

#### "Command not found"
```bash
# Ensure Project Code CLI is installed globally
npm install -g project-code

# Or use npx to run without global installation
npx project-code --version
```

#### "Authentication failed"
```bash
# Check authentication status
project-code auth status

# Re-authenticate
project-code auth logout
project-code auth login --provider github --token YOUR_TOKEN

# Verify token is valid
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

#### "No projects found"
```bash
# Check configured root directories
project-code config list

# Add root directories
project-code config add root ~/code
project-code config add root ~/projects

# Rescan projects
project-code project list
```

#### "VS Code integration not working"
```bash
# Check VS Code configuration
project-code config set vscode.enabled true

# Verify VS Code is in PATH
which code

# Set custom VS Code path if needed
project-code config set vscode.executablePath /usr/local/bin/code
```

### Getting Help

- **Command help**: `project-code --help` or `project-code <command> --help`
- **Documentation**: See the [`docs/`](docs/) directory for detailed guides
- **Issues**: [Report bugs](https://github.com/qubitquilt/project-code/issues)
- **Discussions**: [Ask questions](https://github.com/qubitquilt/project-code/discussions)

## ❓ FAQ

### What platforms are supported?
Currently supported: **GitHub**, **GitLab**, **Bitbucket**, and **Local** providers.

### Do I need authentication to use Project Code CLI?
No! The Local provider allows you to use all features without authentication. GitHub authentication is only needed for:
- Cloning private repositories
- Accessing organization repositories
- Using authenticated Git operations

### Can I use Project Code CLI offline?
Yes! The Local provider works completely offline. You can:
- Manage local projects
- Initialize new projects
- Configure settings
- Use all project management features

### How do I backup my configuration?
```bash
# Export current configuration
project-code config list > backup-config.json

# Or backup the config file directly
cp ~/.project-code/config.json ~/backup-config.json
```

### Can I use multiple authentication providers?
Yes! You can authenticate with multiple providers:
```bash
# GitHub for work projects
project-code auth login --provider github --token WORK_TOKEN

# Local for personal projects
project-code auth login --provider local
```

## 🗑️ Uninstallation

### Remove globally installed CLI
```bash
# Remove global installation
npm uninstall -g project-code

# Verify removal
project-code --version  # Should show command not found
```

### Remove user data
```bash
# Remove configuration and cached data
rm -rf ~/.project-code/

# Remove any local installations
npm uninstall project-code  # if installed locally in a project
```

### Clean reinstall
```bash
# Complete removal
npm uninstall -g project-code
rm -rf ~/.project-code/

# Fresh installation
npm install -g project-code
project-code config add root ~/code  # Reconfigure
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [OCLIF](https://oclif.io/) framework
- Inspired by the need for better project management tools
- Thanks to all contributors and supporters

---

**Made with ❤️ for developers who love efficient workflows**
