/**
 * Authentication-related TypeScript interfaces and types for Project Code CLI
 */

export interface AuthTokens {
  accessToken: string;
  expiresAt?: Date;
  refreshToken?: string;
  scope?: string[];
  tokenType?: string;
}

export interface AuthCredentials {
  password?: string;
  personalAccessToken?: string;
  tokens?: AuthTokens;
  username?: string;
}

export interface AuthConfig {
  authUrl?: string;
  clientId?: string;
  clientSecret?: string;
  provider: AuthProvider;
  redirectUri?: string;
  scope?: string[];
  tokenUrl?: string;
}

export interface StoredAuthData {
  createdAt: Date;
  encryptedTokens: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  provider: AuthProvider;
  scope?: string[];
  updatedAt: Date;
  username?: string;
}

export interface AuthStatus {
  expiresAt?: Date;
  isAuthenticated: boolean;
  lastValidated?: Date;
  provider?: AuthProvider;
  scope?: string[];
  username?: string;
}

export interface AuthProviderConfig {
  authUrl: string;
  displayName: string;
  name: AuthProvider;
  scope: string[];
  supportsDeviceFlow: boolean;
  supportsRefresh: boolean;
  tokenUrl: string;
}

export type AuthProvider = 'bitbucket' | 'github' | 'gitlab' | 'local';

export interface TokenValidationResult {
  error?: string;
  expiresAt?: Date;
  isValid: boolean;
  scope?: string[];
}

export interface TokenRefreshResult {
  error?: string;
  success: boolean;
  tokens?: AuthTokens;
}

export interface SecureStorageOptions {
  account: string;
  encrypt?: boolean;
  keychain?: string;
  service: string;
}

export interface EncryptionConfig {
  algorithm: string;
  ivLength: number;
  keyLength: number;
  saltLength: number;
}

export interface AuthAuditEvent {
  error?: string;
  event: AuthEventType;
  metadata?: Record<string, unknown>;
  provider: AuthProvider;
  success: boolean;
  timestamp: Date;
  username?: string;
}

export type AuthEventType =
  | 'login_attempt'
  | 'login_failure'
  | 'login_success'
  | 'logout'
  | 'storage_error'
  | 'token_expired'
  | 'token_refresh'
  | 'token_validation';

export interface AuthCommandOptions {
  force?: boolean;
  password?: string;
  provider?: AuthProvider;
  token?: string;
  username?: string;
  verbose?: boolean;
}

export interface AuthServiceConfig {
  auditLogEnabled: boolean;
  auditLogPath?: string;
  defaultProvider: AuthProvider;
  maxRetryAttempts: number;
  providers: Record<AuthProvider, AuthProviderConfig>;
  tokenValidationInterval: number;
}

export interface SecureStorageResult<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PlatformSecureStorage {
  deletePassword(options: SecureStorageOptions): Promise<SecureStorageResult<void>>;
  findPassword(options: SecureStorageOptions): Promise<SecureStorageResult<string>>;
  getPassword(options: SecureStorageOptions): Promise<SecureStorageResult<string>>;
  isAvailable(): boolean;
  setPassword(options: SecureStorageOptions, password: string): Promise<SecureStorageResult<void>>;
}