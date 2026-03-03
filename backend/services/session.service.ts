import { v4 as uuidv4 } from "uuid";

type SessionData = {
  chunks: string[];
  embeddings: number[][];
};

export class SessionService {
  private static sessions = new Map<string, SessionData>();

  static createSession(): string {
    const id = uuidv4();
    this.sessions.set(id, { chunks: [], embeddings: [] });
    return id;
  }

  static storeData(
    sessionId: string,
    chunks: string[],
    embeddings: number[][],
  ) {
    this.sessions.set(sessionId, { chunks, embeddings });
  }

  static getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }
}
