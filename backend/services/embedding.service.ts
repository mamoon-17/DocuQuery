const { pipeline } = require("@xenova/transformers");

let embedder: any = null;

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

export async function generateEmbedding(
  text: string | string[],
): Promise<number[][]> {
  try {
    const model = await getEmbedder();
    const texts = Array.isArray(text) ? text : [text];

    const embeddings: number[][] = [];
    for (const t of texts) {
      const output = await model(t, { pooling: "mean", normalize: true });
      const embedding: number[] = Array.from(output.data) as number[];

      embeddings.push(embedding);
    }

    return embeddings;
  } catch (error: any) {
    console.error("Error generating embeddings:", error);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}
