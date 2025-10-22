import { Command, Flags } from '@oclif/core';

import { AuthService } from '../../lib/auth-service.js';
import { AuthCredentials, AuthProvider } from '../../types/auth.js';

/**
 * Authenticate with a Git provider
 *
 * This command allows you to authenticate with GitHub, GitLab, Bitbucket, or use local authentication.
 * Each provider requires different setup steps to obtain the necessary tokens or credentials.
 *
 * GITHUB SETUP:
 * 1. Go to https://github.com/settings/tokens
 * 2. Click "Generate new token (classic)"
 * 3. Give it a descriptive name: "Project Code CLI"
 * 4. Select scopes: "repo" (Full control of private repositories)
 * 5. Click "Generate token" and copy it immediately
 *
 * GITLAB SETUP:
 * 1. Go to https://gitlab.com/-/profile/personal_access_tokens
 * 2. Create token with name: "Project Code CLI"
 * 3. Select scopes: "read_repository", "write_repository", "api"
 * 4. Copy the generated token (starts with "glpat-")
 *
 * BITBUCKET SETUP:
 * 1. Go to https://bitbucket.org/account/settings/app-passwords/
 * 2. Click "Create app password"
 * 3. Give it a label: "Project Code CLI"
 * 4. Select permissions: "Repositories" (Read and Write), "Projects" (Read)
 * 5. Copy the generated app password
 *
 * LOCAL SETUP:
 * No token required. Uses local Git configuration for authentication.
 * Useful for public repositories or when working offline.
 *
 * For detailed setup instructions, see: https://github.com/your-org/project-code/docs/AUTHENTICATION.md
 */
