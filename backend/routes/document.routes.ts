import { Router } from "express";
import multer from "multer";
import { uploadDocument } from "../controllers/document.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), uploadDocument);

export default router;
