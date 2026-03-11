const { parseLevelText } = require('../parser/levelParser');

describe('Textplorer Parser - Jack Dunlap', () => {

    test('Should correctly parse a valid minimal level', () => {
        const levelData = "$\n#";
        const result = parseLevelText(levelData);

        expect(result.spawn).toEqual({ x: 0, y: 0 });
        expect(result.finish).toEqual({ x: 0, y: 1 });
        expect(result.height).toBe(2);
    });

    test('Should identify walls and hazards', () => {
        const levelData = "$^#\n***";
        const result = parseLevelText(levelData);

        expect(result.spikes).toContainEqual({ x: 1, y: 0 });
        
        expect(result.walls.length).toBe(3);
        expect(result.walls[0].symbol).toBe('*');
    });

    test('Should throw error for missing spawn point', () => {
      const levelData = "#"; 
      expect(() => parseLevelText(levelData)).toThrow("Level must contain a spawn point '$'.");
    });

    test('Should handle a full-sized uploaded level string', () => {
        const uploadedFileContent = 
`**********
*$       *
* ^      *
* *      *
*********#`;
    
        const result = parseLevelText(uploadedFileContent);
    
        expect(result.width).toBe(10);
        expect(result.height).toBe(5);
        
        expect(result.spawn).toEqual({ x: 1, y: 1 });
        expect(result.finish).toEqual({ x: 9, y: 4 });
    });
});
describe("Textplorer Parser - Norman Nomie", () => {

    test('Should throw error if multiple spawn points exist', () => {
        const levelData =
`**********
*$      $*
*        *
*        *
*********#`;

        expect(() => parseLevelText(levelData)).toThrow();
    });

    test('Should throw error if multiple goal tiles exist', () => {
        const levelData =
`**********
*$       *
*        #
*        *
*********#`;

        expect(() => parseLevelText(levelData)).toThrow();
    });
    test('Should throw error for missing goal tile', () => {
	const levelData =
`**********
*$       *
*        *
**********`;

	expect(() => parseLevelText(levelData)).toThrow();
    });
    test('Should throw error for empty level input', () => {
	const levelData = "";

	expect(() => parseLevelText(levelData)).toThrow();
    });
});

function getHitboxForSymbol(symbol, cellSize) {
    const hitboxes = {
        '|': { width: cellSize * 0.2,  height: cellSize * 0.9 },
        '-': { width: cellSize * 0.8,  height: cellSize * 0.2 },
        '_': { width: cellSize * 0.8,  height: cellSize * 0.05, offsetY: cellSize * 0.7 },
        '#': { width: cellSize * 0.85, height: cellSize * 0.85 },
        '^': { width: cellSize * 0.7,  height: cellSize * 0.6 },
        'Z': { width: cellSize * 0.7,  height: cellSize * 0.8 },
        '.': { width: cellSize * 0.2,  height: cellSize * 0.2 },
        '[': { width: cellSize * 0.4,  height: cellSize * 0.85 },
        'W': { width: cellSize * 0.9,  height: cellSize * 0.8 },
        'I': { width: cellSize * 0.3,  height: cellSize * 0.8 },
    };
    return hitboxes[symbol] || { width: cellSize * 0.8, height: cellSize * 0.8 };
}

describe('getHitboxForSymbol - Jacob Munly', () => {

    test('Pipe | should be tall and narrow', () => {
        const hb = getHitboxForSymbol('|', 40);
        expect(hb.width).toBeLessThan(hb.height);
        expect(hb.width).toBe(8);   // 40 * 0.2
        expect(hb.height).toBe(36); // 40 * 0.9
    });

    test('Dash - should be wide and short', () => {
        const hb = getHitboxForSymbol('-', 40);
        expect(hb.width).toBeGreaterThan(hb.height);
        expect(hb.width).toBe(32);  // 40 * 0.8
        expect(hb.height).toBe(8);  // 40 * 0.2
    });

    test('Underscore _ should have a vertical offset', () => {
        const hb = getHitboxForSymbol('_', 40);
        expect(hb.offsetY).toBeDefined();
        expect(hb.offsetY).toBeGreaterThan(0);
    });

    test('Unknown symbol should return default hitbox', () => {
        const hb = getHitboxForSymbol('?', 40);
        expect(hb.width).toBe(40 * 0.8);
        expect(hb.height).toBe(40 * 0.8);
    });

    test('Spike ^ should have non-zero dimensions', () => {
        const hb = getHitboxForSymbol('^', 40);
        expect(hb.width).toBeGreaterThan(0);
        expect(hb.height).toBeGreaterThan(0);
    });

    test('Wide character W should be wider than narrow character I', () => {
        const wHb = getHitboxForSymbol('W', 40);
        const iHb = getHitboxForSymbol('I', 40);
        expect(wHb.width).toBeGreaterThan(iHb.width);
    });

    test('Hitbox dimensions should scale proportionally with cellSize', () => {
        const hb20 = getHitboxForSymbol('#', 20);
        const hb40 = getHitboxForSymbol('#', 40);
        expect(hb40.width).toBe(hb20.width * 2);
        expect(hb40.height).toBe(hb20.height * 2);
    });

    test('Small punctuation . should be smaller than block character #', () => {
        const dotHb  = getHitboxForSymbol('.', 40);
        const hashHb = getHitboxForSymbol('#', 40);
        expect(dotHb.width).toBeLessThan(hashHb.width);
        expect(dotHb.height).toBeLessThan(hashHb.height);
    });
});