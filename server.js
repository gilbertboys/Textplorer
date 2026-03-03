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

/**
 * GET /api/load-sample-level
 * Returns parsed JSON for the sample level (test-level.txt)
 */
app.get("/api/load-sample-level", (req, res) => {
  try {
    const fs = require("fs");

    const levelMap = {
      easy:       "easy.txt",
      medium:     "medium.txt",
      hard:       "hard.txt",
      veryhard:   "veryhard.txt",
      impossible: "impossible.txt"
    };

    const levelKey = req.query.level || "easy";
    const filename = levelMap[levelKey] || "easy.txt";
    const sampleLevelPath = path.join(__dirname, "public", "levels", filename);

    const text = fs.readFileSync(sampleLevelPath, "utf-8");
    const parsed = parseLevelText(text);
    return res.json(parsed);
  } catch (err) {
    return res.status(400).json({ error: err.message || "Failed to load sample level." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

