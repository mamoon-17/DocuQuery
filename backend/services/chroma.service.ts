// Use require to load chromadb to avoid TypeScript module resolution issues
const chromadb: any = require("chromadb");
const { ChromaClient } = chromadb;

export const chroma = new ChromaClient();

export async function initChroma() {
  return chroma;
}
