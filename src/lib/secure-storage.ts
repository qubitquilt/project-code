/**
 * Cross-platform secure storage abstraction for authentication tokens and credentials
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import {
  AuthProvider,
  PlatformSecureStorage,
  SecureStorageOptions,
  SecureStorageResult,
  StoredAuthData
} from '../types/auth.js';


/**
 * Encrypted file storage implementation
 */
class EncryptedFileStorage implements PlatformSecureStorage {
  async deletePassword(options: SecureStorageOptions): Promise<SecureStorageResult<void>> {
    try {
      const { account, service } = options;
      const filePath = this.getEncryptedFilePath(service, account);

      await fs.unlink(filePath);
      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to delete encrypted password',
        success: false
      };
    }
  }

  async findPassword(options: SecureStorageOptions): Promise<SecureStorageResult<string>> {
    return this.getPassword(options);
  }

  async getPassword(options: SecureStorageOptions): Promise<SecureStorageResult<string>> {
    try {
      const { account, service } = options;
      const filePath = this.getEncryptedFilePath(service, account);

      const encrypted = await fs.readFile(filePath, 'utf8');
      const decrypted = this.simpleDecrypt(encrypted, this.generateEncryptionKey(service));

      return {
        data: decrypted,
        success: true
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to retrieve encrypted password',
        success: false
      };
    }
  }

  isAvailable(): boolean {
    return true; // Always available as fallback
  }

  async setPassword(options: SecureStorageOptions, password: string): Promise<SecureStorageResult<void>> {
    try {
      const { account, service } = options;
      const filePath = this.getEncryptedFilePath(service, account);

      // Generate a simple encryption key (in production, use proper key management)
      const key = this.generateEncryptionKey(service);
      const encrypted = this.simpleEncrypt(password, key);

      await fs.mkdir(join(homedir(), '.project-code'), { recursive: true });
      await fs.writeFile(filePath, encrypted, { mode: 0o600 });

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to store encrypted password',
        success: false
      };
    }
  }

  private generateEncryptionKey(service: string): string {
    // Simple key derivation (in production, use proper PBKDF2)
    return createHash('sha256').update(service).digest('hex').slice(0, 32);
  }

  private getEncryptedFilePath(service: string, account: string): string {
    const sanitizedService = service.replaceAll(/[^a-zA-Z0-9]/g, '_');
    const sanitizedAccount = account.replaceAll(/[^a-zA-Z0-9]/g, '_');
    return join(homedir(), '.project-code', `${sanitizedService}_${sanitizedAccount}.enc`);
  }

  private simpleDecrypt(encryptedText: string, key: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private simpleEncrypt(text: string, key: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }
}

/**
 * Main secure storage abstraction class
 */
export class SecureStorage {
  private storage: PlatformSecureStorage;

  constructor() {
    this.storage = new EncryptedFileStorage();
  }

  /**
   * Delete authentication data
   */
  async deleteAuthData(
    provider: AuthProvider,
    username: string,
    options?: Partial<SecureStorageOptions>
  ): Promise<SecureStorageResult<void>> {
    try {
      const storageOptions: SecureStorageOptions = {
        account: username,
        service: `project-code-${provider}`,
        ...options
      };

      return await this.storage.deletePassword(storageOptions);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Retrieve authentication data
   */
  async getAuthData(
    provider: AuthProvider,
    username: string,
    options?: Partial<SecureStorageOptions>
  ): Promise<SecureStorageResult<StoredAuthData>> {
    try {
      const storageOptions: SecureStorageOptions = {
        account: username,
        service: `project-code-${provider}`,
        ...options
      };

      const result = await this.storage.getPassword(storageOptions);

      if (!result.success || !result.data) {
        return {
          error: result.error || 'No data found',
          success: false
        };
      }

      const authData: StoredAuthData = JSON.parse(result.data);
      return {
        data: authData,
        success: true
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Check if secure storage is available
   */
  isAvailable(): boolean {
    return this.storage.isAvailable();
  }

  /**
   * Store authentication data securely
   */
  async storeAuthData(
    provider: AuthProvider,
    username: string,
    tokens: string,
    options?: Partial<SecureStorageOptions>
  ): Promise<SecureStorageResult<void>> {
    try {
      const storageOptions: SecureStorageOptions = {
        account: username,
        encrypt: true,
        service: `project-code-${provider}`,
        ...options
      };

      const authData: StoredAuthData = {
        createdAt: new Date(),
        encryptedTokens: tokens,
        provider,
        updatedAt: new Date(),
        username
      };

      const serializedData = JSON.stringify(authData);
      return await this.storage.setPassword(storageOptions, serializedData);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }
}