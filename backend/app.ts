import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/upload", documentRoutes);
app.use("/chat", chatRoutes);

export default app;
