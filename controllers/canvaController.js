import { generatePDF } from "../services/pdfService.js";

// In-memory canvas state (replace with DB in production)
let canvasState = null;

// Initialize Canvas
export const initCanvas = (req, res) => {
    const { width, height } = req.body;
    canvasState = { width, height, elements: [] };
    res.json({ success: true, canvasId: "canvas_1" });
};

// Add Rectangle
export const addRectangle = (req, res) => {
    const { x, y, width, height, color } = req.body;
    canvasState.elements.push({ type: "rectangle", x, y, width, height, color });
    res.json({ success: true });
};

// Add Circle
export const addCircle = (req, res) => {
    const { x, y, radius, color } = req.body;
    canvasState.elements.push({ type: "circle", x, y, radius, color });
    res.json({ success: true });
};

// Add Text
export const addText = (req, res) => {
    const { x, y, text, font, color } = req.body;
    canvasState.elements.push({ type: "text", x, y, text, font, color });
    res.json({ success: true });
};

// Add Image (using Multer for file upload)
export const addImage = (req, res) => {
    const { imageUrl, x, y, width, height } = req.body;
    if (!canvasState) {
        return res.status(400).json({ success: false, message: "Canvas not initialized" });
    }

    if (req.file) {
        // Image uploaded as file
        const imageBuffer = req.file.buffer;
        canvasState.elements.push({
            type: "image",
            x,
            y,
            width,
            height,
            imageBuffer,
        });
        return res.json({ success: true, message: "Image uploaded via file" });
    } else if (imageUrl) {
        // Image added via URL
        canvasState.elements.push({
            type: "image",
            x,
            y,
            width,
            height,
            imageUrl,
        });
        return res.json({ success: true, message: "Image added via URL" });
    } else {
        return res.status(400).json({ success: false, message: "No image provided" });
    }
};

// Export to PDF
export const exportToPDF = (req, res) => {
    const pdfBuffer = generatePDF(canvasState);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=canvas.pdf");
    res.send(pdfBuffer);
};