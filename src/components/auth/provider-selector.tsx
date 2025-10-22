import { Box, Text, useInput } from 'ink';
import React, { useState } from 'react';

import { AuthWizardState } from '../../lib/auth-ui-service.js';
import { AuthProvider } from '../../types/auth.js';

export interface ProviderSelectorProps {
  onSelectProvider: (provider: AuthProvider) => void;
  state: AuthWizardState;
}

/**
 * Interactive provider selection component with checkboxes
 */
export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  onSelectProvider,
  state: _state,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get provider configurations from the UI service
  const providerConfigs = [
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
  ];

  // Handle keyboard navigation
  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : providerConfigs.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < providerConfigs.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      onSelectProvider(providerConfigs[selectedIndex].name);
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          🔐 Choose your authentication provider
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">
          Use arrow keys to navigate, Enter to select
        </Text>
      </Box>

      <Box flexDirection="column">
        {providerConfigs.map((provider, index) => {
          const isSelected = index === selectedIndex;
          const checkbox = isSelected ? '◉' : '○';

          return (
            <Box key={provider.name} marginBottom={index < providerConfigs.length - 1 ? 1 : 0}>
              <Box marginRight={1}>
                <Text color={isSelected ? 'cyan' : 'white'}>
                  {checkbox}
                </Text>
              </Box>

              <Box flexDirection="column" flexGrow={1}>
                <Box>
                  <Text bold color={isSelected ? 'cyan' : 'white'}>
                    {provider.displayName}
                  </Text>
                  {!provider.requiresToken && (
                    <Text color="green"> (no token needed)</Text>
                  )}
                </Box>

                <Box marginLeft={2}>
                  <Text color="gray" wrap="wrap">
                    {provider.description}
                  </Text>
                </Box>

                {provider.requiresToken && (
                  <Box marginLeft={2}>
                    <Text color="yellow">
                      Token: {provider.tokenFormat}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={2}>
        <Text color="gray">
          💡 Tip: For help getting tokens, visit the provider's token settings page
        </Text>
      </Box>
    </Box>
  );
};