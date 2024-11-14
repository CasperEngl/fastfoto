"use client";

import { createContext, ReactNode, useContext } from "react";

interface StudioSettingsContextType {
  userManagableStudios: string[];
}

const StudioSettingsContext = createContext<
  StudioSettingsContextType | undefined
>(undefined);

export function StudioSettingsProvider({
  children,
  userManagableStudios = [],
}: {
  children: ReactNode;
} & StudioSettingsContextType) {
  return (
    <StudioSettingsContext.Provider value={{ userManagableStudios }}>
      {children}
    </StudioSettingsContext.Provider>
  );
}

export function useStudioSettings() {
  const context = useContext(StudioSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useStudioSettings must be used within a StudioSettingsProvider",
    );
  }
  return context;
}