export default class AuthLogin extends Command {
  static description = `Authenticate with a Git provider (GitHub, GitLab, Bitbucket, or local)

This command allows you to authenticate with various Git providers. Each provider requires different setup steps to obtain the necessary tokens or credentials. Use '<%= config.bin %> <%= command.id %> --help' for detailed setup instructions and examples for each provider.

For detailed setup instructions, see: https://github.com/your-org/project-code/docs/AUTHENTICATION.md`;
  static examples = [
    // GitHub examples
    '<%= config.bin %> <%= command.id %> --provider github --token ghp_1234567890abcdef',
    '<%= config.bin %> <%= command.id %> --provider github --token ghp_1234567890abcdef --username myusername',
    'cat ~/.github/token | xargs <%= config.bin %> <%= command.id %> --provider github --token',

    // GitLab examples
    '<%= config.bin %> <%= command.id %> --provider gitlab --token glpat-1234567890abcdef --username myusername',
    '<%= config.bin %> <%= command.id %> --provider gitlab --token glpat-1234567890abcdef',

    // Bitbucket examples
    '<%= config.bin %> <%= command.id %> --provider bitbucket --token ABC123DEF456 --username myusername',
    '<%= config.bin %> <%= command.id %> --provider bitbucket --token ABC123DEF456',

    // Local examples
    '<%= config.bin %> <%= command.id %> --provider local',
    '<%= config.bin %> <%= command.id %> --provider local --username mylocaluser',

    // Environment variable examples
    '<%= config.bin %> <%= command.id %> --provider github --token $GITHUB_TOKEN',
    'echo $MY_TOKEN | xargs <%= config.bin %> <%= command.id %> --provider github --token',
  ];
  static flags = {
    provider: Flags.string({
      char: 'p',
      description: 'Git provider to authenticate with',
      options: ['bitbucket', 'github', 'gitlab', 'local'],
      required: true,
    }),
    token: Flags.string({
      char: 't',
      description: 'Personal access token (GitHub/GitLab) or app password (Bitbucket). Not required for local provider.',
      required: false,
    }),
    username: Flags.string({
      char: 'u',
      description: 'Username for authentication (optional, improves clarity)',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AuthLogin);

    // Validate inputs
    if (!flags.provider) {
      this.error(
        `❌ Provider is required.\n\n` +
        `💡 Available providers: github, gitlab, bitbucket, local\n\n` +
        `For detailed setup instructions, run:\n` +
        `   <%= config.bin %> auth login --help`
      );
    }

    // At this point, flags.provider is guaranteed to be defined
    const provider = flags.provider as AuthProvider;

    if (provider !== 'local' && !flags.token) {
      this.error(
        `❌ Token is required for ${flags.provider} provider.\n\n` +
        `💡 To get a token:\n` +
        `   GitHub: https://github.com/settings/tokens\n` +
        `   GitLab: https://gitlab.com/-/profile/personal_access_tokens\n` +
        `   Bitbucket: https://bitbucket.org/account/settings/app-passwords/\n\n` +
        `For detailed setup instructions, run:\n` +
        `   <%= config.bin %> auth login --help`
      );
    }

    if (flags.provider === 'local' && flags.token) {
      this.warn('⚠️  Token provided for local provider will be ignored. Local provider uses Git configuration.');
    }

    try {
      // Initialize auth service
      const authService = new AuthService();

      // Prepare credentials
      const credentials: AuthCredentials = {
        personalAccessToken: flags.token,
        username: flags.username,
      };

      this.log(`🔐 Authenticating with ${provider}...`);

      // Show provider-specific guidance
      switch (provider) {
        case 'bitbucket': {
          this.log('💡 Bitbucket uses App Passwords (alphanumeric characters)');
          break;
        }

        case 'github': {
          this.log('💡 GitHub token should start with "ghp_" for Personal Access Tokens');
          break;
        }

        case 'gitlab': {
          this.log('💡 GitLab token should start with "glpat-" for Personal Access Tokens');
          break;
        }

        case 'local': {
          this.log('💡 Local provider uses your Git configuration for authentication');
          break;
        }
      }

      // Perform authentication
      const result = await authService.authenticate(
        flags.provider as AuthProvider,
        credentials
      );

      if (!result.success) {
        this.error(this.getErrorMessage(provider, result.error || 'Unknown error'));
        return;
      }

      // Get updated auth status
      const authStatus = await authService.getAuthStatus();

      this.log('✅ Authentication successful!');
      this.log(`   Provider: ${authStatus.provider}`);
      this.log(`   Username: ${authStatus.username}`);
      this.log(`   Status: ${authStatus.isAuthenticated ? 'Authenticated' : 'Not authenticated'}`);

      if (authStatus.scope && authStatus.scope.length > 0) {
        this.log(`   Permissions: ${authStatus.scope.join(', ')}`);
      }

      this.log('\n🎉 You can now use authenticated features of the CLI!');
      this.log('\n📚 Useful commands to try:');
      this.log('   <%= config.bin %> project list     - List available repositories');
      this.log('   <%= config.bin %> auth status     - Check authentication status');
      this.log('   <%= config.bin %> project clone <repo> - Clone a repository');

    } catch (error) {
      this.error(this.getErrorMessage(provider, error instanceof Error ? error.message : String(error)));
    }
  }

  private getErrorMessage(provider: string, error: string): string {
    const baseMessage = `❌ Authentication failed for ${provider}:\n   ${error}\n`;

    switch (provider) {
      case 'bitbucket': {
        return (
          baseMessage +
          '\n💡 Bitbucket troubleshooting:\n' +
          '   1. Verify your app password is correct\n' +
          '   2. Check app password has "Repositories: Read" and "Repositories: Write" permissions\n' +
          '   3. Ensure app password hasn\'t expired\n' +
          '   4. Generate new app password: https://bitbucket.org/account/settings/app-passwords/\n' +
          '\n📚 For detailed help: <%= config.bin %> auth login --help'
        );
      }

      case 'github': {
        return (
          baseMessage +
          '\n💡 GitHub troubleshooting:\n' +
          '   1. Verify your token starts with "ghp_"\n' +
          '   2. Check token has "repo" scope enabled\n' +
          '   3. Ensure token hasn\'t expired\n' +
          '   4. Generate new token: https://github.com/settings/tokens\n' +
          '\n📚 For detailed help: <%= config.bin %> auth login --help'
        );
      }

      case 'gitlab': {
       return (
         baseMessage +
         '\n💡 GitLab troubleshooting:\n' +
         '   1. Verify your token starts with "glpat-"\n' +
         '   2. Check token has required scopes: read_repository, write_repository, api\n' +
         '   3. Ensure token hasn\'t expired\n' +
         '   4. Generate new token: https://gitlab.com/-/profile/personal_access_tokens\n' +
         '\n📚 For detailed help: <%= config.bin %> auth login --help'
       );
     }

      case 'local': {
        return (
          baseMessage +
          '\n💡 Local provider troubleshooting:\n' +
          '   1. Check your Git configuration: git config --list\n' +
          '   2. Ensure you have SSH keys set up for Git authentication\n' +
          '   3. Verify repository URLs use SSH format (git@) instead of HTTPS\n' +
          '   4. Test Git access: git ls-remote <repository-url>\n' +
          '\n📚 For detailed help: <%= config.bin %> auth login --help'
        );
      }

      default: {
        return baseMessage + '\n💡 Use <%= config.bin %> auth login --help for setup instructions';
      }
    }
  }
}