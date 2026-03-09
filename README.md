# DocuQuery

**AI-Powered Document Question Answering System**

## Overview

DocuQuery is a learning project built to understand how Retrieval-Augmented Generation (RAG) works end-to-end. The goal was to build the simplest possible application that demonstrates the full RAG workflow — from document ingestion and chunking, through local embedding generation and vector storage, all the way to context-aware question answering.

It is a full-stack application that lets you upload any PDF document and instantly ask questions about its content. DocuQuery extracts, embeds, and indexes your document locally, then uses Groq to generate accurate, context-aware answers — all within a clean, responsive interface.

Built using **React.js with Vite** for the frontend and **Express.js (Node.js)** for the backend, with local embeddings via **Xenova Transformers** and vector storage via **ChromaDB**.

**Live Demo**: [https://doc-query-nu.vercel.app](https://doc-query-nu.vercel.app)

## Key Features

### Document Upload

- Upload PDF documents via drag-and-drop or file picker
- Automatic text extraction and intelligent chunking with overlap
- Per-session document isolation — each upload gets a unique session ID
- Instant feedback on upload and processing status

### AI-Powered Question Answering

- Ask natural language questions about your uploaded document
- Context-aware answers generated strictly from document content
- Powered by Groq with fast inference
- Clean, readable responses with markdown stripped for clarity

### RAG Pipeline

- PDF text is chunked with configurable size and overlap
- Local embeddings generated using **Xenova/all-MiniLM-L6-v2** (runs entirely on the server — no external embedding API required)
- Embeddings stored and queried via **ChromaDB** vector database
- Relevant chunks retrieved and passed as context to the LLM

### Session Management

- Each uploaded document creates an isolated session
- Multiple documents can be queried independently
- Re-upload any document to start a fresh session

## Tech Stack

### Frontend

- **React.js** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible component primitives
- **React Router** for client-side navigation
- **TanStack Query** for data fetching

### Backend

- **Express.js** (Node.js)
- **TypeScript** for type safety
- **Groq SDK** for LLM inference
- **Xenova Transformers** for local embedding generation (all-MiniLM-L6-v2)
- **ChromaDB** as the vector database
- **pdf-parse** for PDF text extraction
- **Multer** for file upload handling
- **Docker Compose** for local orchestration

## Project Structure

```
DocuQuery/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── ui/         # Radix-based UI primitives
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # API client and utilities
│   └── ...
│
├── backend/                # Express.js backend application
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server entrypoint
│   ├── controllers/
│   │   ├── document.controller.ts  # PDF upload and processing
│   │   └── chat.controller.ts      # Question answering
│   ├── routes/
│   │   ├── document.routes.ts
│   │   └── chat.routes.ts
│   ├── services/
│   │   ├── chunk.service.ts        # Text chunking
│   │   ├── embedding.service.ts    # Local embedding generation
│   │   ├── chroma.service.ts       # ChromaDB client
│   │   ├── chroma.store.ts         # Vector upsert
│   │   ├── chroma.query.ts         # Vector similarity search
│   │   ├── groq.service.ts         # Groq client
│   │   └── keepalive.service.ts    # Health / uptime pings
│   ├── docker-compose.yml
│   └── Dockerfile
│
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm**, **bun**, or another package manager
- **Docker** and **Docker Compose** (for running ChromaDB locally)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd DocuQuery
   ```

2. **Start ChromaDB and the backend with Docker Compose**

   ```bash
   cd backend
   docker-compose up --build
   ```

3. **Setup and run the frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`
   - ChromaDB: `http://localhost:8000`

### Running the Backend Without Docker

```bash
cd backend
npm install
npm run dev
```

> ChromaDB must still be running separately. Start it with:
> ```bash
> docker run -p 8000:8000 ghcr.io/chroma-core/chroma:latest
> ```

## Environment Variables

### Frontend (.env)

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=your_backend_api_url
```

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```env
GROQ_API_KEY=your_groq_api_key
CHROMA_URL=http://localhost:8000
```

## How It Works

| Step | Description |
| ---- | ----------- |
| **1. Upload** | User uploads a PDF; the backend extracts raw text using `pdf-parse` |
| **2. Chunk** | Text is split into overlapping chunks (800 chars, 200 overlap) |
| **3. Embed** | Each chunk is embedded locally using `all-MiniLM-L6-v2` via Xenova Transformers |
| **4. Store** | Embeddings and chunks are upserted into ChromaDB under a unique session ID |
| **5. Query** | User submits a question; it is embedded and used to retrieve the top relevant chunks |
| **6. Answer** | Retrieved chunks are passed as context to Groq, which returns a grounded answer |

## API Endpoints

| Method | Endpoint  | Description                              |
| ------ | --------- | ---------------------------------------- |
| POST   | `/upload` | Upload a PDF and receive a `sessionId`   |
| POST   | `/chat`   | Ask a question against a session's document |
| GET    | `/health` | Health check endpoint                    |

## Deployment

The backend is deployed on **Render** as a single Docker service. Rather than running ChromaDB as a separate service, the `start.sh` entrypoint starts the ChromaDB server (pulled from Docker Hub via the Dockerfile) as a background process inside the same container, then starts the Node.js backend. This means the entire backend stack — ChromaDB and the Express server — runs as one unified Docker service on Render.

The frontend is deployed separately on **Vercel**.

```
Render Docker Service
  └── start.sh
        ├── chroma run --host 0.0.0.0 --port 8000  (background)
        └── node dist/server.js
```

## Security Features

- Session-scoped document isolation (no cross-session data access)
- Input validation on file type (PDF only) and request body
- CORS configured on the backend
- No sensitive user data persisted beyond the active session

## License

This project was built for personal learning — specifically to understand the end-to-end workflow of a RAG (Retrieval-Augmented Generation) pipeline. It is not intended for production use.
