import express from "express";
import documentRoutes from "./routes/document.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

app.use(express.json());
app.use("/upload", documentRoutes);
app.use("/chat", chatRoutes);

export default app;
