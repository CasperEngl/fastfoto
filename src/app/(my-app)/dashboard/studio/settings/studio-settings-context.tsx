"use client";

import { createContext, ReactNode } from "react";

interface StudioSettingsContextType {
  userManagableStudios: string[];
}

export const StudioSettingsContext = createContext<StudioSettingsContextType>({
  userManagableStudios: [],
});

export function StudioSettingsProvider({
  userManagableStudios,
  children,
}: StudioSettingsContextType & {
  children: ReactNode;
}) {
  return (
    <StudioSettingsContext value={{ userManagableStudios }}>
      {children}
    </StudioSettingsContext>
  );
}
