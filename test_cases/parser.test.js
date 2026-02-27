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
});