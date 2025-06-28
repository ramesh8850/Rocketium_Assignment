import PDFDocument from "pdfkit";
import { createCanvas, loadImage } from "canvas";

export const generatePDF = (canvasState) => {
    const doc = new PDFDocument({
        size: [canvasState.width, canvasState.height],
        compress: true, // Enable PDF compression
    });

    // Draw each element
    canvasState.elements.forEach((element) => {
        switch (element.type) {
            case "rectangle":
                doc.rect(element.x, element.y, element.width, element.height)
                    .fill(element.color);
                break;
            case "circle":
                doc.circle(element.x, element.y, element.radius)
                    .fill(element.color);
                break;
            case "text":
                doc.font(element.font || "Helvetica")
                    .fontSize(12)
                    .fill(element.color)
                    .text(element.text, element.x, element.y);
                break;
            case "image":
                if (element.imageBuffer) {
                    // Draw image from buffer
                    const img = element.imageBuffer;
                    doc.image(img, element.x, element.y, { width: element.width, height: element.height });
                } else if (element.imageUrl) {
                    // Load image from URL and draw (async not supported here, so skip or handle differently)
                    // For simplicity, skip loading from URL in PDF generation
                }
                break;
        }
    });

    // Return PDF as buffer
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.end();
    return Buffer.concat(buffers);
};
