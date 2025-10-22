import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';

import { AuthWizardState } from '../../lib/auth-ui-service.js';
import { AuthProvider } from '../../types/auth.js';

export interface TokenInputProps {
  onGoBack: () => void;
  onSubmitToken: (token: string, username?: string) => void;
  state: AuthWizardState;
}

/**
 * Secure token input component with masking and validation
 */
export const TokenInput: React.FC<TokenInputProps> = ({
  onGoBack,
  onSubmitToken,
  state,
}) => {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'token' | 'username'>('token');

  const { selectedProvider } = state;
  const isLocalProvider = selectedProvider === 'local';

  // Get provider configuration
  const providerConfig = [
    {
      description: 'Connect to GitHub repositories',
      displayName: 'GitHub',
      helpUrl: 'https://github.com/settings/tokens',
      name: 'github' as AuthProvider,
      requiresToken: true,
      tokenFormat: 'Must start with ghp_, gho_, ghu_, or ghs_',
      tokenLabel: 'Personal Access Token',
      tokenPlaceholder: 'ghp_...',
    },
    {
      description: 'Connect to GitLab repositories',
      displayName: 'GitLab',
      helpUrl: 'https://gitlab.com/-/profile/personal_access_tokens',
      name: 'gitlab' as AuthProvider,
      requiresToken: true,
      tokenFormat: 'Must start with glpat-',
      tokenLabel: 'Personal Access Token',
      tokenPlaceholder: 'glpat-...',
    },
    {
      description: 'Connect to Bitbucket repositories',
      displayName: 'Bitbucket',
      helpUrl: 'https://bitbucket.org/account/settings/app-passwords/',
      name: 'bitbucket' as AuthProvider,
      requiresToken: true,
      tokenFormat: 'Alphanumeric characters, typically 32+ characters',
      tokenLabel: 'App Password',
      tokenPlaceholder: 'Your app password',
    },
    {
      description: 'Use local Git configuration',
      displayName: 'Local',
      helpUrl: '',
      name: 'local' as AuthProvider,
      requiresToken: false,
      tokenFormat: 'Uses your existing Git setup',
      tokenLabel: 'No token required',
      tokenPlaceholder: 'Not applicable',
    },
  ].find(config => config.name === selectedProvider);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.tab) {
      setFocusedField(prev => prev === 'token' ? 'username' : 'token');
    } else if (key.return) {
      if (focusedField === 'token' && token) {
        if (isLocalProvider) {
          onSubmitToken('', username || undefined);
        } else {
          onSubmitToken(token, username || undefined);
        }
      }
    } else if (key.escape) {
      onGoBack();
    } else if (key.ctrl && input === 'v') {
      // Toggle token visibility
      setIsTokenVisible(prev => !prev);
    } else if (focusedField === 'token') {
      if (key.backspace || key.delete) {
        setToken(prev => prev.slice(0, -1));
      } else if (input && !key.ctrl && input.length === 1) {
        setToken(prev => prev + input);
      }
    } else if (focusedField === 'username') {
      if (key.backspace || key.delete) {
        setUsername(prev => prev.slice(0, -1));
      } else if (input && !key.ctrl && input.length === 1) {
        setUsername(prev => prev + input);
      }
    }
  });

  // Display masked token
  const displayToken = isTokenVisible ? token : '•'.repeat(token.length) || '';

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🔑 {providerConfig?.displayName} Authentication
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">
          {providerConfig?.description}
        </Text>
      </Box>

      {!isLocalProvider && (
        <>
          <Box marginBottom={1}>
            <Text color="yellow">
              💡 {providerConfig?.tokenFormat}
            </Text>
          </Box>

          <Box marginBottom={1}>
            <Text color="gray">
              Press Ctrl+V to toggle token visibility
            </Text>
          </Box>

          {/* Token input field */}
          <Box marginBottom={2}>
            <Box marginRight={1}>
              <Text color={focusedField === 'token' ? 'cyan' : 'white'}>
                {focusedField === 'token' ? '▶' : ' '}{' '}
                {providerConfig?.tokenLabel}:
              </Text>
            </Box>
            <Box>
              <Text color={focusedField === 'token' ? 'cyan' : 'white'}>
                {displayToken || providerConfig?.tokenPlaceholder}
                {focusedField === 'token' && (
                  <Text color="cyan">_</Text>
                )}
              </Text>
            </Box>
          </Box>
        </>
      )}

      {/* Username input field (optional for most providers) */}
      <Box marginBottom={2}>
        <Box marginRight={1}>
          <Text color={focusedField === 'username' ? 'cyan' : 'white'}>
            {focusedField === 'username' ? '▶' : ' '}{' '}
            Username (optional):
          </Text>
        </Box>
        <Box>
          <Text color={focusedField === 'username' ? 'cyan' : 'white'}>
            {username || 'Leave blank to use default'}
            {focusedField === 'username' && (
              <Text color="cyan">_</Text>
            )}
          </Text>
        </Box>
      </Box>

      {/* Instructions */}
      <Box marginBottom={1}>
        <Text color="gray">
          Tab: Switch fields • Enter: Submit • Esc: Go back
        </Text>
      </Box>

      {/* Validation feedback */}
      {token && !isLocalProvider && (
        <Box marginBottom={1}>
          <Text color={token.length < 10 ? 'red' : 'green'}>
            {token.length < 10 ? '⚠️' : '✅'} Token length: {token.length} characters
          </Text>
        </Box>
      )}

      {/* Submit button hint */}
      <Box>
        <Text color="green">
          {isLocalProvider
            ? 'Press Enter to continue with local authentication'
            : 'Press Enter when ready to validate your token'
          }
        </Text>
      </Box>
    </Box>
  );
};