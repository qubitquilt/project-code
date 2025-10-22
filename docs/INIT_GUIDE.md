# Project Code CLI - Initialization Guide

A comprehensive guide to getting started with the Project Code CLI for managing code projects with VS Code integration.

## 🚀 Quick Start (5-Minute Setup)

Get up and running with Project Code CLI in just 5 minutes:

### 1. Install the CLI

```bash
npm install -g project-code
```

### 2. Set up your code directory

```bash
# Create your main code directory (if it doesn't exist)
mkdir -p ~/code

# Initialize Project Code configuration
project-code config add root ~/code
```

### 3. Authenticate with GitHub (optional but recommended)

```bash
# Login to GitHub for repository cloning
project-code auth login --provider github --token YOUR_GITHUB_TOKEN
```

### 4. Start using the CLI

```bash
# List all discovered projects
project-code project list

# Clone a repository
project-code project clone facebook/react

# Initialize an existing directory as a project
project-code project init my-awesome-project --type nodejs

# Open a project in VS Code
project-code project open my-project
```

🎉 **You're all set!** Start managing your projects with Project Code CLI.

---

## 📋 Prerequisites

Before installing Project Code CLI, ensure you have the following:

### Required Software

- **Node.js**: Version 18.0.0 or higher
  ```bash
  node --version  # Should be >= 18.0.0
  ```

- **npm**: Comes with Node.js, or you can use **yarn** or **pnpm**
  ```bash
  npm --version
  ```

### Optional but Recommended

- **Git**: For version control and cloning repositories
  ```bash
  git --version
  ```

- **VS Code**: For seamless project opening (can also use other editors)
  ```bash
  code --version  # If using VS Code CLI
  ```

### Accounts (Optional)

- **GitHub Account**: For cloning repositories and authentication
- **GitLab Account**: For GitLab repositories (future support)
- **Bitbucket Account**: For Bitbucket repositories (future support)

---

## 📦 Installation

### Option 1: Install Globally (Recommended)

```bash
npm install -g project-code
```

Verify installation:
```bash
project-code --version
project-code --help
```

### Option 2: Install Locally in Project

```bash
npm install --save-dev project-code
npx project-code --help
```

### Option 3: Install from Source

```bash
git clone https://github.com/qubitquilt/project-code.git
cd project-code
npm install
npm run build
npm link  # or npm install -g
```

---

## ⚙️ Initial Configuration

### First-Time Setup

When you first run Project Code CLI, it automatically creates a configuration file at `~/.project-code/config.json` with sensible defaults.

1. **Run any command** to trigger configuration creation:
   ```bash
   project-code project list
   ```

2. **Verify configuration location**:
   ```bash
   cat ~/.project-code/config.json
   ```

### Basic Configuration Commands

```bash
# View current configuration
project-code config list

# Add a root folder for project discovery
project-code config add root ~/code

# Set default project type
project-code config set project.defaultType nodejs

# Enable/disable VS Code integration
project-code config set vscode.enabled true
```

---

## 🔐 Authentication Setup

### GitHub Authentication (Recommended)

1. **Create a Personal Access Token**:
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (Full control of private repositories)
   - Copy the generated token

2. **Authenticate with CLI**:
   ```bash
   project-code auth login --provider github --token YOUR_TOKEN_HERE
   ```

3. **Verify authentication**:
   ```bash
   project-code auth status
   ```

### Token Security Best Practices

