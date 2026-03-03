import { Request, Response } from "express";
import pdf from "pdf-parse";
import { ChunkService } from "../services/chunk.service";
import { upsertToPinecone } from "../services/pinecone.store";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const uploadDocument = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Generate a unique sessionId for this document upload
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;

    const chunks = ChunkService.chunkText(text);

    // Get embeddings for all chunks
    const embedRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks,
    });
    const embeddings = embedRes.data.map((d) => d.embedding);

    // Store data for the document upload (removed SessionService reference)

    for (let i = 0; i < chunks.length; i++) {
      await upsertToPinecone(sessionId, `${i}`, embeddings[i], chunks[i]);
    }

    res.json({
      message: "Document processed successfully",
      sessionId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};
