import { chroma } from "./chroma.service";

export async function queryChroma(
  sessionId: string,
  questionEmbedding: number[],
) {
  const collectionName = process.env.CHROMA_COLLECTION || "documents";
  const collection: any = await chroma.getOrCreateCollection({
    name: collectionName,
    embeddingFunction: null,
  });

  const result: any = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: 5,
    where: { sessionId },
    include: ["documents"],
  });

  // result.documents is expected to be an array of arrays (one per query)
  return result.documents?.[0] ?? [];
}