- **Use fine-grained tokens** when possible (GitHub's newer token format)
- **Limit token scopes** to only what you need
- **Set expiration dates** on tokens
- **Store tokens securely** (Project Code encrypts them locally)
- **Rotate tokens regularly**

### Multiple Providers

```bash
# GitLab authentication (when supported)
project-code auth login --provider gitlab --token YOUR_TOKEN

# Bitbucket authentication (when supported)
project-code auth login --provider bitbucket --token YOUR_TOKEN
```

---

## 📁 Directory Setup

### The ~/code Convention

Project Code CLI follows the common convention of organizing projects under a `~/code` directory:

```
~/code/
├── personal/
│   ├── my-blog/
│   └── todo-app/
├── work/
│   ├── company-project/
│   └── client-work/
└── experiments/
    └── prototype/
```

### Setting Up Your Code Directory

```bash
# Create main code directory
mkdir -p ~/code

# Add it as a root folder
project-code config add root ~/code

# Create subdirectories for organization
mkdir -p ~/code/{personal,work,experiments}
```

### Custom Directory Structures

You can use any directory structure that works for you:

```bash
# Multiple root directories
project-code config add root ~/projects
project-code config add root ~/work/clients

# Deep directory hierarchies
mkdir -p ~/development/{web,mobile,desktop}/{personal,work}
```

---

## 📂 Adding Existing Projects

### Method 1: Initialize Directory as Project

```bash
# Initialize current directory
project-code project init

# Initialize specific directory
project-code project init ~/code/my-project

# With custom name and type
project-code project init ~/code/my-project \
  --name "My Awesome Project" \
  --type nodejs \
  --description "A Node.js application"
```

### Method 2: Manual Project Addition

For projects that don't follow standard structures:

```bash
# Add project manually to configuration
project-code config add project ~/path/to/project \
  --type python \
  --name "Custom Project"
```

### Project Types Supported

Project Code CLI supports 40+ project types:

**Web Frameworks**: `react`, `vue`, `angular`, `nextjs`, `nuxtjs`, `gatsby`, `svelte`

**Languages**: `javascript`, `typescript`, `nodejs`, `python`, `java`, `csharp`, `php`, `ruby`, `go`, `rust`, `cpp`, `c`, `haskell`, `lua`, `perl`, `kotlin`, `scala`, `swift`, `r`

**Backend**: `express`, `nestjs`, `fastapi`, `flask`, `django`, `spring`

**Other**: `docker`, `kubernetes`, `terraform`, `html`, `css`, `shell`

---

## 🎯 Basic Usage

### Discovering Projects

```bash
# List all projects
project-code project list

# Filter by type
project-code project list --type nodejs
project-code project list --type python

# Search projects
project-code project list --search "my-project"

# JSON output for scripting
project-code project list --format json
```

### Opening Projects

```bash
# Open project in VS Code
project-code project open my-project

# Open specific path
project-code project open ~/code/my-project

# List available projects first
project-code project list
project-code project open 1  # Opens first project in list
```

### Project Management

```bash
# Clone a repository
project-code project clone facebook/react

# Clone with custom path
project-code project clone facebook/react --root ~/experiments

# Clone specific branch
project-code project clone facebook/react --branch main

# Create new project
project-code project create my-new-app --type react
```

---

## 🚀 Advanced Features

### Project Groups and Organization

```bash
# Add tags to projects for organization
project-code project tag add my-project frontend react

# Filter by tags
project-code project list --tag frontend

# Create project groups
project-code config add group work ~/code/work
project-code config add group personal ~/code/personal
```

### GitHub Integration

```bash
# Clone any public repository
project-code project clone microsoft/vscode

# Clone private repository (requires auth)
project-code project clone myorg/private-repo

# Clone with shallow clone for speed
project-code project clone large/repo --depth 1
```

### VS Code Integration

```bash
# Open project in current VS Code window
project-code project open my-project

# Open in new window
project-code project open my-project --new-window

# Configure VS Code settings
project-code config set vscode.enabled true
project-code config set vscode.executablePath /usr/local/bin/code
```

---

## 🔧 Troubleshooting

### Common Issues

**"No projects found"**
```bash
# Check if root folders are configured
project-code config list

# Add root folder if missing
project-code config add root ~/code

# Check if projects exist in the directory
ls -la ~/code
```

**"VS Code not detected"**
```bash
# Check VS Code installation
which code

# Configure custom VS Code path
project-code config set vscode.executablePath /Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code
```

**"Authentication failed"**
```bash
# Check auth status
project-code auth status

# Re-authenticate
project-code auth logout
project-code auth login --provider github --token NEW_TOKEN
```

**"Permission denied"**
```bash
# Check file permissions
ls -la ~/.project-code/

# Fix permissions
chmod 755 ~/.project-code/
chmod 644 ~/.project-code/config.json
```

### Getting Help

```bash
# General help
project-code --help

# Command-specific help
project-code project --help
project-code project init --help
project-code auth --help

# Examples and usage
project-code project init --help  # Shows examples
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* project-code project list

# Check configuration file directly
cat ~/.project-code/config.json
```

---

## 📚 Next Steps

Now that you're set up, explore these features:

1. **📖 [Command Reference](COMMAND_REFERENCE.md)** - Complete command documentation
2. **⚙️ [Configuration Guide](CONFIGURATION.md)** - Customize your setup
3. **💡 [Examples](EXAMPLES.md)** - Real-world usage examples
4. **🏗️ [Directory Structure](DIRECTORY_STRUCTURE.md)** - Best practices for organization
5. **🔐 [Authentication](AUTHENTICATION.md)** - Advanced auth setup

### Useful Commands to Try

```bash
# Explore your codebase
project-code project list --format table

# Set up project organization
project-code config add root ~/code/work
project-code config add root ~/code/personal

# Customize the interface
project-code config set ui.theme dark
project-code config set ui.sortBy type

# Set up shortcuts for frequent projects
project-code project open my-favorite-project
```

### Getting Involved

- **🐛 Found a bug?** [Report it](https://github.com/qubitquilt/project-code/issues)
- **💡 Have a feature request?** [Suggest it](https://github.com/qubitquilt/project-code/discussions)
- **📖 Want to contribute?** Check out the [Contributing Guide](https://github.com/qubitquilt/project-code/blob/main/CONTRIBUTING.md)

---

**Happy coding! 🎉**

*Project Code CLI - Manage your projects with elegance and efficiency.*