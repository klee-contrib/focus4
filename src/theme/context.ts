import * as React from "react";

export const ThemeContext = React.createContext<Record<string, any>>();
export const ThemeProvider = ThemeContext.Provider;
