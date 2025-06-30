import express from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Serve exports directory as static files
app.use("/exports", express.static(join(__dirname, "exports")));

// Ensure exports directory exists on startup
const exportsDir = join(__dirname, "exports");
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
