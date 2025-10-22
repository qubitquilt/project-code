import { Command, Flags } from '@oclif/core';

import { AuthService } from '../../lib/auth-service.js';
import { AuthProvider } from '../../types/auth.js';

/**
 * Logout and clear stored authentication data
 */
export default class AuthLogout extends Command {
  static description = 'Logout and clear stored authentication data';
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --provider github',
    '<%= config.bin %> <%= command.id %> --provider gitlab',
  ];
static flags = {
    provider: Flags.string({
      char: 'p',
      description: 'Specific provider to logout from',
      options: ['bitbucket', 'github', 'gitlab', 'local'],
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(AuthLogout);

    try {
      // Initialize auth service
      const authService = new AuthService();

      // Check current authentication status
      const currentStatus = await authService.getAuthStatus();

      if (!currentStatus.isAuthenticated) {
        this.log('ℹ️  You are not currently authenticated.');
        return;
      }

      // Determine which provider to logout from
      const providerToLogout = flags.provider || currentStatus.provider;

      this.log(`🔓 Logging out from ${providerToLogout}...`);

      // Perform logout
      const result = await authService.logout(
        flags.provider as AuthProvider
      );

      if (!result.success) {
        this.error(`Logout failed: ${result.error}`);
        return;
      }

      this.log('✅ Logout successful!');
      this.log(`   Cleared stored authentication data for ${providerToLogout}`);

      // Clean up auth service
      authService.cleanup();

      this.log('\n💡 You have been logged out. Use "auth login" to authenticate again.');

    } catch (error) {
      this.error(`Logout failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}