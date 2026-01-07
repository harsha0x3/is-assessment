import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: Theme; // user-selected theme
  resolvedTheme: ResolvedTheme; // actual applied theme
  setTheme: (theme: Theme) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme; // optional override, defaults to 'system'
}
