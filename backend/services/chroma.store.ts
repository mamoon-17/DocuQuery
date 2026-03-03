import { chroma } from "./chroma.service";

export async function upsertToChroma(
  sessionId: string,
  chunkId: string,
  vector: number[],
  text: string,
) {
  const collectionName = process.env.CHROMA_COLLECTION || "documents";
  const collection: any = await chroma.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: null,
  });

  await collection.add({
    ids: [`${sessionId}-${chunkId}`],
    embeddings: [vector],
    documents: [text],
    metadatas: [{ sessionId }],
  });
}
