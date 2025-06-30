import { Router } from "express";
import multer from "multer";
import {
    initCanvas,
    addRectangle,
    addCircle,
    addText,
    addImage,
    exportToPDF,
    updateElementPosition,
} from "../controllers/canvaController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Canvas Operations
router.post("/canvas/init", initCanvas);
router.post("/canvas/rectangle", addRectangle);
router.post("/canvas/circle", addCircle);
router.post("/canvas/text", addText);
router.post("/canvas/image", upload.single("image"), addImage);
router.put("/canvas/element/:id/position", updateElementPosition);

// PDF Export
router.get("/export/pdf", exportToPDF);

export default router;
