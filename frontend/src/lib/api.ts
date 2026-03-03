const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface UploadResponse {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  answer: string;
}

export const api = {
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }

    return res.json();
  },

  async askQuestion(sessionId: string, question: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, question }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Chat failed" }));
      throw new Error(err.error || "Chat failed");
    }

    return res.json();
  },
};
