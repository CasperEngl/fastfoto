import { logger } from "~/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { PerformanceObserver } = await import("perf_hooks");

    // Create a performance observer
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        // Log slow operations (> 1s)
        if (entry.duration > 1000) {
          logger.info({
            msg: `Slow operation detected: ${entry.name}`,
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            entryType: entry.entryType,
            detail: entry.detail,
          });
        }
      });
    });

    obs.observe({
      entryTypes: ["mark", "measure", "function", "gc", "http"],
      buffered: true,
    });
  }
}
