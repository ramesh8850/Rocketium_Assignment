import PDFDocument from "pdfkit";
import { createCanvas, loadImage } from "canvas";

export const generatePDF = async (canvasState) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Create canvas
            const canvas = createCanvas(canvasState.width, canvasState.height);
            const ctx = canvas.getContext("2d");

            // Set white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvasState.width, canvasState.height);

            // Draw elements on canvas
            for (const element of canvasState.elements) {
                switch (element.type) {
                    case "rectangle":
                        ctx.fillStyle = element.color;
                        ctx.fillRect(element.x, element.y, element.width, element.height);
                        break;
                    case "circle":
                        ctx.beginPath();
                        ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
                        ctx.fillStyle = element.color;
                        ctx.fill();
                        break;
                    case "text":
                        ctx.fillStyle = element.color;
                        // Use fontSize and font for text rendering, fallback to defaults
                        const fontSize = element.fontSize || 12;
                        const fontFamily = element.font || element.fontFamily || "Helvetica";
                        let fontStyle = "";
                        if (element.bold) fontStyle += "bold ";
                        if (element.italic) fontStyle += "italic ";
                        ctx.font = `${fontStyle}${fontSize}px ${fontFamily}`;
                        // Adjust y position to account for font size (baseline)
                        const yPos = element.y + fontSize;
                        ctx.fillText(element.text, element.x, yPos);
                        // Underline if needed
                        if (element.underline) {
                            const textWidth = ctx.measureText(element.text).width;
                            const underlineY = yPos + 2;
                            ctx.beginPath();
                            ctx.moveTo(element.x, underlineY);
                            ctx.lineTo(element.x + textWidth, underlineY);
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = element.color;
                            ctx.stroke();
                        }
                        break;
                    case "image":
                        try {
                            let img;
                            if (element.imageUrl.startsWith("data:")) {
                                const base64Data = element.imageUrl.split(",")[1];
                                img = await loadImage(Buffer.from(base64Data, "base64"));
                            } else {
                                img = await loadImage(element.imageUrl);
                            }
                            const width = element.width || img.width;
                            const height = element.height || img.height;
                            ctx.drawImage(img, element.x, element.y, width, height);
                        } catch (error) {
                            console.error("Failed to load image for canvas drawing:", error);
                        }
                        break;
                }
            }

            // Create PDF document
            const doc = new PDFDocument({
                size: [canvasState.width, canvasState.height],
                margin: 0,
                compress: true,
            });

            const buffers = [];
            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => {
                resolve(Buffer.concat(buffers));
            });
            doc.on("error", (err) => {
                reject(err);
            });

            // Add canvas image to PDF
            const canvasBuffer = canvas.toBuffer("image/png");
            doc.image(canvasBuffer, 0, 0, { width: canvasState.width, height: canvasState.height });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
