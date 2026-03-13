const { pipeline } = require("@xenova/transformers");

let embedder: any = null;
const embeddingBatchSize = Number(process.env.EMBEDDING_BATCH_SIZE) || 8;

function extractEmbeddings(output: any, batchSize: number): number[][] {
  if (typeof output?.tolist === "function") {
    const values = output.tolist();
    if (batchSize === 1) {
      if (Array.isArray(values?.[0])) {
        return [values[0] as number[]];
      }
      return [values as number[]];
    }
    return values as number[][];
  }

  if (output?.data && Array.isArray(output?.dims) && output.dims.length === 2) {
    const [, columns] = output.dims;
    return Array.from({ length: batchSize }, (_, rowIndex) => {
      const start = rowIndex * columns;
      const end = start + columns;
      return Array.from(output.data.slice(start, end)) as number[];
    });
  }

  if (output?.data) {
    return [Array.from(output.data) as number[]];
  }

  if (Array.isArray(output)) {
    return output.map((row) => Array.from(row?.data ?? row) as number[]);
  }

  throw new Error("Unexpected embedding output shape");
}

async function getEmbedder() {
  if (!embedder) {
    try {
      console.log("Loading embedding model...");
      // Use a lightweight embedding model that runs locally
      embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      );
      console.log("Embedding model loaded successfully");
    } catch (error: any) {
      console.error("Failed to load embedding model:", error);
      throw new Error(
        `Embedding model initialization failed: ${error.message}`,
      );
    }
  }
  return embedder;
}

export async function warmEmbeddingModel(): Promise<void> {
  await getEmbedder();
}

export async function generateEmbedding(
  text: string | string[],
): Promise<number[][]> {
  try {
    const model = await getEmbedder();
    const texts = Array.isArray(text) ? text : [text];

    if (texts.length === 1) {
      const output = await model(texts[0], {
        pooling: "mean",
        normalize: true,
      });
      return extractEmbeddings(output, 1);
    }

    const embeddings: number[][] = [];
    for (let start = 0; start < texts.length; start += embeddingBatchSize) {
      const batch = texts.slice(start, start + embeddingBatchSize);
      const output = await model(batch, { pooling: "mean", normalize: true });
      embeddings.push(...extractEmbeddings(output, batch.length));
    }

    return embeddings;
  } catch (error: any) {
    console.error("Error generating embeddings:", error);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}
