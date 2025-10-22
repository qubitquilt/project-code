/**
 * Encryption utilities for cross-platform compatibility
 */

import { createCipheriv, createDecipheriv, createHash, pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const pbkdf2Async = promisify(pbkdf2);

/**
 * Encryption configuration interface
 */
export interface EncryptionConfig {
  algorithm: string;
  digest: string;
  iterations: number;
  ivLength: number;
  keyLength: number;
  saltLength: number;
}

/**
 * Default encryption configuration
 */
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-cbc',
  digest: 'sha256',
  iterations: 100_000,
  ivLength: 16,
  keyLength: 32,
  saltLength: 32
};

/**
 * Encryption utilities class
 */
export class EncryptionUtils {
  private config: EncryptionConfig;

  constructor(config?: Partial<EncryptionConfig>) {
    this.config = { ...DEFAULT_ENCRYPTION_CONFIG, ...config };
  }

  /**
   * Decrypt data using AES-256-CBC with PBKDF2
   */
  async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      // Parse encrypted data
      const parsed = JSON.parse(encryptedData);

      // Extract components
      const { encrypted, iv, salt } = parsed;

      if (!encrypted || !iv || !salt) {
        throw new Error('Invalid encrypted data format');
      }

      // Derive key
      const saltBuffer = Buffer.from(salt, 'hex');
      const key = await this.deriveKey(password, saltBuffer);

      // Create decipher
      const decipher = createDecipheriv(this.config.algorithm, key, Buffer.from(iv, 'hex'));

      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt data using AES-256-CBC with PBKDF2
   */
  async encrypt(data: string, password: string): Promise<string> {
    try {
      // Generate salt and derive key
      const salt = randomBytes(this.config.saltLength);
      const key = await this.deriveKey(password, salt);

      // Generate IV
      const iv = randomBytes(this.config.ivLength);

      // Create cipher
      const cipher = createCipheriv(this.config.algorithm, key, iv);

      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Combine all components
      const result = {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex')
      };

      return JSON.stringify(result);
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a secure encryption key
   */
  async generateKey(): Promise<string> {
    const key = randomBytes(this.config.keyLength);
    return key.toString('hex');
  }

  /**
   * Generate a key from service name (for simple use cases)
   */
  generateServiceKey(service: string): string {
    return createHash('sha256').update(service).digest('hex').slice(0, 32);
  }

  /**
   * Hash data using SHA-256
   */
  async hash(data: string): Promise<string> {
    const hash = createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  /**
   * Simple decryption using AES-256-CBC (for compatibility)
   */
  simpleDecrypt(encryptedText: string, key: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Simple encryption using AES-256-CBC (for compatibility)
   */
  simpleEncrypt(text: string, key: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Validate encryption configuration
   */
  validateConfig(): boolean {
    try {
      // Test encryption/decryption round trip
      const testData = 'test data';
      const testPassword = 'test password';

      // This would be async in real implementation
      const encrypted = this.simpleEncrypt(testData, this.generateServiceKey(testPassword));
      const decrypted = this.simpleDecrypt(encrypted, this.generateServiceKey(testPassword));

      return decrypted === testData;
    } catch {
      return false;
    }
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    return pbkdf2Async(
      password,
      salt,
      this.config.iterations,
      this.config.keyLength,
      this.config.digest
    );
  }
}

/**
 * Create encryption utilities instance with default configuration
 */
export function createEncryptionUtils(config?: Partial<EncryptionConfig>): EncryptionUtils {
  return new EncryptionUtils(config);
}

/**
 * Encrypt data with default configuration
 */
export async function encryptData(data: string, password: string): Promise<string> {
  const utils = createEncryptionUtils();
  return utils.encrypt(data, password);
}

/**
 * Decrypt data with default configuration
 */
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  const utils = createEncryptionUtils();
  return utils.decrypt(encryptedData, password);
}