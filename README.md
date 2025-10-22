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
- **🔐 Git Provider Authentication** - Secure authentication with GitHub, GitLab, and Bitbucket
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

### Basic Setup

```bash
# Set up your code directory
mkdir -p ~/code
project-code config add root ~/code

# Authenticate with GitHub (optional but recommended)
project-code auth login --provider github --token YOUR_GITHUB_TOKEN

# Discover your projects
project-code project list

# Open a project in VS Code
project-code project open my-project

# Clone a repository
project-code project clone facebook/react
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

### Project Management

| Command | Description |
|---------|-------------|
| `project-code project list` | List all discovered projects |
| `project-code project open <name>` | Open project in VS Code |
| `project-code project init [path]` | Initialize directory as project |
| `project-code project clone <repo>` | Clone GitHub repository |
| `project-code project create <name>` | Create new project |

### Authentication

| Command | Description |
|---------|-------------|
| `project-code auth login` | Authenticate with Git provider |
| `project-code auth logout` | Log out from current provider |
| `project-code auth status` | Check authentication status |

### Configuration

| Command | Description |
|---------|-------------|
| `project-code config list` | Display current configuration |
| `project-code config add <type> <value>` | Add configuration values |
| `project-code config set <key> <value>` | Set configuration values |
| `project-code config reset` | Reset to default configuration |

## 💡 Common Workflows

### Daily Development

```bash
# See all your projects
project-code project list

# Focus on today's work
project-code project list --search "urgent|priority"

# Open main project
project-code project open my-main-project

# Clone dependency for reference
project-code project clone lodash/lodash --vscode
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

We welcome contributions! Please see our [Contributing Guide](https://github.com/qubitquilt/project-code/blob/main/CONTRIBUTING.md) for details.

- 🐛 **Issues**: [Bug reports and feature requests](https://github.com/qubitquilt/project-code/issues)
- 💬 **Discussions**: [Questions and discussions](https://github.com/qubitquilt/project-code/discussions)
- 📖 **Documentation**: Help improve our docs
- 🧪 **Testing**: Help test new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [OCLIF](https://oclif.io/) framework
- Inspired by the need for better project management tools
- Thanks to all contributors and supporters

---

**Made with ❤️ for developers who love efficient workflows**
