import React from 'react';

import { useTheme } from '@/hooks/use-theme';

export function useFormInputStyle() {
  const theme = useTheme();
  return React.useMemo(
    () => ({
      color: theme.text,
      borderColor: theme.backgroundSelected,
      backgroundColor: theme.backgroundElement,
    }),
    [theme],
  );
}
