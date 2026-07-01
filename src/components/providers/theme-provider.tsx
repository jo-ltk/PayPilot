"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemesProviderProps,
} from "next-themes";

/**
 * Theme provider with dark mode architecture ready for a future toggle.
 * MVP ships in light mode only.
 *
 * next-themes injects a blocking <script> to prevent theme flash. React 19
 * warns when that script re-renders on the client, so we mark it as JSON on
 * the client while SSR keeps the executable script.
 */
export function ThemeProvider({
  children,
  ...props
}: NextThemesProviderProps) {
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      scriptProps={scriptProps}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
