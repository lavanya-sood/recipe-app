import React from 'react';

import { interStyle } from '@/constants/fonts';
import { useTheme } from '@/hooks/use-theme';

export function useFormInputStyle() {
  const theme = useTheme();
  return React.useMemo(
    () => ({
      ...interStyle(400),
      color: theme.text,
      borderColor: theme.backgroundSelected,
      backgroundColor: theme.backgroundElement,
    }),
    [theme],
  );
}
