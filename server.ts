import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API route to list music files
  app.get("/api/music", (req, res) => {
    const musicDir = path.join(process.cwd(), "public", "music");
    
    if (!fs.existsSync(musicDir)) {
      fs.mkdirSync(musicDir, { recursive: true });
    }

    try {
      const files = fs.readdirSync(musicDir);
      const musicFiles = files
        .filter(file => file.endsWith(".mp3"))
        .map(file => ({
          name: file.replace(".mp3", ""),
          url: `/music/${file}`,
          filename: file
        }));
      res.json(musicFiles);
    } catch (error) {
      console.error("Error reading music directory:", error);
      res.status(500).json({ error: "Failed to read music directory" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
