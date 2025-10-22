# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Code CLI (project-code) is a powerful CLI tool for managing code projects with VS Code integration. Built with OCLIF framework, it helps developers discover, organize, and work with projects across multiple directories with authentication, project cloning, and automation features.

## Development Commands

### Build and Development
```bash
# Build TypeScript to dist/
npm run build

# Run in development mode (uses ts-node)
npm run dev

# Run the CLI locally
./bin/run.js [command]
```

### Testing and Linting
```bash
# Run tests (uses Mocha)
npm test

# Run linter (ESLint)
npm run lint

# Combined: runs tests then lint
npm run posttest
```

### OCLIF-Specific Commands
```bash
# Generate oclif.manifest.json and update README
npm run prepack

# Used during npm publishing workflow
npm run version
```

## Architecture

### Core Service Layer (`src/lib/`)

The application follows a service-oriented architecture with singleton patterns and clear separation of concerns:

- **ConfigManager** (`config.ts`) - Singleton managing `~/.project-code/config.json` with validation, default merging, and type-safe configuration updates
- **ProjectDiscoveryService** (`project-discovery.ts`) - Recursively scans directories to identify projects by analyzing file patterns (package.json, requirements.txt, Cargo.toml, etc.), determines project types, and builds hierarchical project structures
- **AuthService** (`auth-service.ts`) - Handles authentication flow with multiple Git providers (GitHub, GitLab, Bitbucket, local), manages token lifecycle with automatic validation timers
- **SecureStorage** (`secure-storage.ts`) - Cross-platform encrypted credential storage using AES-256-CBC, stores auth data in `~/.project-code/*.enc` files with 0o600 permissions
- **VSCodeService** (`vscode-service.ts`) - Detects VS Code installation, opens projects via `code` command
- **GitHubService** (`github-service.ts`) - GitHub API integration for repository cloning and management
- **DirectoryManager** (`directory-manager.ts`) - File system operations for project creation and initialization

### Command Structure (`src/commands/`)

OCLIF commands are organized by topic with automatic routing:

- `project/*` - Project management (list, open, create, init, clone)
- `auth/*` - Authentication (login, logout, status)
- `config/*` - Configuration management (add, set, list, reset)

Each command extends `Command` from `@oclif/core` with:
- Static `description` and `examples` properties
- Static `flags` definition with types and validation
- `async run()` method as entry point

### Type System (`src/types/`)

Central type definitions in `types/index.ts` and `types/auth.ts`:
- **ProjectConfig** - Complete application configuration schema
- **ProjectInfo** - Discovered project metadata with type detection
- **ProjectType** - Union of 40+ supported project types
- **CommandResult<T>** - Standard result wrapper with success/error/data pattern

### Project Discovery Algorithm

The discovery service uses a depth-first recursive scan:
1. Starts from configured `rootFolders` (default: `~/code`)
2. Respects `maxDepth` (default: 5) and `excludePatterns`
3. Identifies projects by "indicator files" (package.json, go.mod, etc.)
4. Determines type by analyzing file patterns and package.json dependencies
5. Builds hierarchy based on directory nesting relationships

### Authentication Flow

1. User provides token via `auth login --provider github --token <token>`
2. AuthService validates and wraps token in AuthTokens structure
3. SecureStorage encrypts data with provider-specific key derivation
4. Stored as JSON in `~/.project-code/<provider>_<username>.enc`
5. Background timer validates tokens every 5 minutes
6. Token automatically loaded from storage on subsequent commands

## Configuration

### File Location
- Config: `~/.project-code/config.json`
- Encrypted auth: `~/.project-code/*.enc`

### Default Configuration Structure
```typescript
{
  rootFolders: ['~/code'],
  defaultRootFolder: '~/code',
  project: {
    maxDepth: 5,
    excludePatterns: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
    includePatterns: ['**/*.js', '**/*.ts', '**/package.json'],
    supportedTypes: ['javascript', 'typescript', 'python', ...]
  },
  auth: {
    enabled: true,
    defaultProvider: 'github',
    tokenValidationInterval: 300000 // 5 minutes
  },
  ui: {
    theme: 'auto',
    sortBy: 'name',
    sortOrder: 'asc',
    showDescriptions: true,
    showTags: true
  },
  vscode: {
    enabled: true
  }
}
```

## Key Patterns

### Singleton Services
ConfigManager uses getInstance() pattern - always retrieve via `ConfigManager.getInstance()` rather than creating new instances.

### Result Pattern
All service methods return `CommandResult<T>` with consistent error handling:
```typescript
const result = service.someOperation();
if (!result.success) {
  this.error(result.error);
  return;
}
// Use result.data
```

### Service Dependencies
Commands instantiate services in `run()` method. Services may depend on ConfigManager but avoid circular dependencies.

### Module System
Project uses ES modules (`"type": "module"` in package.json). All imports must include `.js` extension even when importing `.ts` files during development.

## Common Tasks

### Adding a New Command
1. Create file in `src/commands/<topic>/<name>.ts`
2. Extend `Command` from `@oclif/core`
3. Define static `description`, `flags`, and `examples`
4. Implement `async run()` method
5. Use existing services from `src/lib/`
6. Run `npm run build` to compile

### Adding a New Project Type
1. Add type to `ProjectType` union in `src/types/index.ts`
2. Update `determineProjectType()` in `project-discovery.ts` with detection logic
3. Add to `supportedTypes` default in `config.ts` if needed
4. Update flags in `project/list.ts` command

### Modifying Configuration Schema
1. Update `ProjectConfig` interface in `src/types/index.ts`
2. Update `getDefaultConfig()` in `src/lib/config.ts`
3. Update merge methods (`mergeAuthConfig`, `mergeProjectConfig`, etc.)
4. Update validation in `validateConfig()` if adding constraints

### Adding Authentication Provider
1. Add provider to `AuthProvider` type in `src/types/auth.ts`
2. Update `getDefaultScope()` in `auth-service.ts`
3. Update validation in `config.ts` validProviders array
4. Add provider-specific service in `src/lib/` if needed (like `github-service.ts`)

## Testing

Tests should be placed in `test/` directory with `.test.ts` extension. Mocha is configured to:
- Use ts-node for TypeScript execution
- Run recursively in test directory
- Use "spec" reporter
- 60 second timeout
- Support ES modules via loader flags

## Important Notes

- **Never commit** `.env` files or tokens to the repository
- Encrypted auth files in `~/.project-code/*.enc` use simple encryption for MVP - consider proper key management for production
- OCLIF automatically generates README and manifest during `npm run prepack`
- All file system operations should respect configured `excludePatterns` to avoid scanning node_modules, dist, etc.
- VS Code integration requires `code` command in PATH
