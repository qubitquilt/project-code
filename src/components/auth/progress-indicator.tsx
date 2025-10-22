import { Box, Text } from 'ink';
import React from 'react';

import { AuthWizardStep } from '../../lib/auth-ui-service.js';

export interface ProgressIndicatorProps {
  currentStep: AuthWizardStep;
}

/**
 * Step progress indicator component
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
}) => {
  const steps: Array<{icon: string; key: AuthWizardStep; label: string}> = [
    { icon: '🔧', key: 'provider-selection', label: 'Provider' },
    { icon: '🔑', key: 'token-input', label: 'Token' },
    { icon: '✅', key: 'validation', label: 'Validate' },
    { icon: '🎉', key: 'success', label: 'Success' },
    { icon: '❌', key: 'error', label: 'Error' },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex(step => step.key === currentStep);

  const currentIndex = getCurrentStepIndex();

  return (
    <Box flexDirection="column" marginY={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          📋 Authentication Progress
        </Text>
      </Box>

      <Box flexDirection="row">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;

          let statusIcon = step.icon;
          let statusColor: string = 'gray';

          if (isActive) {
            statusIcon = '🔄';
            statusColor = 'cyan';
          } else if (isCompleted) {
            statusIcon = '✅';
            statusColor = 'green';
          } else if (isPending) {
            statusIcon = '⏳';
            statusColor = 'gray';
          }

          return (
            <Box key={step.key} marginRight={index < steps.length - 1 ? 2 : 0}>
              <Box alignItems="center" flexDirection="column">
                <Box marginBottom={1}>
                  <Text bold color={statusColor}>
                    {statusIcon}
                  </Text>
                </Box>

                <Text
                  bold={isActive}
                  color={isActive ? 'cyan' : isCompleted ? 'green' : 'gray'}
                >
                  {step.label}
                </Text>

                {index < steps.length - 1 && (
                  <Box marginTop={1}>
                    <Text color={isCompleted ? 'green' : 'gray'}>
                      ──
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">
          Step {currentIndex + 1} of {steps.length}: {steps[currentIndex]?.label}
        </Text>
      </Box>
    </Box>
  );
};