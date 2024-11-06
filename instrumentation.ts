export async function register() {
  console.log("process.env.NEXT_RUNTIME", process.env.NEXT_RUNTIME);
  console.log("process.env.AXIOM_DATASET", process.env.AXIOM_DATASET);
  console.log("process.env.AXIOM_TOKEN", process.env.AXIOM_TOKEN);

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
          logger.warn({
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
