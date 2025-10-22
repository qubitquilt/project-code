import { Command, Flags } from '@oclif/core';

import { AuthService } from '../../lib/auth-service.js';

/**
 * Show current authentication status
 */
export default class AuthStatus extends Command {
  static description = 'Show current authentication status';
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --verbose',
  ];
static flags = {
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show detailed authentication information',
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AuthStatus);

    try {
      // Initialize auth service
      const authService = new AuthService();

      // Get current authentication status
      const authStatus = await authService.getAuthStatus();

      if (authStatus.isAuthenticated) {
        this.log('🔐 Authentication Status: Authenticated');
        this.log(`   Provider: ${authStatus.provider}`);
        this.log(`   Username: ${authStatus.username}`);

        if (flags.verbose && authStatus.scope && authStatus.scope.length > 0) {
          this.log(`   Permissions: ${authStatus.scope.join(', ')}`);
        }

        if (flags.verbose && authStatus.expiresAt) {
          const expiresAt = authStatus.expiresAt.toISOString();
          this.log(`   Expires: ${expiresAt}`);
        }

        if (flags.verbose && authStatus.lastValidated) {
          const lastValidated = authStatus.lastValidated.toISOString();
          this.log(`   Last Validated: ${lastValidated}`);
        }

        this.log('\n💡 You are authenticated and can use authenticated features.');
      } else {
        this.log('❌ Authentication Status: Not authenticated');
        this.log('\n💡 Use "auth login" to authenticate with a Git provider.');
      }

      // Clean up auth service
      authService.cleanup();

    } catch (error) {
      this.error(`Failed to check authentication status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}