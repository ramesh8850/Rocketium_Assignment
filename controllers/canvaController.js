import { generatePDF } from "../services/pdfService.js";
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


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
        // Convert buffer to base64 data URL
        const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;
        canvasState.elements.push({
            type: "image",
            x,
            y,
            width,
            height,
            imageUrl: base64Image,
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

export const updateElementPosition = (req, res) => {
    try {
        const elementId = req.params.id;
        const { x, y } = req.body;

        if (!canvasState) {
            return res.status(400).json({ success: false, message: "Canvas not initialized" });
        }

        // Find element by id
        const elementIndex = canvasState.elements.findIndex((el, idx) => {
            // We don't have id stored in elements, so we use index as id
            return idx.toString() === elementId;
        });

        if (elementIndex === -1) {
            return res.status(404).json({ success: false, message: "Element not found" });
        }

        // Update element position
        canvasState.elements[elementIndex].x = x;
        canvasState.elements[elementIndex].y = y;

        res.json({ success: true, message: "Element position updated" });
    } catch (error) {
        console.error('Update Element Position Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Export to PDF


export const exportToPDF = async (req, res) => {
    try {
        // 1. Validate canvas state
        if (!canvasState) throw new Error("Canvas not initialized");

        // 2. Generate PDF
        const pdfBuffer = await generatePDF(canvasState);
        if (!pdfBuffer?.length) throw new Error("Empty PDF generated");

        // 3. Prepare paths - Go up one level from controllers directory
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(dirname(__filename)); // Goes up to canva_backend
        const exportsDir = join(__dirname, 'exports');
        const filename = `canvas_${Date.now()}.pdf`;
        const filePath = join(exportsDir, filename);

        // 4. Debug paths
        // console.log('Root Directory:', __dirname);
        // console.log('Export Directory:', exportsDir);
        // console.log('Full File Path:', filePath);

        // 5. Ensure directory exists
        await fsPromises.mkdir(exportsDir, { recursive: true });

        // 6. Write file
        await fsPromises.writeFile(filePath, pdfBuffer);
        console.log(`PDF successfully saved to: ${filePath}`);

        // 7. Verify file exists
        const stats = await fsPromises.stat(filePath);
        console.log(`File verification: ${stats.size} bytes written`);

        // 8. Respond
        res.json({
            success: true,
            url: `/exports/${filename}`,
            path: filePath,
            size: stats.size
        });

    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
