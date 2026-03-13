import "dotenv/config";
import app from "./app";
import { startKeepalive } from "./services/keepalive.service";
import { warmEmbeddingModel } from "./services/embedding.service";
import { startDailyCleanup } from "./services/cleanup.service";

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // start keepalive pings to prevent cold starts (pings self and chroma)
  startKeepalive();
  startDailyCleanup();

  warmEmbeddingModel().catch((error: Error) => {
    console.error("Embedding warmup failed:", error.message);
  });
});
