export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { default: pino } = await import("pino");
    const logger = pino(
      { level: "warn" },
      pino.transport({
        target: "@axiomhq/pino",
        options: {
          dataset: process.env.AXIOM_DATASET,
          token: process.env.AXIOM_TOKEN,
        },
      }),
    );
    const { PerformanceObserver } = await import("perf_hooks");

    // Create a performance observer
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        // Log slow operations (> 1s)
        if (entry.duration > 1000) {
          logger.warn(
            `Slow operation detected: ${entry.name} took ${entry.duration}ms`,
          );
        }
      });
    });

    obs.observe({
      entryTypes: ["mark", "measure", "function", "gc", "http"],
      buffered: true,
    });
  }
}
