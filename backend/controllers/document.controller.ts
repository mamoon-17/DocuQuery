import { Request, Response } from "express";
import pdf from "pdf-parse";
import { ChunkService } from "../services/chunk.service";
import { upsertManyToChroma } from "../services/chroma.store";
import { generateEmbedding } from "../services/embedding.service";

export const uploadDocument = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("Processing PDF upload...");

    // Generate a unique sessionId for this document upload
    const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    console.log("Parsing PDF...");
    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;
    console.log(`Extracted ${text.length} characters from PDF`);

    console.log("Chunking text...");
    const chunks = ChunkService.chunkText(text);
    console.log(`Created ${chunks.length} chunks`);

    // Get embeddings for all chunks using local model
    console.log("Generating embeddings...");
    const embeddings = await generateEmbedding(chunks);
    console.log(`Generated ${embeddings.length} embeddings`);

    console.log("Storing in Chroma...");
    await upsertManyToChroma(sessionId, chunks, embeddings);

    console.log("Upload successful!");
    res.json({
      message: "Document processed successfully",
      sessionId,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    console.error("Error stack:", err?.stack);
    res.status(500).json({
      error: "Upload failed",
      details: err?.message || "Unknown error",
    });
  }
};
