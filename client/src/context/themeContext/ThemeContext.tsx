// src\context\themeContext\ThemeContext.tsx
import { createContext } from "react";
import type { ThemeContextValue } from "./types";

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);
