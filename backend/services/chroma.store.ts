import { chroma } from "./chroma.service";

async function getCollection() {
  const collectionName = process.env.CHROMA_COLLECTION || "documents";
  return chroma.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: null,
  });
}

export async function upsertToChroma(
  sessionId: string,
  chunkId: string,
  vector: number[],
  text: string,
) {
  const collection: any = await getCollection();

  await collection.add({
    ids: [`${sessionId}-${chunkId}`],
    embeddings: [vector],
    documents: [text],
    metadatas: [{ sessionId }],
  });
}

export async function upsertManyToChroma(
  sessionId: string,
  chunks: string[],
  embeddings: number[][],
) {
  const collection: any = await getCollection();

  await collection.add({
    ids: chunks.map((_, index) => `${sessionId}-${index}`),
    embeddings,
    documents: chunks,
    metadatas: chunks.map(() => ({ sessionId })),
  });
}
