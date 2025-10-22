import {
  AuthCredentials,
  AuthProvider,
  AuthStatus
} from '../types/auth.js';
import { AuthService } from './auth-service.js';

/**
 * UI state for the authentication wizard
 */
export interface AuthWizardState {
  authStatus: AuthStatus | null;
  credentials: Partial<AuthCredentials>;
  currentStep: AuthWizardStep;
  error: null | string;
  isLoading: boolean;
  selectedProvider: AuthProvider | null;
  validationResult: null | ValidationResult;
}

/**
 * Authentication wizard steps
 */
export type AuthWizardStep =
  | 'error'
  | 'provider-selection'
  | 'success'
  | 'token-input'
  | 'validation';

/**
 * Validation result for UI feedback
 */
export interface ValidationResult {
  details?: string[];
  isValid: boolean;
  message: string;
}

/**
 * Provider configuration for UI display
 */
export interface ProviderConfig {
  description: string;
  displayName: string;
  helpUrl: string;
  name: AuthProvider;
  requiresToken: boolean;
  tokenFormat?: string;
  tokenLabel: string;
  tokenPlaceholder: string;
}

/**
 * UI state management service for authentication wizard
 */
export class AuthUIService {
  private authService: AuthService;
  private state: AuthWizardState;
  private stateListeners: Array<(state: AuthWizardState) => void> = [];

  constructor() {
    this.authService = new AuthService();
    this.state = this.getInitialState();
  }

  /**
   * Perform authentication
   */
  async authenticate(): Promise<void> {
    this.updateState({
      error: null,
      isLoading: true,
      validationResult: null,
    });

    try {
      const { credentials, selectedProvider } = this.state;

      if (!selectedProvider || !credentials) {
        throw new Error('Invalid state: missing provider or credentials');
      }

      const result = await this.authService.authenticate(selectedProvider, credentials as AuthCredentials);

      if (!result.success) {
        this.updateState({
          currentStep: 'error',
          error: result.error || 'Authentication failed',
          isLoading: false,
        });
        return;
      }

      // Get updated auth status
      const authStatus = await this.authService.getAuthStatus();

      this.updateState({
        authStatus,
        currentStep: 'success',
        isLoading: false,
      });

    } catch (error) {
      this.updateState({
        currentStep: 'error',
        error: error instanceof Error ? error.message : 'Authentication failed',
        isLoading: false,
      });
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.authService.cleanup();
    this.stateListeners = [];
  }

  /**
   * Complete the wizard
   */
  complete(): void {
    // Reset to initial state for potential reuse
    this.reset();
  }

  /**
   * Get provider configurations for UI display
   */
  getProviderConfigs(): ProviderConfig[] {
    return [
      {
        description: 'Connect to GitHub repositories',
        displayName: 'GitHub',
        helpUrl: 'https://github.com/settings/tokens',
        name: 'github',
        requiresToken: true,
        tokenFormat: 'Must start with ghp_, gho_, ghu_, or ghs_',
        tokenLabel: 'Personal Access Token',
        tokenPlaceholder: 'ghp_...',
      },
      {
        description: 'Connect to GitLab repositories',
        displayName: 'GitLab',
        helpUrl: 'https://gitlab.com/-/profile/personal_access_tokens',
        name: 'gitlab',
        requiresToken: true,
        tokenFormat: 'Must start with glpat-',
        tokenLabel: 'Personal Access Token',
        tokenPlaceholder: 'glpat-...',
      },
      {
        description: 'Connect to Bitbucket repositories',
        displayName: 'Bitbucket',
        helpUrl: 'https://bitbucket.org/account/settings/app-passwords/',
        name: 'bitbucket',
        requiresToken: true,
        tokenFormat: 'Alphanumeric characters, typically 32+ characters',
        tokenLabel: 'App Password',
        tokenPlaceholder: 'Your app password',
      },
      {
        description: 'Use local Git configuration',
        displayName: 'Local',
        helpUrl: '',
        name: 'local',
        requiresToken: false,
        tokenFormat: 'Uses your existing Git setup',
        tokenLabel: 'No token required',
        tokenPlaceholder: 'Not applicable',
      },
    ];
  }

  /**
   * Get current state
   */
  getState(): AuthWizardState {
    return { ...this.state };
  }

  /**
   * Go back to previous step
   */
  goBack(): void {
    const { currentStep } = this.state;

    switch (currentStep) {
      case 'error': {
        this.updateState({
          currentStep: 'token-input',
          error: null,
        });
        break;
      }

      case 'token-input': {
        this.updateState({
          credentials: {},
          currentStep: 'provider-selection',
          error: null,
          selectedProvider: null,
          validationResult: null,
        });
        break;
      }

      case 'validation': {
        this.updateState({
          currentStep: 'token-input',
          error: null,
          validationResult: null,
        });
        break;
      }

      default: {
        // Can't go back from provider selection or success
        break;
      }
    }
  }

  /**
   * Reset wizard to initial state
   */
  reset(): void {
    this.state = this.getInitialState();
    this.notifyListeners();
  }

  /**
   * Retry authentication
   */
  async retry(): Promise<void> {
    this.updateState({
      currentStep: 'validation',
      error: null,
      isLoading: true,
    });

    await this.authenticate();
  }

  /**
   * Select a provider
   */
  selectProvider(provider: AuthProvider): void {
    this.updateState({
      credentials: {},
      currentStep: 'token-input',
      error: null,
      selectedProvider: provider,
      validationResult: null,
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AuthWizardState) => void): () => void {
    this.stateListeners.push(listener);
    return () => {
      const index = this.stateListeners.indexOf(listener);
      if (index !== -1) {
        this.stateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Update credentials
   */
  updateCredentials(updates: Partial<AuthCredentials>): void {
    this.updateState({
      credentials: { ...this.state.credentials, ...updates },
      error: null,
      validationResult: null,
    });
  }

  /**
   * Validate current input
   */
  async validateInput(): Promise<ValidationResult> {
    const { credentials, selectedProvider } = this.state;

    if (!selectedProvider) {
      return {
        isValid: false,
        message: 'No provider selected',
      };
    }

    const providerConfig = this.getProviderConfigs().find(p => p.name === selectedProvider);
    if (!providerConfig) {
      return {
        isValid: false,
        message: 'Invalid provider selected',
      };
    }

    if (providerConfig.requiresToken && !credentials.personalAccessToken) {
      return {
        details: ['Please enter your token to continue'],
        isValid: false,
        message: `${providerConfig.tokenLabel} is required`,
      };
    }

    if (selectedProvider !== 'local' && credentials.personalAccessToken) {
      // Validate token format using the auth service method
      const formatResult = (this.authService as any).validateTokenFormat(selectedProvider, credentials.personalAccessToken);
      if (!formatResult.valid) {
        return {
          details: [formatResult.error || 'Token format is incorrect'],
          isValid: false,
          message: 'Invalid token format',
        };
      }
    }

    return {
      isValid: true,
      message: 'Input looks good',
    };
  }

  /**
   * Get initial state
   */
  private getInitialState(): AuthWizardState {
    return {
      authStatus: null,
      credentials: {},
      currentStep: 'provider-selection',
      error: null,
      isLoading: false,
      selectedProvider: null,
      validationResult: null,
    };
  }

  /**
   * Notify all listeners of current state
   */
  private notifyListeners(): void {
    for (const listener of this.stateListeners) {
      listener(this.getState());
    }
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<AuthWizardState>): void {
    this.state = { ...this.state, ...updates };
    for (const listener of this.stateListeners) {
      listener(this.getState());
    }
  }
}