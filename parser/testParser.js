// parser/testParser.js
const fs = require("fs");
const path = require("path");
const { parseLevelText } = require("./levelParser");

// Usage:
//   node parser/testParser.js public/test-level.txt
const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: node parser/testParser.js path/to/level.txt");
  process.exit(1);
}

const absPath = path.resolve(filePath);

try {
  const text = fs.readFileSync(absPath, "utf-8");
  const parsed = parseLevelText(text);
  console.log("Parsed OK ✅");
  console.log(JSON.stringify(parsed, null, 2));
} catch (err) {
  console.error("Parse FAILED ❌:", err.message);
  process.exit(1);
}

