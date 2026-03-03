import { pinecone } from "./pinecone.service";

export async function upsertToPinecone(
  sessionId: string,
  chunkId: string,
  vector: number[],
  text: string,
) {
  const index = pinecone.Index(process.env.PINECONE_INDEX!);

  await index.namespace("").upsert({
    records: [
      {
        id: `${sessionId}-${chunkId}`,
        values: vector,
        metadata: {
          sessionId,
          text,
        },
      },
    ],
  });
}
