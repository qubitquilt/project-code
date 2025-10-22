import { Box, Text } from 'ink';
import React from 'react';

import { ValidationResult } from '../../lib/auth-ui-service.js';

export interface ValidationFeedbackProps {
  isLoading?: boolean;
  validationResult: null | ValidationResult;
}

/**
 * Real-time validation feedback component
 */
export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  isLoading = false,
  validationResult,
}) => {
  if (isLoading) {
    return (
      <Box marginY={1}>
        <Text color="yellow">
          ⏳ Validating...
        </Text>
      </Box>
    );
  }

  if (!validationResult) {
    return null;
  }

  const { details, isValid, message } = validationResult;

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={isValid ? 'green' : 'red'}>
          {isValid ? '✅' : '❌'} {message}
        </Text>
      </Box>

      {details && details.length > 0 && (
        <Box flexDirection="column" marginLeft={2}>
          {details.map((detail, index) => (
            <Box key={index}>
              <Text color={isValid ? 'green' : 'red'}>
                • {detail}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};