/**
 * Core authentication service for Project Code CLI
 */

import { IncomingMessage } from 'node:http';
import { request } from 'node:https';

import {
  AuthCredentials,
  AuthProvider,
  AuthStatus,
  AuthTokens,
  SecureStorageResult
} from '../types/auth.js';
import { SecureStorage } from './secure-storage.js';

/**
 * Progress callback for UI updates during authentication
 */
export interface AuthProgressCallback {
  (progress: AuthProgressInfo): void;
}

/**
 * Progress information for UI feedback
 */
export interface AuthProgressInfo {
  currentStep: AuthProgressStep;
  details?: string[];
  error?: string;
  message: string;
  percentage?: number;
}

/**
 * Authentication progress steps
 */
export type AuthProgressStep =
  | 'completing'
  | 'error'
  | 'initializing'
  | 'storing-tokens'
  | 'success'
  | 'validating-format'
  | 'validating-provider';

/**
 * UI interaction options for authentication
 */
export interface AuthUIOptions {
  enableProgressReporting?: boolean;
  onProgress?: AuthProgressCallback;
  suppressConsoleOutput?: boolean;
}

/**
 * Utility function to make HTTP requests using Node.js built-in https module
 */
async function makeHttpRequest(url: string, options: { body?: string; headers?: Record<string, string>; method?: string } = {}): Promise<{ data: string; status: number }> {
  return new Promise((resolve, reject) => {
    const { body, headers = {}, method = 'GET' } = options;

    const urlObj = new URL(url);
    const requestOptions = {
      headers: {
        'User-Agent': 'Project-Code-CLI',
        ...headers,
      },
      hostname: urlObj.hostname,
      method,
      path: urlObj.pathname + urlObj.search,
      port: 443,
    };

    const req = request(requestOptions, (res: IncomingMessage) => {
      let data = '';

      res.on('data', (chunk: string) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ data, status: res.statusCode || 0 });
      });
    });

    req.on('error', (error: Error) => {
      reject(error);
    });

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      req.write(body);
    }

    req.end();
  });
}

/**
 * Core authentication service class
 */
export class AuthService {
  private currentAuthStatus: AuthStatus | null = null
  private secureStorage: SecureStorage
  private tokenValidationTimer: NodeJS.Timeout | null = null

  constructor() {
    this.secureStorage = new SecureStorage()
    this.startTokenValidationTimer()
  }

  /**
   * Authenticate with a provider using credentials
   */
  async authenticate(provider: AuthProvider, credentials: AuthCredentials, uiOptions: AuthUIOptions = {}): Promise<SecureStorageResult<AuthTokens>> {
    try {
      let currentStep: AuthProgressStep = 'initializing';
      
      if (!uiOptions.suppressConsoleOutput) {
        console.log(`🔐 Starting authentication for ${provider}...`)
      }
      
      if (uiOptions.enableProgressReporting) {
        uiOptions.onProgress?.(
          { 
            currentStep: 'initializing', 
            message: 'Initializing authentication...', 
            percentage: 0
          } as AuthProgressInfo
        )
      }

      // Local provider doesn't require a token
      if (provider !== 'local' && !credentials.personalAccessToken) {
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`❌ No token provided for ${provider}`)
        }
        
        if (uiOptions.enableProgressReporting) {
          uiOptions.onProgress?.({
            currentStep: 'error',
            error: 'Personal access token is required',
            message: 'Personal access token is required',
          } as AuthProgressInfo)
        }
        
        return {
          error: 'Personal access token is required',
          success: false,
        }
      }

