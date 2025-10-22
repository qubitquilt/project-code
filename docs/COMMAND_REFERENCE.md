# Project Code CLI - Command Reference

Complete documentation of all Project Code CLI commands, options, and usage examples.

## 📖 Table of Contents

- [Project Commands](#project-commands)
  - [`project-code project list`](#project-code-project-list)
  - [`project-code project open`](#project-code-project-open)
  - [`project-code project init`](#project-code-project-init)
  - [`project-code project clone`](#project-code-project-clone)
  - [`project-code project create`](#project-code-project-create)
- [Authentication Commands](#authentication-commands)
  - [`project-code auth login`](#project-code-auth-login)
  - [`project-code auth logout`](#project-code-auth-logout)
  - [`project-code auth status`](#project-code-auth-status)
- [Configuration Commands](#configuration-commands)
  - [`project-code config list`](#project-code-config-list)
  - [`project-code config add`](#project-code-config-add)
  - [`project-code config set`](#project-code-config-set)
  - [`project-code config reset`](#project-code-config-reset)
- [Global Options](#global-options)

---

## Project Commands

Commands for managing and working with code projects.

### `project-code project list`

List all discovered projects in configured root directories.

#### Usage
```bash
project-code project list [options]
```

#### Options
- `-t, --type <type>` - Filter projects by type (e.g., `nodejs`, `python`, `react`)
- `-s, --search <query>` - Search projects by name or path
- `-f, --format <format>` - Output format: `table` (default) or `json`
- `--show-hidden` - Show hidden files and directories
- `--max-depth <number>` - Maximum directory depth to scan (default: 5)
- `-d, --depth <number>` - Maximum hierarchy depth to display (default: 10)
- `-h, --hierarchy` - Display projects with hierarchy information
- `-p, --parent <path>` - Filter projects by parent directory
- `--tree` - Display projects in tree format

#### Examples
```bash
# List all projects
project-code project list

# List only Node.js projects
project-code project list --type nodejs

# Search for projects containing "react"
project-code project list --search react

# Export project list as JSON
project-code project list --format json > projects.json

# Show hidden projects
project-code project list --show-hidden

# Scan deeper directory levels
project-code project list --max-depth 10

# Display projects in tree format
project-code project list --tree

# Display projects with hierarchy information
project-code project list --hierarchy

# Filter projects by parent directory
project-code project list --parent ~/code/work

# Limit hierarchy depth display
project-code project list --hierarchy --depth 3

# Combine tree view with parent filtering
project-code project list --tree --parent ~/code/personal --depth 2
```

#### Output Format

**Table Format:**
```
📁 Projects
─────────────────────────────────────────────────────────
Name                │ Type       │ Path                    │ Description
─────────────────────────────────────────────────────────
my-react-app       │ react      │ ~/code/web/my-react-app │ A React application
api-server         │ nodejs     │ ~/code/api/api-server   │ REST API server
data-processor     │ python     │ ~/code/tools/data-proc  │ Data processing tool
─────────────────────────────────────────────────────────
Total: 3 projects
```

**Tree Format:**
```
🌳 Projects (Tree View)

~/code/
├── personal/
│   ├── todo-app/
│   └── blog-site/
└── work/
    ├── api-gateway/
    └── microservices/
        ├── auth-service/
        └── user-service/

Total: 7 projects
```

**Hierarchy Table Format:**
```
📊 Projects (Hierarchy View)

─────────────────────────────────────────────────────────────────────────────
Level │ Name                │ Type       │ Path                    │ Description
─────────────────────────────────────────────────────────────────────────────
0     │ code               │ directory  │ ~/code                  │ Root directory
1     │ personal           │ directory  │ ~/code/personal         │ Personal projects
2     │ todo-app           │ react      │ ~/code/personal/todo-app│ Todo application
2     │ blog-site          │ nodejs     │ ~/code/personal/blog-site│ Blog website
1     │ work               │ directory  │ ~/code/work             │ Work projects
2     │ api-gateway        │ nodejs     │ ~/code/work/api-gateway │ API gateway service
─────────────────────────────────────────────────────────────────────────────
Total: 7 projects
```

**JSON Format:**
```json
[
  {
    "name": "my-react-app",
    "path": "~/code/web/my-react-app",
    "type": "react",
    "description": "A React application",
    "lastModified": "2024-01-15T10:30:00.000Z",
    "tags": ["frontend", "web"]
  }
]
```

---

### `project-code project open`

Open a project in VS Code or your default editor.

#### Usage
```bash
project-code project open <project-name | path | index> [options]
```

#### Arguments
- `<project>` - Project name, path, or index number from `project list`

#### Options
- `--new-window` - Open in a new VS Code window
- `--reuse-window` - Reuse the current VS Code window (default)

#### Examples
```bash
# Open project by name
project-code project open my-react-app

# Open project by path
project-code project open ~/code/web/my-react-app

# Open first project from list
project-code project list
project-code project open 1

# Open in new VS Code window
project-code project open my-project --new-window
```

#### Notes
- Requires VS Code to be installed and in PATH
- Can be configured with `project-code config set vscode.enabled true`
- Falls back to default file manager if VS Code is not available

---

### `project-code project init`

Initialize an existing directory as a project with proper structure.

#### Usage
```bash
project-code project init [path] [options]
```

#### Arguments
- `[path]` - Path to directory to initialize (default: current directory)

#### Options
- `-n, --name <name>` - Project name (defaults to directory name)
- `-d, --description <description>` - Project description
- `-t, --type <type>` - Project type (see supported types below)
- `-v, --vscode` - Open in VS Code after initialization

#### Supported Project Types
`angular`, `clojure`, `cpp`, `csharp`, `css`, `django`, `docker`, `dotnet`, `express`, `fastapi`, `flask`, `gatsby`, `go`, `haskell`, `html`, `java`, `javascript`, `kotlin`, `kubernetes`, `lua`, `matlab`, `nestjs`, `nextjs`, `nodejs`, `nuxtjs`, `perl`, `php`, `python`, `r`, `react`, `ruby`, `rust`, `scala`, `shell`, `spring`, `svelte`, `swift`, `terraform`, `typescript`, `unknown`, `vue`

#### Examples
```bash
# Initialize current directory
project-code project init

# Initialize specific directory
project-code project init ~/code/my-project

# Initialize with custom name and type
project-code project init ~/code/my-project \
  --name "My Awesome Project" \
  --type nodejs \
  --description "A Node.js application"

# Initialize and open in VS Code
project-code project init my-project --vscode --type react
```

#### What Gets Created

**For all projects:**
- `README.md` - Project documentation with template
- `.gitignore` - Appropriate gitignore for project type

**For specific types:**
- **Node.js/TypeScript**: `package.json`, `index.js`
- **Python**: `requirements.txt`, `main.py`, `setup.py`
- **Rust**: `Cargo.toml`, `src/main.rs`
- **Go**: `go.mod`, `main.go`

---

### `project-code project clone`

Clone a GitHub repository using project tag format.

#### Usage
```bash
project-code project clone <project-tag> [options]
```

#### Arguments
- `<project-tag>` - Repository in format `owner/repo` or `platform:owner/repo`

#### Options
- `-b, --branch <branch>` - Branch to clone
- `-d, --depth <number>` - Clone depth for shallow clone
- `-r, --root <path>` - Custom root directory for project
- `-v, --vscode` - Open in VS Code after cloning

#### Examples
```bash
# Clone a repository
project-code project clone facebook/react

# Clone with platform prefix
project-code project clone github:facebook/react

# Clone specific branch
project-code project clone facebook/react --branch main

# Shallow clone for speed
project-code project clone facebook/react --depth 1

# Clone to custom location
project-code project clone facebook/react --root ~/experiments

# Clone and open in VS Code
project-code project clone facebook/react --vscode
```

#### Project Tag Formats

- `owner/repo` (GitHub assumed)
- `github:owner/repo`
- `gitlab:owner/repo` (future support)
- `bitbucket:owner/repo` (future support)

---

### `project-code project create`

Create a new project from template.

#### Usage
```bash
project-code project create <name> [options]
```

#### Arguments
- `<name>` - Name of the new project

#### Options
- `-t, --type <type>` - Project type (required)
- `-d, --description <description>` - Project description
- `--template <template>` - Template to use
- `--root <path>` - Custom root directory

#### Examples
```bash
# Create a React project
project-code project create my-react-app --type react

# Create with description
project-code project create api-server \
  --type nodejs \
  --description "REST API server"

# Create in custom location
project-code project create my-project \
  --type python \
  --root ~/experiments
```

---

## Authentication Commands

Commands for managing authentication with Git providers.

### `project-code auth login`

Authenticate with a Git provider.

#### Usage
```bash
project-code auth login [options]
```

#### Options
- `-p, --provider <provider>` - Git provider: `github`, `gitlab`, `bitbucket`, `local` (required)
- `-t, --token <token>` - Personal access token or app password (required)
- `-u, --username <username>` - Username for authentication

#### Examples
```bash
# GitHub authentication
project-code auth login \
  --provider github \
  --token ghp_your_github_token_here

# GitHub with username
project-code auth login \
  --provider github \
  --token ghp_your_token \
  --username your-username

# GitLab authentication (when supported)
project-code auth login \
  --provider gitlab \
  --token glpat-your_token_here
```

#### Token Setup Guides

**GitHub:**
1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate new token with `repo` scope
3. Copy and use the token

**GitLab:**
1. Go to [GitLab Preferences > Access Tokens](https://gitlab.com/-/profile/personal_access_tokens)
2. Create token with `read_repository` and `write_repository` scopes

---

### `project-code auth logout`

Log out from the current authentication provider.

#### Usage
```bash
project-code auth logout [options]
```

#### Examples
```bash
# Logout from current provider
project-code auth logout

# Check status after logout
project-code auth status
```

---

### `project-code auth status`

Check current authentication status.

#### Usage
```bash
project-code auth status
```

#### Examples
```bash
# Check authentication status
project-code auth status
```

#### Sample Output
```
🔐 Authentication Status
   Provider: github
   Username: john-doe
   Status: Authenticated
   Permissions: repo, workflow
   Expires: 2024-06-15T10:30:00.000Z
```

---

## Configuration Commands

Commands for managing Project Code CLI configuration.

### `project-code config list`

Display current configuration.

#### Usage
```bash
project-code config list
```

#### Examples
```bash
# Show current configuration
project-code config list

# Save configuration to file
project-code config list > config-backup.json
```

#### Sample Output
```json
{
  "defaultRootFolder": "~/code",
  "rootFolders": ["~/code", "~/projects"],
  "auth": {
    "enabled": true,
    "defaultProvider": "github",
    "providers": {
      "github": { "enabled": true },
      "gitlab": { "enabled": false },
      "bitbucket": { "enabled": false }
    }
  },
  "ui": {
    "theme": "auto",
    "sortBy": "name",
    "sortOrder": "asc",
    "showDescriptions": true,
    "showTags": true
  }
}
```

---

### `project-code config add`

Add configuration values.

#### Usage
```bash
project-code config add <type> <value> [options]
```

#### Types and Options

**Root Folders:**
```bash
project-code config add root ~/code
project-code config add root ~/projects --name "Work Projects"
```

**Project Types:**
```bash
project-code config add type python --description "Python projects"
```

**Tags:**
```bash
project-code config add tag frontend --color blue
```

#### Examples
```bash
# Add root folder
project-code config add root ~/code

# Add multiple root folders
project-code config add root ~/personal
project-code config add root ~/work

# Add project type with description
project-code config add type react --description "React applications"
```

---

### `project-code config set`

Set configuration values.

#### Usage
```bash
project-code config set <key> <value>
```

#### Common Settings

**UI Settings:**
```bash
project-code config set ui.theme dark
project-code config set ui.sortBy type
project-code config set ui.sortOrder desc
project-code config set ui.showDescriptions false
```

**Project Settings:**
```bash
project-code config set project.defaultType nodejs
project-code config set project.maxDepth 10
```

**VS Code Settings:**
```bash
project-code config set vscode.enabled true
project-code config set vscode.executablePath /usr/local/bin/code
```

#### Examples
```bash
# Set UI theme
project-code config set ui.theme dark

# Set default project type
project-code config set project.defaultType react

# Configure VS Code integration
project-code config set vscode.enabled true

# Set maximum scan depth
project-code config set project.maxDepth 8
```

---

### `project-code config reset`

Reset configuration to defaults.

#### Usage
```bash
project-code config reset [options]
```

#### Options
- `--confirm` - Skip confirmation prompt

#### Examples
```bash
# Reset with confirmation
project-code config reset

# Reset without confirmation
project-code config reset --confirm
```

---

## Global Options

Options available for all commands.

### Help Options
- `-h, --help` - Show help for any command
- `--help` - Show detailed help

### Output Options
- `--json` - Output in JSON format (where supported)
- `-v, --verbose` - Verbose output
- `-q, --quiet` - Quiet output

### Examples
```bash
# Get help for any command
project-code --help
project-code project --help
project-code project init --help

# Verbose output
project-code project list --verbose

# JSON output
project-code project list --format json

# Quiet mode
project-code project clone repo --quiet
```

---

## Command Aliases

Some commands have shorter aliases for convenience:

- `project-code project ls` → `project-code project list`
- `project-code project op` → `project-code project open`

---

## Exit Codes

Project Code CLI returns standard exit codes:

- `0` - Success
- `1` - General error
- `2` - Invalid usage
- `3` - Network error
- `4` - Authentication error
- `5` - Configuration error

---

## Environment Variables

Configuration can be overridden with environment variables:

- `PROJECT_CODE_CONFIG_PATH` - Custom config file path
- `PROJECT_CODE_ROOT_FOLDERS` - Comma-separated root folders
- `PROJECT_CODE_LOG_LEVEL` - Set log level (debug, info, warn, error)

---

*For more examples and workflows, see [Examples Documentation](EXAMPLES.md).*