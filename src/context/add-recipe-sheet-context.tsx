import React from "react";

type AddRecipeSheetContextValue = {
  visible: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const AddRecipeSheetContext =
  React.createContext<AddRecipeSheetContextValue | null>(null);

export function AddRecipeSheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = React.useState(false);

  const value = React.useMemo(
    () => ({
      visible,
      open: () => setVisible(true),
      close: () => setVisible(false),
      toggle: () => setVisible((v) => !v),
    }),
    [visible],
  );

  return (
    <AddRecipeSheetContext.Provider value={value}>
      {children}
    </AddRecipeSheetContext.Provider>
  );
}

export function useAddRecipeSheet() {
  const ctx = React.useContext(AddRecipeSheetContext);
  if (!ctx) {
    throw new Error(
      "useAddRecipeSheet must be used within AddRecipeSheetProvider",
    );
  }
  return ctx;
}
