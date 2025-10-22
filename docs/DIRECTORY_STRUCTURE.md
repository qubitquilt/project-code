# Project Code CLI - Directory Structure Guide

Best practices and conventions for organizing your code projects with Project Code CLI.

## 📖 Table of Contents

- [The ~/code Convention](#the-code-convention)
- [Directory Hierarchy](#directory-hierarchy)
- [Project Organization Patterns](#project-organization-patterns)
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [Workspace Management](#workspace-management)
- [Monorepo Structure](#monorepo-structure)
- [Archive and Backup](#archive-and-backup)

---

## The ~/code Convention

Project Code CLI follows the widely-adopted convention of organizing all code projects under a `~/code` directory.

### Why ~/code?

1. **Consistency**: Standard across many developers
2. **Memorability**: Easy to remember and type
3. **Tool Integration**: Many tools expect this structure
4. **Backup Simplicity**: Single directory to backup
5. **Performance**: Faster project discovery

### Setting Up ~/code

```bash
# Create the main code directory
mkdir -p ~/code

# Add to Project Code configuration
project-code config add root ~/code

# Create initial subdirectory structure
mkdir -p ~/code/{personal,work,experiments,archives}
```

### Alternative Structures

While `~/code` is recommended, you can use other structures:

```bash
# Development-focused
~/development/{projects,tools,libraries}

# Work-focused
~/projects/{company,personal,clients}

# Technology-focused
~/code/{web,mobile,desktop,data-science}
```

---

## Directory Hierarchy

### Basic Hierarchy

```
~/code/
├── personal/           # Personal projects
│   ├── websites/       # Personal websites
│   ├── tools/          # Personal utilities
│   └── experiments/    # Personal experiments
├── work/               # Work-related projects
│   ├── current/        # Active work projects
│   ├── completed/      # Finished work projects
│   └── clients/        # Client projects
├── experiments/        # Testing and prototypes
│   ├── ideas/          # Project ideas
│   ├── spikes/         # Technical spikes
│   └── learning/       # Learning projects
└── archives/           # Archived projects
    ├── 2024/           # By year
    ├── 2023/           # Previous years
    └── old/            # Legacy projects
```

### Technology-Based Hierarchy

```
~/code/
├── web/                # Web technologies
│   ├── react/          # React applications
│   ├── vue/            # Vue applications
│   ├── vanilla/        # Vanilla JS projects
│   └── static/         # Static sites
├── mobile/             # Mobile development
│   ├── react-native/   # React Native apps
│   ├── flutter/        # Flutter apps
│   └── ios/            # iOS projects
├── backend/            # Backend services
│   ├── nodejs/         # Node.js services
│   ├── python/         # Python services
│   └── go/             # Go services
├── data/               # Data science & ML
│   ├── python/         # Python data projects
│   ├── r/              # R projects
│   └── notebooks/      # Jupyter notebooks
└── tools/              # Development tools
    ├── scripts/        # Utility scripts
    ├── configs/        # Configuration files
    └── templates/      # Project templates
```

### Client-Based Hierarchy

```
~/code/
├── clients/
│   ├── client-a/
│   │   ├── frontend/   # Client A frontend
│   │   ├── backend/    # Client A backend
│   │   └── mobile/     # Client A mobile
│   ├── client-b/
│   │   ├── web/        # Client B web app
│   │   └── api/        # Client B API
│   └── internal/       # Internal tools
└── personal/           # Personal projects
```

---

## Project Organization Patterns

### Pattern 1: Technology-First

Organize by technology stack first, then by project.

```
~/code/
├── react-projects/
│   ├── e-commerce/
│   ├── blog-platform/
│   └── admin-dashboard/
├── python-projects/
│   ├── data-analysis/
│   ├── automation-scripts/
│   └── web-scrapers/
└── go-projects/
    ├── microservices/
    ├── cli-tools/
    └── libraries/
```

**Pros:**
- Easy to find projects by technology
- Consistent tooling per directory
- Clear separation of concerns

**Cons:**
- Projects for same client spread across directories
- May need multiple VS Code workspaces

### Pattern 2: Project-First

Organize by project/client first, then by technology.

```
~/code/
├── client-alpha/
│   ├── frontend/       # React app
│   ├── backend/        # Node.js API
│   ├── mobile/         # React Native
│   └── docs/           # Documentation
├── personal-website/
│   ├── frontend/       # Next.js
│   ├── cms/            # Headless CMS
│   └── design/         # Design assets
└── tools/
    ├── deployment/     # Deployment scripts
    └── monitoring/     # Monitoring tools
```

**Pros:**
- Projects are co-located
- Easy to work on complete solutions
- Natural client/project boundaries

**Cons:**
- Mixed technologies in same area
- May require different tooling setups

### Pattern 3: Hybrid Approach

Combine technology and project organization.

```
~/code/
├── web/
│   ├── client-work/
│   │   ├── client-a/
│   │   └── client-b/
│   └── personal/
│       ├── blog/
│       └── portfolio/
├── mobile/
│   ├── work/
│   └── personal/
└── tools/
    └── scripts/
```

---

## Naming Conventions

### Directory Names

**✅ Good:**
- `my-project`
- `user-authentication`
- `data-processing-service`
- `e-commerce-platform`

**❌ Avoid:**
- `My Project` (spaces)
- `project_v2` (version in name)
- `temp` (too generic)
- `new-project-final-final` (unprofessional)

### Project Names

**✅ Good:**
- `user-auth-service`
- `product-catalog-api`
- `admin-dashboard`
- `data-migration-tool`

**❌ Avoid:**
- `project1`, `project2` (not descriptive)
- `temp-project` (temporary sounding)
- `new-project` (not specific)
- `untitled` (unprofessional)

### File Naming

**Project Files:**
- `README.md` (always capitalize)
- `package.json` (npm projects)
- `requirements.txt` (Python projects)
- `Cargo.toml` (Rust projects)
- `go.mod` (Go projects)

**Configuration Files:**
- `.gitignore`
- `.eslintrc.js`
- `tsconfig.json`
- `jest.config.js`

---

## File Organization

### Project Structure Best Practices

**Standard Project Layout:**
```
my-project/
├── README.md              # Project overview
├── package.json           # Dependencies (Node.js)
├── src/                   # Source code
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── utils/             # Utility functions
│   └── index.js           # Entry point
├── public/                # Static assets
├── tests/                 # Test files
├── docs/                  # Documentation
└── .gitignore            # Git ignore rules
```

**Documentation Structure:**
```
my-project/
├── README.md              # Main project readme
├── docs/
│   ├── api.md             # API documentation
│   ├── setup.md           # Setup instructions
│   ├── deployment.md      # Deployment guide
│   └── changelog.md       # Change log
└── examples/              # Usage examples
```

**Configuration Structure:**
```
my-project/
├── src/
├── config/
│   ├── development.json   # Dev configuration
│   ├── production.json    # Prod configuration
│   └── test.json          # Test configuration
└── .env.example           # Environment variables template
```

### Large Project Organization

**Microservices Structure:**
```
platform/
├── services/
│   ├── user-service/
│   ├── order-service/
│   └── payment-service/
├── shared/
│   ├── libraries/
│   └── configs/
├── docker/
│   ├── docker-compose.yml
│   └── kubernetes/
└── docs/
    ├── architecture.md
    └── api-contracts.md
```

**Monorepo Structure:**
```
monorepo/
├── packages/
│   ├── ui-components/
│   ├── utilities/
│   └── api-client/
├── apps/
│   ├── web/
│   ├── mobile/
│   └── admin/
├── tools/
│   ├── build-scripts/
│   └── dev-tools/
└── docs/
```

---

## Workspace Management

### VS Code Workspaces

**Single Project Workspace:**
```json
{
  "folders": [
    {
      "name": "My Project",
      "path": "~/code/my-project"
    }
  ],
  "settings": {
    "typescript.preferences.importModuleSpecifier": "relative"
  }
}
```

**Multi-Project Workspace:**
```json
{
  "folders": [
    {
      "name": "Frontend",
      "path": "~/code/client-a/frontend"
    },
    {
      "name": "Backend",
      "path": "~/code/client-a/backend"
    },
    {
      "name": "Shared",
      "path": "~/code/shared/libraries"
    }
  ]
}
```

### Workspace Configuration

```bash
# Create workspace for client project
mkdir -p ~/code/client-a/.vscode

cat > ~/code/client-a/.vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "eslint.workingDirectories": [
    "~/code/client-a/frontend",
    "~/code/client-a/backend"
  ]
}
EOF
```

---

## Monorepo Structure

### Basic Monorepo

```
my-monorepo/
├── packages/              # Shared packages
│   ├── ui/               # UI component library
│   ├── utils/            # Utility functions
│   └── types/            # TypeScript types
├── apps/                 # Applications
│   ├── web/              # Web application
│   ├── admin/            # Admin interface
│   └── mobile/           # Mobile app
├── tools/                # Development tools
│   ├── build/            # Build scripts
│   └── dev/              # Development utilities
└── README.md             # Monorepo overview
```

### Package Structure

**Individual Package:**
```
packages/ui/
├── src/
│   ├── components/
│   ├── index.ts
│   └── styles.css
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

**Application Structure:**
```
apps/web/
├── src/
│   ├── pages/
│   ├── components/
│   └── App.tsx
├── public/
├── package.json
├── vite.config.ts
└── README.md
```

### Monorepo Configuration

```bash
# Configure Project Code for monorepo
project-code config add root ~/code/my-monorepo

# Set monorepo-specific settings
project-code config set project.maxDepth 4
project-code config set project.excludePatterns '[
  "**/node_modules/**",
  "**/dist/**",
  "**/coverage/**"
]'
```

---

## Archive and Backup

### Archive Structure

```
~/code/archives/
├── 2024/
│   ├── january/
│   ├── february/
│   └── completed-projects/
├── 2023/
│   ├── client-work/
│   └── personal-projects/
└── legacy/
    ├── old-format/
    └── incompatible/
```

### Backup Strategy

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-projects.sh

BACKUP_ROOT=~/backups/code-$(date +%Y%m%d)
mkdir -p "$BACKUP_ROOT"

# Backup active projects
project-code project list --format json | \
  jq -r '.[] | select(.tags[]? | contains("active")) | .path' | \
  while read project_path; do
    project_name=$(basename "$project_path")
    echo "Backing up $project_name"
    tar -czf "$BACKUP_ROOT/${project_name}.tar.gz" \
      -C "$(dirname "$project_path")" \
      "$(basename "$project_path")"
  done

echo "Backup completed: $BACKUP_ROOT"
```

### Cleanup Strategy

**Clean Up Old Projects:**
```bash
# Find projects not modified in 6 months
find ~/code -type d -name ".git" -mtime +180

# Archive old projects
PROJECTS_TO_ARCHIVE=(
  "~/code/old-project-1"
  "~/code/prototype-2023"
)

for project in "${PROJECTS_TO_ARCHIVE[@]}"; do
  if [ -d "$project" ]; then
    year=$(date +%Y)
    archive_path="~/code/archives/$year/$(basename "$project")"
    mv "$project" "$archive_path"
    echo "Archived: $project -> $archive_path"
  fi
done
```

---

## Best Practices

### General Guidelines

1. **Be Consistent**: Use the same structure across all projects
2. **Be Descriptive**: Use clear, meaningful names
3. **Keep it Simple**: Avoid overly complex hierarchies
4. **Document Structure**: Maintain a README in each major directory
5. **Regular Cleanup**: Archive completed projects regularly

### Performance Considerations

1. **Limit Depth**: Keep directory depth reasonable (≤5 levels)
2. **Exclude Large Directories**: Exclude `node_modules`, `dist`, `build`
3. **Use Appropriate Patterns**: Configure include/exclude patterns wisely
4. **Regular Maintenance**: Clean up unused projects

### Team Consistency

**Shared Structure:**
```bash
# Team standard structure
~/code/
├── team/
│   ├── services/       # Team services
│   ├── tools/          # Team tools
│   └── docs/           # Team documentation
├── clients/            # Client projects
└── personal/           # Personal sandboxes
```

**Team Conventions:**
- Use consistent naming across all projects
- Follow team coding standards
- Maintain shared documentation
- Use team templates for new projects

---

## Migration Guide

### Migrating Existing Projects

**Step 1: Analyze Current Structure**
```bash
# See current project locations
find ~/projects -type d -name ".git" | head -10

# Count projects by type
find ~/projects -name "package.json" | wc -l  # Node.js projects
find ~/projects -name "requirements.txt" | wc -l  # Python projects
```

**Step 2: Plan New Structure**
```bash
# Create new structure
mkdir -p ~/code/{personal,work,experiments}

# Move personal projects
mv ~/projects/my-blog ~/code/personal/
mv ~/projects/todo-app ~/code/personal/

# Move work projects
mv ~/projects/company-project ~/code/work/
```

**Step 3: Update Configuration**
```bash
# Update Project Code configuration
project-code config reset
project-code config add root ~/code
project-code config add root ~/code/personal
project-code config add root ~/code/work
```

### Handling Different Structures

**From Multiple Directories:**
```bash
# Consolidate scattered projects
find ~/Documents/projects ~/Desktop/work ~/github -name ".git" 2>/dev/null | \
  while read git_dir; do
    project_root=$(dirname "$git_dir")
    project_name=$(basename "$project_root")
    target_dir="~/code/$(echo $project_name | tr ' ' '-')"

    if [ ! -d "$target_dir" ]; then
      mv "$project_root" "$target_dir"
      echo "Moved: $project_root -> $target_dir"
    fi
  done
```

---

## Troubleshooting

### Common Structure Issues

**"Projects not discovered"**
```bash
# Check if directories are in root folders
project-code config list | grep rootFolders

# Add missing directories
project-code config add root ~/code

# Check directory permissions
ls -la ~/code
```

**"Too many results"**
```bash
# Limit scan depth
project-code config set project.maxDepth 3

# Add more specific exclude patterns
project-code config set project.excludePatterns '[
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/temp/**"
]'
```

**"Performance issues"**
```bash
# Reduce scan scope
project-code config set project.maxDepth 4

# Exclude large directories
project-code config set project.excludePatterns '[
  "**/node_modules/**",
  "**/*.log",
  "**/tmp/**"
]'
```

---

## Tools and Utilities

### Directory Management Scripts

**Project Overview Script:**
```bash
#!/bin/bash
# project-overview.sh

echo "=== Project Overview ==="
echo "Total projects: $(project-code project list --format json | jq length)"

echo ""
echo "=== By Technology ==="
project-code project list --format json | \
  jq 'group_by(.type) | map({type: .[0].type, count: length}) | sort_by(.count) | reverse'

echo ""
echo "=== Recent Activity ==="
project-code project list --sortBy updatedAt --sortOrder desc --format table | head -10
```

**Cleanup Script:**
```bash
#!/bin/bash
# cleanup-projects.sh

# Find empty directories
find ~/code -type d -empty

# Find old projects (not modified in 90 days)
find ~/code -type d -name ".git" -mtime +90

# Archive old projects
echo "Consider archiving projects not modified in 90+ days"
```

---

*For practical examples of these structures in action, see [Examples](EXAMPLES.md). For configuration options, see [Configuration Guide](CONFIGURATION.md).*