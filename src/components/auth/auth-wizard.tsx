import { Box, Text, useApp } from 'ink';
import React, { useEffect, useState } from 'react';

import { AuthUIService } from '../../lib/auth-ui-service.js';
import { AuthProvider } from '../../types/auth.js';
import { ProgressIndicator } from './progress-indicator.js';
import { ProviderSelector } from './provider-selector.js';
import { TokenInput } from './token-input.js';
import { ValidationFeedback } from './validation-feedback.js';

export interface AuthWizardProps {
  onComplete: (success: boolean) => void;
  onExit: () => void;
}

/**
 * Main authentication wizard component that orchestrates the flow
 */
export const AuthWizard: React.FC<AuthWizardProps> = ({
  onComplete,
  onExit,
}) => {
  const [uiService] = useState(() => new AuthUIService());
  const [state, setState] = useState(uiService.getState());
  const { exit } = useApp();

  // Subscribe to UI service state changes
  useEffect(() => {
    const unsubscribe = uiService.subscribe((newState) => {
      setState(newState);

      // Handle completion
      if (newState.currentStep === 'success') {
        onComplete(true);
      } else if (newState.currentStep === 'error') {
        onComplete(false);
      }
    });

    return unsubscribe;
  }, [uiService, onComplete]);

  // Handle provider selection
  const handleSelectProvider = (provider: AuthProvider) => {
    uiService.selectProvider(provider);
  };

  // Handle token submission
  const handleSubmitToken = async (token: string, username?: string) => {
    uiService.updateCredentials({
      personalAccessToken: token,
      username,
    });

    // Move to validation step
    setState(prev => ({ ...prev, currentStep: 'validation' }));

    // Perform authentication
    await uiService.authenticate();
  };

  // Handle going back
  const handleGoBack = () => {
    uiService.goBack();
  };

  // Handle exit
  const handleExit = () => {
    uiService.cleanup();
    onExit();
    exit();
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'error':

      case 'success':

      case 'validation': {
        return (
          <Box flexDirection="column">
            <ValidationFeedback
              isLoading={state.isLoading}
              validationResult={state.validationResult}
            />

            {state.error && (
              <Box marginY={1}>
                <Text bold color="red">
                  ❌ Error: {state.error}
                </Text>
              </Box>
            )}

            {state.currentStep === 'success' && (
              <Box marginY={1}>
                <Text bold color="green">
                  🎉 Authentication successful!
                </Text>
              </Box>
            )}

            {state.currentStep === 'error' && (
              <Box marginY={1}>
                <Text color="yellow">
                  Press R to retry, Esc to exit
                </Text>
              </Box>
            )}
          </Box>
        );
      }

      case 'provider-selection': {
        return (
          <ProviderSelector
            onSelectProvider={handleSelectProvider}
            state={state}
          />
        );
      }

      case 'token-input': {
        return (
          <TokenInput
            onGoBack={handleGoBack}
            onSubmitToken={handleSubmitToken}
            state={state}
          />
        );
      }

      default: {
        return (
          <Box>
            <Text color="red">Unknown step: {state.currentStep}</Text>
          </Box>
        );
      }
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box alignItems="center" justifyContent="center" marginBottom={2}>
        <Text bold color="cyan">
          🚀 Project Code Authentication Wizard
        </Text>
      </Box>

      {/* Progress indicator */}
      <ProgressIndicator currentStep={state.currentStep} />

      {/* Main content */}
      <Box marginY={2}>
        {renderCurrentStep()}
      </Box>

      {/* Footer with controls */}
      <Box justifyContent="center" marginTop={2}>
        <Text color="gray">
          {state.currentStep === 'success'
            ? 'Authentication completed! Press any key to continue...'
            : state.currentStep === 'error'
            ? 'Press R to retry, Esc to exit'
            : 'Use keyboard to navigate • Esc to exit'
          }
        </Text>
      </Box>
    </Box>
  );
};