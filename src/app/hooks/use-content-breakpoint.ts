import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON } from "~/app/globals";
import { useSidebar } from "~/components/ui/sidebar";
import {
  BreakpointKey,
  BreakpointOptions,
  useBreakpoint,
} from "~/hooks/use-breakpoint";

function convertRemToPixels(rem: string) {
  return (
    parseFloat(rem) *
    parseFloat(getComputedStyle(document.documentElement).fontSize)
  );
}

export function useContentBreakpoint(
  breakpoint: BreakpointKey | number = "md",
  options: Omit<BreakpointOptions, "offset"> = {},
) {
  const sidebar = useSidebar();
  const matches = useBreakpoint(breakpoint, {
    ...options,
    offset: sidebar.isMobile
      ? 0
      : convertRemToPixels(
          sidebar.state === "collapsed" ? SIDEBAR_WIDTH_ICON : SIDEBAR_WIDTH,
        ),
  });

  return matches && !sidebar.isMobile;
}
