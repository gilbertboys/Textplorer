// server.js
const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const { parseLevelText } = require("./parser/levelParser");

const app = express();
const PORT = process.env.PORT || 3000;

// Multer setup: store uploads in memory (no disk files)
const upload = multer({ storage: multer.memoryStorage() });

// Path for storing user-uploaded levels
const userLevelsPath = path.join(__dirname, "user-levels.json");

// Helper to load user levels from JSON file
function loadUserLevels() {
  if (!fs.existsSync(userLevelsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(userLevelsPath, "utf-8"));
  } catch (err) {
    return {};
  }
}

// Helper to save user levels to JSON file
function saveUserLevels(levels) {
  fs.writeFileSync(userLevelsPath, JSON.stringify(levels, null, 2));
}

// Helper to get level key from filename
function getLevelKeyFromFilename(filename) {
  // Remove .txt extension and sanitize
  let baseName = filename.replace(/\.txt$/i, "").trim();
  if (!baseName) baseName = "level";
  return baseName;
}

// Helper to clear scores for a specific level
function clearScoresForLevel(levelKey) {
  const scoresPath = path.join(__dirname, "scores.json");
  if (!fs.existsSync(scoresPath)) return;
  try {
    let scores = JSON.parse(fs.readFileSync(scoresPath, "utf-8"));
    scores = scores.filter(s => s.level !== levelKey);
    fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
  } catch (err) {
    // Ignore errors when clearing scores
  }
}

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

/**
 * POST /api/parse-level
 * Expects a multipart/form-data upload with field name: "level"
 * Returns parsed JSON describing the level.
 * Optionally stores the level if 'save' query param is true.
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
    
    // If save=true, store the level persistently
    if (req.query.save === "true") {
      const userLevels = loadUserLevels();
      const originalFilename = req.file.originalname || "level.txt";
      const levelKey = getLevelKeyFromFilename(originalFilename);
      
      // If level already exists, clear its leaderboard
      if (userLevels[levelKey]) {
        clearScoresForLevel(levelKey);
      }
      
      userLevels[levelKey] = {
        name: levelKey,
        originalFilename: originalFilename,
        levelData: parsed,
        uploadedAt: new Date().toISOString()
      };
      
      saveUserLevels(userLevels);
      
      return res.json({ ...parsed, levelKey: levelKey });
    }
    
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

/**
 * GET /api/search-user-levels?q=searchterm
 * Searches for user-uploaded levels by filename
 */
app.get("/api/search-user-levels", (req, res) => {
  try {
    const query = (req.query.q || "").toLowerCase().trim();
    const userLevels = loadUserLevels();
    
    let results = Object.values(userLevels);
    
    // If query is provided, filter by name
    if (query) {
      results = results.filter(level => 
        level.name.toLowerCase().includes(query) ||
        level.originalFilename.toLowerCase().includes(query)
      );
    }
    
    // Sort by upload date (newest first)
    results.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    // Return without full level data (just metadata)
    const simplified = results.map(level => ({
      key: level.name,
      name: level.name,
      originalFilename: level.originalFilename,
      uploadedAt: level.uploadedAt
    }));
    
    return res.json(simplified);
  } catch (err) {
    return res.status(500).json({ error: "Failed to search levels." });
  }
});

/**
 * GET /api/get-user-level?key=levelkey
 * Gets a specific user-uploaded level by its key
 */
app.get("/api/get-user-level", (req, res) => {
  try {
    const key = req.query.key;
    if (!key) {
      return res.status(400).json({ error: "Level key required." });
    }
    
    const userLevels = loadUserLevels();
    const level = userLevels[key];
    
    if (!level) {
      return res.status(404).json({ error: "Level not found." });
    }
    
    return res.json(level.levelData);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load level." });
  }
});

// GET /api/get-scores?level=easy
app.get("/api/get-scores", (req, res) => {
  try {
    const scoresPath = path.join(__dirname, "scores.json");
    if (!fs.existsSync(scoresPath)) return res.json([]);
    const scores = JSON.parse(fs.readFileSync(scoresPath, "utf-8"));
    const level = req.query.level;
    const filtered = scores
      .filter(s => s.level === level)
      .sort((a, b) => a.time - b.time)
      .slice(0, 10);
    return res.json(filtered);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get scores." });
  }
});

// POST /api/submit-score
app.use(express.json());
app.post("/api/submit-score", (req, res) => {
  try {
    const { level, name, time } = req.body;
    if (!level || !name || !time) return res.status(400).json({ error: "Missing fields." });
    const scoresPath = path.join(__dirname, "scores.json");
    let scores = [];
    if (fs.existsSync(scoresPath)) {
      scores = JSON.parse(fs.readFileSync(scoresPath, "utf-8"));
    }
    scores.push({ level, name: name.slice(0, 20), time: parseFloat(time) });
    fs.writeFileSync(scoresPath, JSON.stringify(scores, null, 2));
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save score." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

