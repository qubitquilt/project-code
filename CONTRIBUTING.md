# Contributing to Project Code CLI

We welcome contributions to Project Code CLI! This document outlines how to get started with contributing to the project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn** package manager
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/project-code.git
   cd project-code
   ```

3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/qubitquilt/project-code.git
   ```

## 🛠️ Development Setup

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Development Mode

Run the CLI in development mode:

```bash
npm run dev
```

This uses `ts-node` to run TypeScript directly without compilation.

## 📝 Code Style

### Linting

We use ESLint for code linting:

```bash
npm run lint
```

### Formatting

We use Prettier for code formatting. The configuration is in `.prettierrc.json`.

### TypeScript

- Use TypeScript for all new code
- Follow the existing patterns in the codebase
- Add proper JSDoc comments for public APIs

### Commit Messages

Follow conventional commit format:

```
type(scope): description

Examples:
- feat: add new authentication provider
- fix: resolve issue with project discovery
- docs: update README with new examples
- test: add unit tests for config module
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Add tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Test both success and error cases

## 🔄 Submitting Changes

### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### Make Your Changes

1. Write your code
2. Add tests if applicable
3. Update documentation if needed
4. Run tests and linting

### Commit and Push

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### Create a Pull Request

1. Go to the GitHub repository
2. Click "Compare & pull request"
3. Fill out the PR template
4. Request review from maintainers

### PR Requirements

- [ ] Code passes all tests
- [ ] Code passes linting
- [ ] Documentation updated if needed
- [ ] Tests added for new features
- [ ] PR description explains the changes

## 🤝 Community Guidelines

### Code of Conduct

We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct.html).

### Reporting Issues

- Use the GitHub issue tracker
- Provide clear reproduction steps
- Include relevant error messages
- Specify your environment (OS, Node.js version, etc.)

### Feature Requests

- Check if the feature already exists
- Explain the use case clearly
- Consider backward compatibility
- Provide examples of how it would work

## 📚 Documentation

### Building Documentation

```bash
npm run build:docs
```

### Documentation Standards

- Use clear, concise language
- Include code examples
- Update both inline comments and external docs
- Keep examples up to date

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build the project |
| `npm run dev` | Run in development mode |
| `npm test` | Run tests |
| `npm run lint` | Run linting |
| `npm run clean` | Clean build artifacts |

## 🙏 Acknowledgments

Thank you for contributing to Project Code CLI! Your help makes this project better for everyone.

---

*This contributing guide is adapted from the open-source contribution guidelines for [Facebook's Draft.js](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md)*