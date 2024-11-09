import * as React from "react";

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export type BreakpointOptions = {
  direction?: "up" | "down";
  offset?: number;
};

export function useBreakpoint(
  breakpoint: BreakpointKey | number = "md",
  options: BreakpointOptions = {},
) {
  const { direction = "down", offset = 0 } = options;
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const threshold =
      typeof breakpoint === "number" ? breakpoint : BREAKPOINTS[breakpoint];

    // Apply offset to threshold
    const adjustedThreshold = threshold + offset;

    // For "up", we use min-width (inclusive)
    // For "down", we use max-width (exclusive)
    const query =
      direction === "up"
        ? `(min-width: ${adjustedThreshold}px)`
        : `(max-width: ${adjustedThreshold - 1}px)`;

    const mql = window.matchMedia(query);

    const onChange = () => {
      setMatches(mql.matches);
    };

    mql.addEventListener("change", onChange);
    setMatches(mql.matches);

    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint, direction, offset]);

  return !!matches;
}
