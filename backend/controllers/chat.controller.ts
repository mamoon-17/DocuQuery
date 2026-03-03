import { Request, Response } from "express";
import { queryChroma } from "../services/chroma.query";
import { groq } from "../services/groq.service";
import { generateEmbedding } from "../services/embedding.service";

export const askQuestion = async (req: Request, res: Response) => {
  const { sessionId, question } = req.body;

  // Get embedding for the question using local model
  const embeddings = await generateEmbedding(question);
  const questionEmbedding = embeddings[0];

  const chunks = await queryChroma(sessionId, questionEmbedding);
  const context = chunks.join("\n\n");

  // Get answer from Groq using the context
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: "Answer using only the provided context." },
      { role: "user", content: `Context:\n${context}\n\nQ: ${question}` },
    ],
  });

  // Remove markdown formatting from the answer
  let answer: string = completion.choices[0].message.content ?? "";
  // Remove markdown formatting: asterisks, backticks, hashes, dashes, bullets, vertical bars, tables
  answer = answer.replace(/[|*_`#>\-]/g, "");
  // Remove numbered and bulleted lists
  answer = answer.replace(/\n\s*\d+\.\s*/g, "\n");
  answer = answer.replace(/\n\s*[-•]\s*/g, "\n");
  // Remove markdown table headers and separators
  answer = answer.replace(/\n?\s*\|\s*/g, " ");
  answer = answer.replace(/\n?\s*---+\s*/g, " ");
  // Remove extra spaces and newlines
  answer = answer
    .replace(/ +/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
  res.json({ answer });
};
