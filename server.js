// server.js
const express = require("express");
const path = require("path");
const multer = require("multer");

const { parseLevelText } = require("./parser/levelParser");

const app = express();
const PORT = process.env.PORT || 3000;

// Multer setup: store uploads in memory (no disk files)
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

/**
 * POST /api/parse-level
 * Expects a multipart/form-data upload with field name: "level"
 * Returns parsed JSON describing the level.
 */
app.post("/api/parse-level", upload.single("level"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No file uploaded. Use field name 'level'." });
    }

    const text = req.file.buffer.toString("utf-8");

    // Optional: protect against huge uploads
    if (text.length > 200000) {
      return res.status(413).json({ error: "Level file too large." });
    }

    const parsed = parseLevelText(text);
    return res.json(parsed);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to parse level." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

