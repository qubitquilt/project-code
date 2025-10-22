# Project Code CLI - Authentication Guide

Secure authentication setup and management for Git providers in Project Code CLI.

## 📖 Table of Contents

- [Overview](#overview)
- [Supported Providers](#supported-providers)
- [GitHub Authentication](#github-authentication)
- [GitLab Authentication](#gitlab-authentication)
- [Bitbucket Authentication](#bitbucket-authentication)
- [Token Security](#token-security)
- [Multiple Accounts](#multiple-accounts)
- [Troubleshooting](#troubleshooting)

---

## Overview

Project Code CLI supports authentication with multiple Git providers to enable features like:
- Cloning private repositories
- Accessing organization repositories
- Using authenticated Git operations

### Authentication Methods

- **Personal Access Tokens** (recommended for CLI usage)
- **OAuth Applications** (for interactive authentication)
- **SSH Keys** (for Git operations)

### Security Features

- **Encrypted Storage**: Tokens are encrypted locally
- **Automatic Validation**: Tokens are validated periodically
- **Secure Defaults**: Secure configuration out of the box
- **Token Rotation**: Support for token refresh workflows

---

## Supported Providers

| Provider | Status | Token Type | Setup Complexity |
|----------|--------|------------|------------------|
| GitHub | ✅ Supported | Personal Access Token | Low |
| GitLab | ✅ Supported | Personal Access Token | Medium |
| Bitbucket | ✅ Supported | App Password | Medium |
| Local | ✅ Supported | None required | None |

---

## GitHub Authentication

### Step 1: Create Personal Access Token

1. **Navigate to GitHub Settings**:
   - Go to [GitHub.com](https://github.com)
   - Click your profile picture → **Settings**

2. **Access Developer Settings**:
   - Scroll down and click **Developer settings**
   - Click **Personal access tokens** → **Tokens (classic)**

3. **Generate New Token**:
   - Click **Generate new token (classic)**
   - Give it a descriptive name: `Project Code CLI`
   - Set expiration: **90 days** (recommended)

4. **Configure Scopes**:
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows
   - ❌ `admin:org` - Not needed for basic usage
   - ❌ `delete_repo` - Not needed for basic usage

5. **Generate and Copy Token**:
   - Click **Generate token**
   - **Immediately copy the token** (you won't see it again!)

### Step 2: Authenticate with CLI

```bash
# Authenticate with GitHub
project-code auth login \
  --provider github \
  --token ghp_your_token_here

# Optional: Add username for clarity
project-code auth login \
  --provider github \
  --token ghp_your_token_here \
  --username your-github-username
```

### Step 3: Verify Authentication

```bash
# Check authentication status
project-code auth status

# Test with a private repository clone
project-code project clone your-username/private-repo
```

### GitHub Token Scopes Explained

| Scope | Purpose | Required for Project Code |
|-------|---------|------------------------|
| `repo` | Read/write access to repositories | ✅ Required |
| `workflow` | Update GitHub Actions workflows | ✅ Recommended |
| `read:org` | Read organization membership | ❌ Optional |
| `user` | Read user profile data | ❌ Optional |
| `read:email` | Read email addresses | ❌ Optional |

**Minimal Required Scopes:**
```bash
# For basic repository access only
repo
```

**Recommended Scopes:**
```bash
# For full Project Code functionality
repo
workflow
```

---

## GitLab Authentication

### Step 1: Create Personal Access Token

1. **Navigate to GitLab Settings**:
    - Go to [GitLab.com](https://gitlab.com)
    - Click your profile picture → **Preferences**

2. **Access Access Tokens**:
    - Scroll down and click **Access Tokens**
    - Click **Create personal access token**

3. **Configure Token**:
    - Give it a descriptive name: `Project Code CLI`
    - Set expiration: **90 days** (recommended)
    - Select appropriate scopes

4. **Generate and Copy Token**:
    - Click **Create personal access token**
    - **Immediately copy the token** (you won't see it again!)

### Step 2: Authenticate with CLI

```bash
# Authenticate with GitLab
project-code auth login \
  --provider gitlab \
  --token glpat-your_token_here

# Optional: Add username for clarity
project-code auth login \
  --provider gitlab \
  --token glpat-your_token_here \
  --username your-gitlab-username
```

### Step 3: Verify Authentication

```bash
# Check authentication status
project-code auth status

# Test with a private repository clone
project-code project clone your-username/private-repo
```

### GitLab Token Scopes Explained

| Scope | Purpose | Required for Project Code |
|-------|---------|------------------------|
| `read_repository` | Read repository contents | ✅ Required |
| `write_repository` | Push to repositories | ✅ Required |
| `api` | Access GitLab API | ✅ Required |
| `read_user` | Read user profile | ❌ Optional |
| `read_registry` | Access container registry | ❌ Optional |

**Minimal Required Scopes:**
```bash
# For basic repository access only
read_repository
write_repository
api
```

**Recommended Scopes:**
```bash
# For full Project Code functionality
read_repository
write_repository
api
read_user
```

---

## Bitbucket Authentication

### Step 1: Create App Password

1. **Navigate to Bitbucket Settings**:
    - Go to [Bitbucket.org](https://bitbucket.org)
    - Click your profile picture → **Personal Bitbucket Settings**

2. **Access App Passwords**:
    - Click **App passwords** in the left sidebar
    - Click **Create App password**

3. **Configure App Password**:
    - Give it a descriptive name: `Project Code CLI`
    - Set expiration: **90 days** (recommended)

4. **Set Permissions**:
    - ✅ **Repositories**: Read and Write
    - ✅ **Projects**: Read
    - ✅ **Pull requests**: Read and Write
    - ❌ **Issues**: Not required for basic usage
    - ❌ **Snippets**: Not required for basic usage

5. **Generate and Copy Password**:
    - Click **Create**
    - **Immediately copy the password** (you won't see it again!)

### Step 2: Authenticate with CLI

```bash
# Authenticate with Bitbucket
project-code auth login \
  --provider bitbucket \
  --token your_app_password_here

# Optional: Add username for clarity
project-code auth login \
  --provider bitbucket \
  --token your_app_password_here \
  --username your-bitbucket-username
```

### Step 3: Verify Authentication

```bash
# Check authentication status
project-code auth status

# Test with a private repository clone
project-code project clone your-workspace/private-repo
```

### Bitbucket App Password Permissions Explained

| Permission | Purpose | Required for Project Code |
|------------|---------|------------------------|
| **Repositories** | Read/write repository access | ✅ Required |
| **Projects** | Read project information | ✅ Required |
| **Pull requests** | Access PR functionality | ✅ Recommended |
| **Issues** | Access issue tracking | ❌ Optional |
| **Snippets** | Access code snippets | ❌ Optional |
| **Wiki** | Access wiki pages | ❌ Optional |

**Minimal Required Permissions:**
```bash
# For basic repository access only
Repositories: Read and Write
Projects: Read
```

**Recommended Permissions:**
```bash
# For full Project Code functionality
Repositories: Read and Write
Projects: Read
Pull requests: Read and Write
```

---

## Token Security

### Best Practices

#### 1. Token Creation
- **Use descriptive names**: `Project Code CLI - Laptop` vs `token123`
- **Set expiration dates**: 30-90 days maximum
- **Limit scopes**: Only grant necessary permissions
- **Use separate tokens**: Different tokens for different tools

#### 2. Token Storage
- **Project Code encrypts tokens** automatically
- **Never store tokens in plain text**
- **Use environment variables** for CI/CD
- **Rotate tokens regularly**

#### 3. Token Usage
- **Audit token access** regularly
- **Revoke unused tokens** immediately
- **Monitor token activity** in provider settings
- **Use different tokens** for different machines

### Token Rotation Strategy

```bash
# Monthly token rotation script
#!/bin/bash
# rotate-github-token.sh

# Create new token via GitHub API or manually
echo "1. Create new GitHub token at: https://github.com/settings/tokens"
echo "2. Copy the new token"
read -p "Enter new token: " NEW_TOKEN

# Update Project Code authentication
project-code auth logout
project-code auth login --provider github --token "$NEW_TOKEN"

# Revoke old token in GitHub settings
echo "3. Revoke old token at: https://github.com/settings/tokens"
echo "4. Update this script with new token for next rotation"
```

### Environment Variables

For CI/CD and automated environments:

```bash
# Set token as environment variable
export GITHUB_TOKEN="ghp_your_token_here"

# Use in scripts
project-code auth login --provider github --token "$GITHUB_TOKEN"
```

---

## Multiple Accounts

### Managing Multiple GitHub Accounts

#### Method 1: Separate Tokens

```bash
# Personal account
project-code auth login \
  --provider github \
  --token ghp_personal_token \
  --username personal-account

# Work account
project-code auth login \
  --provider github \
  --token ghp_work_token \
  --username work-account
```

#### Method 2: Configuration Profiles

Create separate configuration files for different accounts:

```bash
# Personal configuration
~/.project-code/personal-config.json

# Work configuration
~/.project-code/work-config.json

# Switch between configurations
export PROJECT_CODE_CONFIG_PATH=~/.project-code/personal-config.json
export PROJECT_CODE_CONFIG_PATH=~/.project-code/work-config.json
```

### Account-Specific Workflows

```bash
# Set up account-specific directories
mkdir -p ~/code/{personal,work}

# Configure different root folders per account
# Personal config
project-code config add root ~/code/personal

# Work config
project-code config add root ~/code/work
```

---

## Advanced Authentication

### SSH Key Integration

For Git operations, you can use SSH keys alongside Project Code authentication:

```bash
# Generate SSH key for Git operations
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to ssh-agent
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub
cat ~/.ssh/id_ed25519.pub  # Copy this to GitHub SSH keys

# Configure Git to use SSH
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

### Git Credential Manager

For seamless Git authentication:

```bash
# Install Git Credential Manager
# https://github.com/git-ecosystem/git-credential-manager

# Configure for Project Code
git config --global credential.helper manager

# Test integration
git clone https://github.com/your-username/private-repo.git
```

### Two-Factor Authentication

When using 2FA with GitHub:

1. **Create token with 2FA enabled**:
   - GitHub will prompt for 2FA code during token creation
   - Token includes 2FA authentication

2. **Use token in CLI**:
   ```bash
   project-code auth login --provider github --token ghp_your_2fa_token
   ```

3. **Token automatically handles 2FA** for subsequent operations

---

## Troubleshooting

### Authentication Issues

#### "Authentication Failed"

```bash
# Check current auth status
project-code auth status

# Verify token is valid
curl -H "Authorization: token ghp_your_token" \
     https://api.github.com/user

# Re-authenticate
project-code auth logout
project-code auth login --provider github --token NEW_TOKEN
```

#### "Token Expired"

```bash
# Check token expiration in GitHub settings
# https://github.com/settings/tokens

# Create new token and update
project-code auth login --provider github --token NEW_TOKEN
```

#### "Insufficient Permissions"

```bash
# Check token scopes in GitHub settings
# https://github.com/settings/tokens

# Ensure token has 'repo' scope
# Create new token with correct scopes if needed
```

### Network Issues

#### "Network Timeout"

```bash
# Test network connectivity
ping github.com

# Check firewall settings
# Try different network if available

# Retry authentication
project-code auth login --provider github --token YOUR_TOKEN
```

#### "Rate Limiting"

```bash
# Check GitHub rate limit status
curl -H "Authorization: token ghp_your_token" \
     https://api.github.com/rate_limit

# Wait for rate limit reset
# Use different token if available
```

### Configuration Issues

#### "Provider Not Supported"

```bash
# Check supported providers
project-code auth login --help

# Use correct provider name
project-code auth login --provider github --token TOKEN

# Check if provider is enabled in config
project-code config list | grep providers
```

#### "Configuration Corrupted"

```bash
# Reset authentication configuration
project-code config reset

# Reconfigure providers
project-code config set auth.enabled true
project-code config set auth.defaultProvider github
```

---

## Security Auditing

### Token Audit Script

```bash
#!/bin/bash
# audit-tokens.sh

echo "=== Project Code Token Audit ==="

# Check Project Code auth status
echo "Project Code Auth Status:"
project-code auth status

echo ""
echo "=== GitHub Token Info ==="
# Check GitHub token info (requires GitHub CLI)
if command -v gh &> /dev/null; then
  gh auth status
  gh api user -q '.login + " (" + .name + ")"'
else
  echo "GitHub CLI not installed"
fi

echo ""
echo "=== Security Recommendations ==="
echo "1. Check token expiration: https://github.com/settings/tokens"
echo "2. Review token permissions"
echo "3. Consider rotating tokens monthly"
echo "4. Audit authorized applications: https://github.com/settings/applications"
```

### Access Log Monitoring

Monitor authentication activity:

```bash
# Check GitHub security log
# https://github.com/settings/security-log

# Review authorized applications
# https://github.com/settings/applications

# Monitor recent activity
gh api users/$(gh api user -q .login)/events -q '.[] | select(.type == "PushEvent") | .created_at + " - " + .repo.name' | head -10
```

---

## Integration with Development Tools

### VS Code Integration

```bash
# Configure VS Code to use same authentication
# VS Code settings
{
  "github.gitAuthentication": true,
  "git.confirmSync": false
}
```

### Git Configuration

```bash
# Configure Git to work with Project Code auth
git config --global credential.helper store
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# For multiple accounts
git config --global user.name "Personal Name"  # Default
git config --global user.email "personal@example.com"

# Account-specific configs in project directories
cd ~/code/work/project
git config user.name "Work Name"
git config user.email "work@example.com"
```

### CI/CD Integration

```bash
# GitHub Actions example
name: Deploy
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      - name: Use Project Code CLI
        run: |
          npm install -g project-code
          project-code auth login --provider github --token ${{ secrets.PROJECT_CODE_TOKEN }}
          project-code project list
```

---

## Migration from Other Tools

### From GitHub CLI

```bash
# Export GitHub CLI auth
gh auth status

# Note your GitHub username and token scopes
# Create new token with same scopes for Project Code
# Authenticate with Project Code
project-code auth login --provider github --token NEW_TOKEN
```

### From Other Git Tools

```bash
# Check existing Git credentials
git config --global credential.helper

# Note current authentication method
# Create Project Code-specific token
# Migrate authentication to Project Code
project-code auth login --provider github --token PROJECT_CODE_TOKEN

# Update Git remotes if needed
git remote set-url origin https://oauth2:TOKEN@github.com/user/repo.git
```

---

## Best Practices Summary

### ✅ Do
- Use separate tokens for different tools
- Set token expiration dates (30-90 days)
- Limit token scopes to minimum required
- Rotate tokens regularly
- Monitor token activity
- Use environment variables in CI/CD

### ❌ Avoid
- Storing tokens in plain text files
- Using tokens with excessive permissions
- Sharing tokens between team members
- Using the same token for multiple tools
- Ignoring token expiration dates

### 🔒 Security Checklist

- [ ] Tokens have expiration dates set
- [ ] Tokens use minimum required scopes
- [ ] Different tokens for different tools
- [ ] Tokens are rotated regularly
- [ ] Token activity is monitored
- [ ] 2FA is enabled on Git accounts
- [ ] SSH keys are used for Git operations
- [ ] Environment variables used in automation

---

*For basic setup instructions, see [Init Guide](INIT_GUIDE.md). For command reference, see [Command Reference](COMMAND_REFERENCE.md).*