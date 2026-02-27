// parser/levelParser.js
/**
 * Parse a text-based level into structured data.
 *
 * Symbol rules:
 *  ^ = spike (hazard)
 *  $ = spawn
 *  # = finish
 *  Z = spring
 *  ' ' (space) = empty
 *  everything else = wall
 *
 * Output uses x,y coordinates where:
 *  x increases to the right
 *  y increases downward
 */
function parseLevelText(levelText) {
  if (typeof levelText !== "string") {
    throw new Error("Level text must be a string.");
  }

  // Normalize Windows newlines to Unix newlines
  const rawLines = levelText.replace(/\r\n/g, "\n").split("\n");

  // Remove ALL trailing empty lines (common if file ends with multiple newlines)
  while (rawLines.length > 0 && rawLines[rawLines.length - 1] === "") {
    rawLines.pop();
  }

  const lines = rawLines;

  if (lines.length === 0) {
    throw new Error("Level file is empty.");
  }

  const height = lines.length;
  const width = Math.max(...lines.map((l) => l.length));

  // Pad each line so the grid is rectangular (preserves character layout)
  const grid = lines.map((line) => line.padEnd(width, " "));

  let spawn = null;
  let finish = null;

  const spikes = [];
  const springs = [];
  const walls = [];
  const monsters = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = grid[y][x];

      if (ch === " ") continue;

      if (ch === "^") {
        spikes.push({ x, y });
        continue;
      }

      if (ch === "Z") {
        springs.push({ x, y });
        continue;
      }

      if (ch === "M") {
        monsters.push({ x, y });
        continue;
      }

      if (ch === "$") {
        if (spawn) throw new Error("Level must contain only ONE spawn point '$'.");
        spawn = { x, y };
        continue;
      }

      if (ch === "#") {
        if (finish) throw new Error("Level must contain only ONE finish point '#'.");
        finish = { x, y };
        continue;
      }

      // All other non-space characters are walls
      walls.push({ x, y, symbol: ch });
    }
  }

  if (!spawn) throw new Error("Level must contain a spawn point '$'.");
  if (!finish) throw new Error("Level must contain a finish point '#'.");

  return {
    width,
    height,
    spawn,
    finish,
    spikes,
    springs,
    walls,
    monsters,
    grid, // helpful for debugging + later rendering
  };
}

module.exports = { parseLevelText };

