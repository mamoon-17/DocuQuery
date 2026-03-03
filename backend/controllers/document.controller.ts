import { Request, Response } from "express";
import pdf from "pdf-parse";
import { ChunkService } from "../services/chunk.service";
import { EmbeddingService } from "../services/embedding.service";
import { SessionService } from "../services/session.service";
import { upsertToPinecone } from "../services/pinecone.store";

export const uploadDocument = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const sessionId = SessionService.createSession();

    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;

    const chunks = ChunkService.chunkText(text);
    const embeddings = await EmbeddingService.embedMany(chunks);

    SessionService.storeData(sessionId, chunks, embeddings);

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
