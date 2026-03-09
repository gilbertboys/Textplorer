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
