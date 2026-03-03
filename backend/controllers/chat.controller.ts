import { Request, Response } from "express";
import { queryPinecone } from "../services/pinecone.query";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const askQuestion = async (req: Request, res: Response) => {
  const { sessionId, question } = req.body;

  const embedRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  const questionEmbedding = embedRes.data[0].embedding;

  const chunks = await queryPinecone(sessionId, questionEmbedding);

  const context = chunks.join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Answer using only the context." },
      { role: "user", content: `Context:\n${context}\n\nQ: ${question}` },
    ],
  });

  res.json({ answer: completion.choices[0].message.content });
};
