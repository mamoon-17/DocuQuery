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
      // Include details field from backend for more specific error messages
      const errorMessage = err.details || err.error || "Upload failed";
      throw new Error(errorMessage);
    }

    return res.json();
  },

  async askQuestion(
    sessionId: string,
    question: string,
  ): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, question }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Chat failed" }));
      // Include details field from backend for more specific error messages
      const errorMessage = err.details || err.error || "Chat failed";
      throw new Error(errorMessage);
    }

    return res.json();
  },
};
