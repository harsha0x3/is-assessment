import { useContext } from "react";
import type { ThemeContextValue } from "./types";
import { ThemeContext } from "./ThemeContext";

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
