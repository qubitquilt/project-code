# Project Code CLI - Examples and Workflows

Real-world examples and workflows demonstrating Project Code CLI usage in various development scenarios.

## 📖 Table of Contents

- [Daily Development Workflow](#daily-development-workflow)
- [Project Organization](#project-organization)
- [Team Collaboration](#team-collaboration)
- [Open Source Contribution](#open-source-contribution)
- [Learning and Experimentation](#learning-and-experimentation)
- [Monorepo Management](#monorepo-management)
- [CI/CD Integration](#cicd-integration)
- [Backup and Migration](#backup-and-migration)

---

## Daily Development Workflow

### Starting Your Day

```bash
# Quick overview of all projects
project-code project list

# Focus on today's priority projects
project-code project list --search "urgent|priority|todo"

# Open your main project for the day
project-code project open my-main-project

# Check for any newsworthy projects
project-code project list --type react --sortBy updatedAt --sortOrder desc
```

### Project Status Check

```bash
# See what you've worked on recently
project-code project list --sortBy updatedAt --sortOrder desc

# Check project types distribution
project-code project list --format json | jq 'group_by(.type) | map({type: .[0].type, count: length})'

# Find projects needing attention
find ~/code -name "*.todo" -o -name "*.md" | head -10
```

### Context Switching

```bash
# Save current context
echo "Currently working on: $(pwd)" >> ~/current-context.txt

# List all active projects
project-code project list --search "active"

# Switch to different project
project-code project open other-project

# Return to previous project later
project-code project open $(cat ~/current-context.txt | grep "Currently working" | cut -d: -f2)
```

---

## Project Organization

### Setting Up Project Categories

```bash
# Create organized directory structure
mkdir -p ~/code/{web,mobile,api,tools,docs,experiments}

# Configure root folders
project-code config add root ~/code/web --name "Web Projects"
project-code config add root ~/code/mobile --name "Mobile Projects"
project-code config add root ~/code/api --name "API Projects"
project-code config add root ~/code/tools --name "Tools & Scripts"
project-code config add root ~/code/experiments --name "Experiments"

# Set up project templates for each category
project-code config set project.templates.web.type react
project-code config set project.templates.api.type nodejs
```

### Managing Multiple Clients

```bash
# Set up client-specific directories
mkdir -p ~/code/clients/{client-a,client-b,client-c}/{frontend,backend,docs}

# Add client root folders
for client in client-a client-b client-c; do
  project-code config add root "~/code/clients/$client"
done

# Create client-specific project initialization
project-code project init ~/code/clients/client-a/frontend \
  --name "Client A Frontend" \
  --type react \
  --description "Frontend application for Client A"
```

### Technology-Specific Organization

```bash
# Group by technology stack
mkdir -p ~/code/{react-apps,vue-apps,node-services,python-tools,go-services}

# Configure technology-specific settings
project-code config set project.typeDefaults.react "~/code/react-apps"
project-code config set project.typeDefaults.vue "~/code/vue-apps"
project-code config set project.typeDefaults.nodejs "~/code/node-services"
```

---

## Team Collaboration

### Shared Project Discovery

```bash
# Team lead sets up shared configuration
project-code config add root /shared/team-projects
project-code config add root /shared/company-tools

# Team members use same configuration
cp /shared/team-config.json ~/.project-code/config.json

# Everyone sees same project list
project-code project list --format table
```

### Project Handoff

```bash
# Document project details
project-code project list --search "project-x" --format json > project-x-details.json

# Create handoff documentation
echo "# Project X Handoff
## Quick Start
project-code project open project-x
cd project-x
npm install
npm run dev

## Key Files
- src/main.tsx - Main application entry
- src/components/ - React components
- docs/api.md - API documentation

## Recent Changes
$(git log --oneline -10)
" > project-x-handoff.md
```

### Code Review Workflow

```bash
# Clone PR for review
project-code project clone https://github.com/team/repo/pull/123 \
  --root ~/reviews \
  --name "pr-123-review"

# Open for review
project-code project open ~/reviews/pr-123-review --new-window

# Check project structure
cd ~/reviews/pr-123-review
project-code project list --max-depth 3

# Complete review and cleanup
rm -rf ~/reviews/pr-123-review
```

---

## Open Source Contribution

### Exploring Popular Projects

```bash
# Clone trending repositories
project-code project clone facebook/react --vscode
project-code project clone microsoft/vscode --vscode
project-code project clone vercel/next.js --vscode

# Explore project structures
project-code project list --type react --sortBy updatedAt --sortOrder desc

# Find projects by topic
find ~/code -name "*.md" -exec grep -l "state management" {} \;
```

### Contributing to Projects

```bash
# Set up contribution workspace
mkdir -p ~/code/contributions/{active,completed,learning}

# Clone project for contribution
project-code project clone username/project-to-contribute \
  --root ~/code/contributions/active

# Set up development environment
cd ~/code/contributions/active/project-to-contribute
project-code project init --type $(detect-project-type)

# Make changes and test
project-code project open .
git checkout -b feature/my-contribution
# Make changes...
git push origin feature/my-contribution
```

### Learning from Codebases

```bash
# Clone projects for learning
project-code project clone sindresorhus/awesome-nodejs --depth 1
project-code project clone kamranahmedse/developer-roadmap --depth 1

# Analyze project structures
find ~/code -name "package.json" | wc -l  # Count Node.js projects
find ~/code -name "requirements.txt" | wc -l  # Count Python projects

# Extract learning resources
find ~/code -name "*.md" -exec grep -l "tutorial\|guide\|example" {} \;
```

---

## Learning and Experimentation

### Technology Exploration

```bash
# Set up learning workspace
mkdir -p ~/code/learning/{javascript,python,rust,go}/{basics,intermediate,advanced}

# Start with basics
project-code project create js-basics --type javascript \
  --root ~/code/learning/javascript/basics \
  --description "JavaScript fundamentals"

# Progress to frameworks
project-code project create react-explorer --type react \
  --root ~/code/learning/javascript/intermediate

# Try new languages
project-code project create rust-basics --type rust \
  --root ~/code/learning/rust/basics
```

### Daily Coding Challenges

```bash
# Set up daily challenge workspace
mkdir -p ~/code/daily-challenges/$(date +%Y/%m)

# Create today's challenge project
project-code project create "day-$(date +%d)-challenge" \
  --type javascript \
  --root ~/code/daily-challenges/$(date +%Y/%m) \
  --description "Daily coding challenge for $(date +%Y-%m-%d)"

# Open and start coding
project-code project open "day-$(date +%d)-challenge"
```

### Experiment Tracking

```bash
# Create experiment project
project-code project create my-experiment \
  --type nodejs \
  --description "Testing new ideas"

# Document experiments
echo "# Experiment Log
## $(date)
- Starting experiment with new architecture
- Goal: Improve performance by 30%
- Approach: Implement caching layer

## Setup
project-code project open my-experiment
npm install
npm run dev
" > ~/code/my-experiment/EXPERIMENT.md
```

---

## Monorepo Management

### Setting Up Monorepo

```bash
# Initialize monorepo structure
mkdir -p ~/code/my-monorepo/{packages,apps,tools}

# Create root project
project-code project init ~/code/my-monorepo \
  --name "My Monorepo" \
  --type nodejs

# Add packages
project-code project init ~/code/my-monorepo/packages/utils \
  --name "utils" --type typescript
project-code project init ~/code/my-monorepo/packages/ui \
  --name "ui" --type react

# Add apps
project-code project init ~/code/my-monorepo/apps/web \
  --name "web-app" --type nextjs
project-code project init ~/code/my-monorepo/apps/api \
  --name "api-server" --type nodejs
```

### Managing Monorepo Projects

```bash
# List all projects in monorepo
project-code project list --search "my-monorepo"

# Work on specific package
project-code project open ~/code/my-monorepo/packages/ui

# Check dependencies across packages
find ~/code/my-monorepo -name "package.json" -exec cat {} \; | \
  grep -A 5 -B 5 "dependencies"
```

### Monorepo Workflows

```bash
# Update all packages
for package in ~/code/my-monorepo/packages/*/; do
  echo "Updating $(basename $package)"
  cd "$package"
  project-code project open .
  npm update
done

# Run tests across all packages
find ~/code/my-monorepo/packages -name "package.json" | \
  xargs dirname | \
  xargs -I {} sh -c 'cd {} && npm test'
```

---

## CI/CD Integration

### Automated Project Discovery

```bash
# Generate project list for CI
project-code project list --format json > projects.json

# Filter projects for deployment
project-code project list --type nodejs --format json | \
  jq '[.[] | select(.tags[]? | contains("production"))]' > production-projects.json

# Check for security updates
project-code project list --format json | \
  jq -r '.[] | select(.type == "nodejs") | .path' | \
  xargs -I {} sh -c 'cd {} && npm audit --audit-level=moderate'
```

### Deployment Scripts

```bash
#!/bin/bash
# deploy-projects.sh

# Get projects to deploy
PROJECTS=$(project-code project list --tag production --format json)

# Deploy each project
echo "$PROJECTS" | jq -r '.[] | .path' | while read project_path; do
  echo "Deploying $project_path"
  cd "$project_path"

  # Project-specific deployment logic
  case $(basename "$project_path") in
    "web-app")
      npm run build
      rsync -av build/ production-server:/var/www/
      ;;
    "api-server")
      npm run build
      scp dist/* production-server:/opt/api/
      ssh production-server 'systemctl restart api'
      ;;
  esac
done
```

### Backup Integration

```bash
#!/bin/bash
# backup-projects.sh

# Create backup directory
BACKUP_DIR=~/backups/projects-$(date +%Y%m%d)
mkdir -p "$BACKUP_DIR"

# Backup project configurations
project-code project list --format json > "$BACKUP_DIR/project-list.json"

# Backup important project files
project-code project list --format json | \
  jq -r '.[] | .path' | while read project_path; do
    project_name=$(basename "$project_path")
    mkdir -p "$BACKUP_DIR/$project_name"

    # Backup key files
    cp -r "$project_path/package.json" "$BACKUP_DIR/$project_name/" 2>/dev/null
    cp -r "$project_path/requirements.txt" "$BACKUP_DIR/$project_name/" 2>/dev/null
    cp -r "$project_path/README.md" "$BACKUP_DIR/$project_name/" 2>/dev/null
  done

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
```

---

## Backup and Migration

### Project Backup Strategy

```bash
# Create comprehensive backup
BACKUP_ROOT=~/backups/project-code-$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_ROOT"

# Backup configuration
cp ~/.project-code/config.json "$BACKUP_ROOT/"

# Backup project metadata
project-code project list --format json > "$BACKUP_ROOT/project-metadata.json"

# Create project archive
project-code project list --format json | \
  jq -r '.[] | .path' | while read project_path; do
    project_name=$(basename "$project_path")
    echo "Backing up $project_name"
    tar -czf "$BACKUP_ROOT/${project_name}.tar.gz" -C "$(dirname "$project_path")" "$(basename "$project_path")"
  done

echo "Backup created at: $BACKUP_ROOT"
```

### Migrating Between Machines

```bash
# Export configuration and project list
project-code config list > ~/project-code-config.json
project-code project list --format json > ~/project-list.json

# Copy to new machine
scp ~/project-code-config.json new-machine:~/
scp ~/project-list.json new-machine:~/

# On new machine
mkdir -p ~/.project-code
cp ~/project-code-config.json ~/.project-code/config.json

# Clone important projects
cat ~/project-list.json | jq -r '.[] | select(.tags[] | contains("important")) | .path' | \
  while read repo_url; do
    project-code project clone "$repo_url"
  done
```

### Disaster Recovery

```bash
# Restore from backup
BACKUP_DIR=~/backups/project-code-backup
CONFIG_FILE="$BACKUP_DIR/config.json"
PROJECTS_FILE="$BACKUP_DIR/project-metadata.json"

# Restore configuration
mkdir -p ~/.project-code
cp "$CONFIG_FILE" ~/.project-code/config.json

# Restore projects
cat "$PROJECTS_FILE" | jq -r '.[] | .path' | while read project_path; do
  project_name=$(basename "$project_path")
  BACKUP_PATH="$BACKUP_DIR/${project_name}.tar.gz"

  if [ -f "$BACKUP_PATH" ]; then
    echo "Restoring $project_name"
    mkdir -p "$project_path"
    tar -xzf "$BACKUP_PATH" -C "$(dirname "$project_path")"
  fi
done

# Verify restoration
project-code project list
```

---

## Advanced Workflows

### Multi-Language Development

```bash
# Set up polyglot workspace
mkdir -p ~/code/polyglot/{js,py,rust,go}/{projects,tools}

# Configure language-specific settings
project-code config set project.languageDefaults.javascript "~/code/polyglot/js"
project-code config set project.languageDefaults.python "~/code/polyglot/py"
project-code config set project.languageDefaults.rust "~/code/polyglot/rust"
project-code config set project.languageDefaults.go "~/code/polyglot/go"

# Create projects in appropriate directories
project-code project create web-dashboard --type react --root ~/code/polyglot/js/projects
project-code project create data-processor --type python --root ~/code/polyglot/py/projects
project-code project create cli-tool --type rust --root ~/code/polyglot/rust/projects
```

### Research and Analysis

```bash
# Set up research workspace
mkdir -p ~/code/research/{reading,analysis,writing}

# Clone research projects
project-code project clone academic/paper-implementation --root ~/code/research/reading
project-code project clone research/data-analysis --root ~/code/research/analysis

# Document findings
echo "# Research Notes
## $(date)
### Papers Read
### Implementations Studied
### Key Insights
" > ~/code/research/notes.md
```

### Performance Optimization

```bash
# Create performance testing workspace
mkdir -p ~/code/performance/{benchmarks,before,after}

# Clone project for optimization
project-code project clone my-project --root ~/code/performance/before

# Create optimized version
cp -r ~/code/performance/before/* ~/code/performance/after/
cd ~/code/performance/after/project

# Apply optimizations
# ... make changes ...

# Compare results
echo "Performance comparison:" >> ~/code/performance/results.md
echo "Before: $(cat before-results.txt)" >> ~/code/performance/results.md
echo "After: $(cat after-results.txt)" >> ~/code/performance/results.md
```

---

## Tips and Tricks

### Keyboard Shortcuts

```bash
# Create aliases for common commands
alias pl='project-code project list'
alias po='project-code project open'
alias pc='project-code project clone'

# Use with arguments
po my-project
pc facebook/react
```

### Shell Integration

```bash
# Add to .bashrc or .zshrc
function qq() {
  if [ -z "$1" ]; then
    project-code project list
  else
    project-code project open "$1"
  fi
}

# Usage
qq          # List projects
qq my-proj  # Open project
```

### Project Templates

```bash
# Create custom project templates
mkdir -p ~/.project-code/templates/react-app

# Template files
cat > ~/.project-code/templates/react-app/package.json << 'EOF'
{
  "name": "{{name}}",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
EOF

# Use template
project-code project create my-app --template react-app --type react
```

---

## Troubleshooting Workflows

### Debugging Project Issues

```bash
# Diagnose project problems
PROJECT_PATH=~/code/problematic-project

# Check project structure
project-code project list --search "problematic"

# Verify dependencies
cd "$PROJECT_PATH"
npm ls  # or equivalent for project type

# Check for common issues
find "$PROJECT_PATH" -name "*.log" | xargs tail -n 20

# Compare with working project
diff -r ~/code/working-project "$PROJECT_PATH" | head -20
```

### Performance Issues

```bash
# Optimize project discovery
project-code config set project.maxDepth 3
project-code config set project.excludePatterns '["**/node_modules/**", "**/dist/**", "**/.git/**"]'

# Clean up old projects
find ~/code -type d -name ".git" | wc -l  # Count repositories
find ~/code -name "node_modules" -type d -prune | wc -l  # Count Node modules

# Archive old projects
mkdir -p ~/code/archive/$(date +%Y)
mv ~/code/old-project ~/code/archive/$(date +%Y)/
```

---

*For more detailed command information, see [Command Reference](COMMAND_REFERENCE.md). For configuration options, see [Configuration Guide](CONFIGURATION.md).*