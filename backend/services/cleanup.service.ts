import { chroma } from "./chroma.service";

let cleanupIntervalId: NodeJS.Timeout | null = null;

function getCollectionName(): string {
  return process.env.CHROMA_COLLECTION || "documents";
}

async function resetChromaCollection(): Promise<void> {
  const collectionName = getCollectionName();

  try {
    // Full reset keeps memory/disk usage bounded over time.
    await (chroma as any).deleteCollection({ name: collectionName });
    console.log(`[cleanup] deleted Chroma collection: ${collectionName}`);
  } catch (error: any) {
    // First run may fail if the collection doesn't exist yet.
    console.log(
      `[cleanup] delete skipped for ${collectionName}: ${error?.message || "not found"}`,
    );
  }

  await chroma.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: null,
  });

  console.log(`[cleanup] recreated Chroma collection: ${collectionName}`);
}

export function startDailyCleanup() {
  const enabled = (process.env.DAILY_CLEANUP_ENABLED ?? "false").toLowerCase();
  if (enabled !== "true") {
    return;
  }

  const intervalHours = Number(process.env.DAILY_CLEANUP_INTERVAL_HOURS) || 24;
  const intervalMs = Math.max(1, intervalHours) * 60 * 60 * 1000;
  const runAtStartup =
    (process.env.DAILY_CLEANUP_ON_STARTUP ?? "false").toLowerCase() === "true";

  if (runAtStartup) {
    resetChromaCollection().catch((error: Error) => {
      console.error("[cleanup] startup reset failed:", error.message);
    });
  }

  cleanupIntervalId = setInterval(() => {
    resetChromaCollection().catch((error: Error) => {
      console.error("[cleanup] scheduled reset failed:", error.message);
    });
  }, intervalMs);

  console.log(
    `[cleanup] enabled: resetting Chroma every ${Math.max(1, intervalHours)} hour(s)`,
  );
}

export function stopDailyCleanup() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}
