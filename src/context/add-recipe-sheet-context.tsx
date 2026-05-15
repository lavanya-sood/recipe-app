import React from 'react';

import { AddRecipeSheet } from '@/components/add-recipe-sheet';

type AddRecipeSheetContextValue = {
  open: () => void;
  close: () => void;
};

const AddRecipeSheetContext = React.createContext<AddRecipeSheetContextValue | null>(null);

export function AddRecipeSheetProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);

  const value = React.useMemo(
    () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }),
    [],
  );

  return (
    <AddRecipeSheetContext.Provider value={value}>
      {children}
      <AddRecipeSheet visible={visible} onClose={() => setVisible(false)} />
    </AddRecipeSheetContext.Provider>
  );
}

export function useAddRecipeSheet() {
  const ctx = React.useContext(AddRecipeSheetContext);
  if (!ctx) {
    throw new Error('useAddRecipeSheet must be used within AddRecipeSheetProvider');
  }
  return ctx;
}
