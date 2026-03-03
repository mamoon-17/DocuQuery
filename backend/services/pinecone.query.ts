import { pinecone } from "./pinecone.service";

export async function queryPinecone(
  sessionId: string,
  questionEmbedding: number[],
) {
  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  const result = await index.namespace("").query({
    topK: 5,
    vector: questionEmbedding,
    filter: { sessionId },
    includeMetadata: true,
  });

  return result.matches?.map((m: any) => m.metadata?.text ?? "");
}