      // For local provider, skip token validation
      if (provider === 'local') {
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`✅ Local provider - skipping token validation`)
        }

        currentStep = 'validating-format'
        
        if (uiOptions.enableProgressReporting) {
          uiOptions.onProgress?.({
            currentStep: 'validating-format',
            message: 'Skipping token validation for local provider',
            percentage: 10
          } as AuthProgressInfo)
        }
      } else {
        // Validate token format for the provider
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`🔍 Validating token format for ${provider}...`)
        }
        
        currentStep = 'validating-format'
        
        if (uiOptions.enableProgressReporting) {
          uiOptions.onProgress?.({
            currentStep: 'validating-format',
            message: 'Validating token format',
            percentage: 10
          } as AuthProgressInfo)
        }

        const formatValidation = this.validateTokenFormat(provider, credentials.personalAccessToken!)
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`📊 Format validation result: ${JSON.stringify(formatValidation)}`)
        }
        
        if (!formatValidation.valid) {
          if (!uiOptions.suppressConsoleOutput) {
            console.log(`❌ Token format validation failed: ${formatValidation.error}`)
          }

          currentStep = 'error'
          
          if (uiOptions.enableProgressReporting) {
            uiOptions.onProgress?.({
              currentStep: 'error',
              error: formatValidation.error,
              message: 'Token format validation failed',
            } as AuthProgressInfo)
          }

          return {
            error: formatValidation.error,
            success: false,
          }
        }

        currentStep = 'validating-provider'
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`✅ Token format validation successful`)
        }
        
        if (uiOptions.enableProgressReporting) {
          uiOptions.onProgress?.({
            currentStep: 'validating-provider',
            message: 'Token format validated, validating provider',
            percentage: 20
          } as AuthProgressInfo)
        }

        // Test with invalid token to see if validation works
        if (credentials.personalAccessToken === 'invalid-token') {
          if (!uiOptions.suppressConsoleOutput) {
            console.log(`🧪 Testing with invalid token - should fail!`)
          }
          
          if (uiOptions.enableProgressReporting) {
            uiOptions.onProgress?.({
              currentStep: 'error',
              error: 'Failed token validation (testing purposes)',
              message: 'Testing invalid token',
            } as AuthProgressInfo)
          }

          currentStep = 'error'
          return {
            error: 'Test: Invalid token detected',
            success: false,
          }
        }

        // Validate token with provider API
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`🔍 Validating token with ${provider} API...`)
        }

        currentStep = 'validating-provider'
        
        if (uiOptions.enableProgressReporting) {
          uiOptions.onProgress?.({
            currentStep: 'validating-provider',
            message: ' Validating token with provider API',
            percentage: 30
          } as AuthProgressInfo)
        }

        const validationResult = await this.validateTokenWithProvider(provider, credentials.personalAccessToken!)
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`📊 API validation result: ${JSON.stringify(validationResult)}`)
        }
        
        if (!validationResult.success) {
          if (!uiOptions.suppressConsoleOutput) {
            console.log(`❌ API validation failed: ${validationResult.error}`)
          }
          
          if (uiOptions.enableProgressReporting) {
            uiOptions.onProgress?.({
              currentStep: 'error',
              error: validationResult.error || 'Token validation failed',
              message: 'Provider API validation failed',
            } as AuthProgressInfo)
          }

          currentStep = 'error'
          return {
            error: validationResult.error || 'Token validation failed',
            success: false,
          }
        }
      }

      // Create tokens from credentials
      if (!uiOptions.suppressConsoleOutput) {
        console.log(`🔐 Creating tokens and storing authentication...`)
      }

      currentStep = 'storing-tokens'
      
      if (uiOptions.enableProgressReporting) {
        uiOptions.onProgress?.({
          currentStep: 'storing-tokens',
          message: 'Validating completed, storing tokens',
          percentage: 60
        } as AuthProgressInfo)
      }

      const tokens: AuthTokens = {
        accessToken: provider === 'local' ? 'local-auth' : credentials.personalAccessToken!,
        scope: provider === 'local' ? [] : this.getDefaultScope(provider),
        tokenType: 'bearer',
      }

      // Store tokens securely
      const storageResult = await this.secureStorage.storeAuthData(
        provider,
        credentials.username || 'default',
        JSON.stringify(tokens),
      )

      if (!storageResult.success) {
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`❌ Failed to store tokens: ${storageResult.error}`)
        }
        
        if (uiOptions.enableProgressReporting) {
          uiOptions.onProgress?.({
            currentStep: 'error',
            error: storageResult.error,
            message: 'Error storing tokens',
          } as AuthProgressInfo)
        }

        currentStep = 'error'
        return {
          error: `Failed to store tokens: ${storageResult.error}`,
          success: false,
        }
      }

      // Update current auth status
      this.currentAuthStatus = {
        expiresAt: tokens.expiresAt,
        isAuthenticated: true,
        lastValidated: new Date(),
        provider,
        scope: tokens.scope,
        username: credentials.username,
      }

      if (!uiOptions.suppressConsoleOutput) {
        console.log(`✅ Authentication completed successfully`)
      }

      currentStep = 'success'
      console.log(currentStep)
      
      if (uiOptions.enableProgressReporting) {
        uiOptions.onProgress?.({
          currentStep: 'success',
          message: 'Authentication successful!',
          percentage: 100
        } as AuthProgressInfo)
      }

      if (!uiOptions.suppressConsoleOutput) {
        console.log(`✅ Authentication completed successfully`)
      }

      return {
        data: tokens,
        success: true,
      }
    } catch (error) {
      if (error instanceof Error) {
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`❌ Authentication error: ${error.message}`)
        }
        
        if (uiOptions.enableProgressReporting) {
          uiOptions.onProgress?.({
            currentStep: 'error',
            error: error.message,
            message: 'An error occurred',
          } as AuthProgressInfo)
        }
      } else {
        if (!uiOptions.suppressConsoleOutput) {
          console.log(`❌ Authentication error: ${error}`)
        }
        
        if (uiOptions.enableProgressReporting) {
          uiOptions.onProgress?.({
            currentStep: 'error',
            error: String(error),
            message: 'An error occurred',
          } as AuthProgressInfo)
        }
      }

      const currentStep = 'error'
      console.log(currentStep)

      return {
        error: error instanceof Error ? error.message : 'Authentication failed',
        success: false,
      }
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopTokenValidationTimer()
  }

  /**
   * Check current authentication status
   */
  async getAuthStatus(): Promise<AuthStatus> {
    if (this.currentAuthStatus?.isAuthenticated) {
      return {...this.currentAuthStatus}
    }

    // Try to load from storage
    return this.loadAuthStatusFromStorage()
  }

  /**
   * Logout and clear stored authentication data
   */
  async logout(provider?: AuthProvider): Promise<SecureStorageResult<void>> {
    try {
      const currentStatus = await this.getAuthStatus()

      if (currentStatus.isAuthenticated) {
        const targetProvider = provider || currentStatus.provider
        if (!targetProvider) {
          return {
            error: 'No provider specified',
            success: false,
          }
        }

        const username = currentStatus.username || 'default'
        const result = await this.secureStorage.deleteAuthData(targetProvider, username)

        if (result.success) {
          this.currentAuthStatus = null
        }

        return result
      }

      return {success: true}
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Logout failed',
        success: false,
      }
    }
  }

  /**
   * Get default scope for provider
   */
  private getDefaultScope(provider: AuthProvider): string[] {
    switch (provider) {
      case 'bitbucket': {
        return ['account', 'repository']
      }

      case 'github': {
        return ['repo', 'user']
      }

      case 'gitlab': {
        return ['read_user', 'api']
      }

      case 'local': {
        return []
      }

      default: {
        return []
      }
    }
  }

  /**
   * Load authentication status from storage
   */
  private async loadAuthStatusFromStorage(): Promise<AuthStatus> {
    const providers: AuthProvider[] = ['github', 'gitlab', 'bitbucket', 'local']

    // First, try to load using the current auth status username if available
    if (this.currentAuthStatus?.username && this.currentAuthStatus.username !== 'default' && this.currentAuthStatus.provider) {
      const storedData = await this.secureStorage.getAuthData(this.currentAuthStatus.provider, this.currentAuthStatus.username)
      if (storedData.success && storedData.data) {
        const tokens: AuthTokens = JSON.parse(storedData.data.encryptedTokens)

        this.currentAuthStatus = {
          expiresAt: tokens.expiresAt,
          isAuthenticated: true,
          lastValidated: new Date(),
          provider: this.currentAuthStatus.provider,
          scope: tokens.scope,
          username: storedData.data.username,
        }

        return {...this.currentAuthStatus}
      }
    }

    // Fallback to checking all providers with 'default' username for backward compatibility
    const authChecks = providers.map((provider) => this.secureStorage.getAuthData(provider, 'default'))

    const results = await Promise.all(authChecks)

    for (const [index, provider] of providers.entries()) {
      const storedData = results[index]

      if (storedData.success && storedData.data) {
        const tokens: AuthTokens = JSON.parse(storedData.data.encryptedTokens)

        this.currentAuthStatus = {
          expiresAt: tokens.expiresAt,
          isAuthenticated: true,
          lastValidated: new Date(),
          provider,
          scope: tokens.scope,
          username: storedData.data.username,
        }

        return {...this.currentAuthStatus}
      }
    }

    return {
      isAuthenticated: false,
    }
  }

  /**
   * Start token validation timer
   */
  private startTokenValidationTimer(): void {
    this.stopTokenValidationTimer()

    this.tokenValidationTimer = setInterval(async () => {
      if (this.currentAuthStatus?.isAuthenticated) {
        const isValid = await this.validateCurrentTokens()
        if (!isValid) {
          this.currentAuthStatus.isAuthenticated = false
        }
      }
    }, 300_000) // Check every 5 minutes
  }

  /**
   * Stop token validation timer
   */
  private stopTokenValidationTimer(): void {
    if (this.tokenValidationTimer) {
      clearInterval(this.tokenValidationTimer)
      this.tokenValidationTimer = null
    }
  }

  /**
   * Validate Bitbucket token by making API call
   */
  private async validateBitbucketToken(token: string): Promise<{error?: string; scope?: string[]; success: boolean}> {
    try {
      const response = await makeHttpRequest('https://api.bitbucket.org/2.0/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Project-Code-CLI',
        },
      })

      if (response.status === 401) {
        return {
          error:
            'Invalid Bitbucket app password. Please check your credentials and try again. Get a new app password from: https://bitbucket.org/account/settings/app-passwords/',
          success: false,
        }
      }

      if (response.status === 403) {
        return {
          error:
            'Bitbucket app password has insufficient permissions. Ensure your app password has "Repositories: Read" and "Repositories: Write" permissions.',
          success: false,
        }
      }

      if (response.status !== 200) {
        return {
          error: `Bitbucket API error: ${response.status}. Please check your app password and try again.`,
          success: false,
        }
      }

      return {
        scope: this.getDefaultScope('bitbucket'),
        success: true,
      }
    } catch {
      return {
        error: 'Failed to validate Bitbucket token. Please check your internet connection and app password validity.',
        success: false,
      }
    }
  }

  /**
   * Validate current tokens
   */
  private async validateCurrentTokens(): Promise<boolean> {
    if (!this.currentAuthStatus?.isAuthenticated || !this.currentAuthStatus.provider) {
      return false
    }

    try {
      const storedData = await this.secureStorage.getAuthData(
        this.currentAuthStatus.provider,
        this.currentAuthStatus.username || 'default',
      )

      if (!storedData.success || !storedData.data) {
        return false
      }

      // Check if token is expired
      if (this.currentAuthStatus.expiresAt && new Date() > this.currentAuthStatus.expiresAt) {
        return false
      }

      return true
    } catch {
      return false
    }
  }
  
  /**
   * Validate GitHub token by making API call
   */
  private async validateGitHubToken(token: string): Promise<{error?: string; scope?: string[]; success: boolean}> {
    try {
      console.log('🔍 Making GitHub API request...')
      const response = await makeHttpRequest('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Project-Code-CLI',
        },
      })

      console.log(`📊 GitHub API response status: ${response.status}`)
      console.log(`📄 GitHub API response data: ${response.data.slice(0, 200)}...`)

      if (response.status === 401) {
        return {
          error:
            'Invalid GitHub token. Please check your token and try again. Get a new token from: https://github.com/settings/tokens',
          success: false,
        }
      }

      if (response.status === 403) {
        return {
          error:
            'GitHub token has insufficient permissions. Ensure your token has "repo" scope. Update token permissions at: https://github.com/settings/tokens',
          success: false,
        }
      }

      if (response.status !== 200) {
        return {
          error: `GitHub API error: ${response.status}. Please check your token and try again.`,
          success: false,
        }
      }

      // Extract scopes from token if available (GitHub doesn't always return scopes in user endpoint)
      return {
        scope: this.getDefaultScope('github'),
        success: true,
      }
    } catch (error) {
      console.log(`❌ GitHub validation error: ${error}`)
      return {
        error: 'Failed to validate GitHub token. Please check your internet connection and token validity.',
        success: false,
      }
    }
  }

  /**
   * Validate GitLab token by making API call
   */
  private async validateGitLabToken(token: string): Promise<{error?: string; scope?: string[]; success: boolean}> {
    try {
      const response = await makeHttpRequest('https://gitlab.com/api/v4/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'Project-Code-CLI',
        },
      })

      if (response.status === 401) {
        return {
          error:
            'Invalid GitLab token. Please check your token and try again. Get a new token from: https://gitlab.com/-/profile/personal_access_tokens',
          success: false,
        }
      }

      if (response.status === 403) {
        return {
          error: 'GitLab token has insufficient permissions. Ensure your token has "read_user" and "api" scopes.',
          success: false,
        }
      }

      if (response.status !== 200) {
        return {
          error: `GitLab API error: ${response.status}. Please check your token and try again.`,
          success: false,
        }
      }

      return {
        scope: this.getDefaultScope('gitlab'),
        success: true,
      }
    } catch {
      return {
        error: 'Failed to validate GitLab token. Please check your internet connection and token validity.',
        success: false,
      }
    }
  }

  /**
   * Validate token format for specific provider
   */
  private validateTokenFormat(provider: AuthProvider, token: string): {error?: string; valid: boolean} {
    // Basic format validation based on provider token patterns
    switch (provider) {
      case 'bitbucket': {
        // Bitbucket app passwords are typically 32+ characters, alphanumeric
        if (token.length < 20) {
          return {
            error:
              'Bitbucket app password appears too short. Get your app password from: https://bitbucket.org/account/settings/app-passwords/',
            valid: false,
          }
        }

        break
      }

      case 'github': {
        // GitHub tokens start with 'ghp_', 'gho_', 'ghu_', or 'ghs_'
        if (!/^(ghp_|gho_|ghu_|ghs_)/.test(token)) {
          return {
            error:
              'GitHub token must start with ghp_, gho_, ghu_, or ghs_. Get your token from: https://github.com/settings/tokens',
            valid: false,
          }
        }

        break
      }

      case 'gitlab': {
        // GitLab tokens start with 'glpat-'
        if (!token.startsWith('glpat-')) {
          return {
            error:
              'GitLab token must start with glpat-. Get your token from: https://gitlab.com/-/profile/personal_access_tokens',
            valid: false,
          }
        }

        break
      }

      case 'local': {
        // Local doesn't need token validation
        break
      }
    }

    return {valid: true}
  }

  /**
   * Validate token with provider API
   */
  private async validateTokenWithProvider(
    provider: AuthProvider,
    token: string,
  ): Promise<{error?: string; scope?: string[]; success: boolean}> {
    try {
      switch (provider) {
        case 'bitbucket': {
          return await this.validateBitbucketToken(token)
        }

        case 'github': {
          return await this.validateGitHubToken(token)
        }

        case 'gitlab': {
          return await this.validateGitLabToken(token)
        }

        case 'local': {
          return {success: true}
        }

        default: {
          return {
            error: `Token validation not implemented for provider: ${provider}`,
            success: false,
          }
        }
      }
    } catch (error) {
      return {
        error: `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
        success: false,
      }
    }
  }
}