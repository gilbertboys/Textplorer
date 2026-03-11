const request = require('supertest');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseLevelText } = require('../parser/levelParser');

let tmpDir;
let app;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'textplorer-int-'));
  process.env.DATA_DIR = tmpDir;
  jest.resetModules();
  app = require('../server');
});

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
});

const LEVEL_TEXT =
`**********
*$       *
* ^   Z  *
*        *
*********#`;

describe('Parser and server work together', () => {

    test('parseLevelText returns the expected spawn and finish', () => {
        const result = parseLevelText(LEVEL_TEXT);
        expect(result.spawn).toEqual({ x: 1, y: 1 });
        expect(result.finish).toEqual({ x: 9, y: 4 });
    });

    test('uploading the level via API returns the same spawn and finish', async () => {
      const res = await request(app)
          .post('/api/parse-level?save=true')
          .attach('level', Buffer.from(LEVEL_TEXT), 'inttest.txt');
      expect(res.status).toBe(200);
  });

    test('retrieved level matches what the parser returned directly', async () => {
        const direct = parseLevelText(LEVEL_TEXT);
        const res = await request(app).get('/api/get-user-level?key=inttest');
        expect(res.status).toBe(200);
        expect(res.body.spawn).toEqual(direct.spawn);
        expect(res.body.finish).toEqual(direct.finish);
        expect(res.body.walls.length).toBe(direct.walls.length);
        expect(res.body.spikes.length).toBe(direct.spikes.length);
    });

    test('score submitted for uploaded level appears in leaderboard', async () => {
        await request(app)
            .post('/api/submit-score')
            .send({ level: 'inttest', name: 'Drew', time: 7.5, ghostPath: [] });

        const res = await request(app).get('/api/get-scores?level=inttest');
        expect(res.body.some(s => s.name === 'Drew')).toBe(true);
    });
});

describe('Full workflow: parser, storage, scores, ghosts, and search', () => {

    const COMPLEX_LEVEL =
`**********
*$       *
* ^  %   *
*   Z    *
*      ^ *
*********#`;

    test('parser correctly identifies all game elements', () => {
        const result = parseLevelText(COMPLEX_LEVEL);

        expect(result.spawn).toEqual({ x: 1, y: 1 });
        expect(result.finish).toEqual({ x: 9, y: 5 });
        expect(result.spikes).toHaveLength(2);
        expect(result.springs).toHaveLength(1);
        expect(result.monsters).toHaveLength(1);
        expect(result.width).toBe(10);
        expect(result.height).toBe(6);
    });

    test('upload level, submit best score with ghost, then retrieve ghost data', async () => {
        // Step 1: Upload the level via API (invokes parser + storage)
        const uploadRes = await request(app)
            .post('/api/parse-level?save=true')
            .attach('level', Buffer.from(COMPLEX_LEVEL), 'workflow-test.txt');

        expect(uploadRes.status).toBe(200);
        expect(uploadRes.body.levelKey).toBe('workflow-test');

        // Step 2: Verify the level can be searched (invokes search component)
        const searchRes = await request(app).get('/api/search-user-levels?q=workflow');
        expect(searchRes.status).toBe(200);
        expect(searchRes.body.some(l => l.key === 'workflow-test')).toBe(true);

        // Step 3: Retrieve the level and verify it matches parser output (invokes storage)
        const levelRes = await request(app).get('/api/get-user-level?key=workflow-test');
        expect(levelRes.status).toBe(200);
        expect(levelRes.body.spawn).toEqual({ x: 1, y: 1 });
        expect(levelRes.body.monsters).toHaveLength(1);

        // Step 4: Submit a score with ghost path (invokes score + ghost components)
        const ghostPath = [
            { x: 1, y: 1, t: 0 },
            { x: 5, y: 3, t: 1.5 },
            { x: 9, y: 5, t: 3.2 }
        ];

        const scoreRes = await request(app)
            .post('/api/submit-score')
            .send({ level: 'workflow-test', name: 'GhostRunner', time: 3.2, ghostPath });

        expect(scoreRes.status).toBe(200);

        // Step 5: Verify score appears in leaderboard (invokes leaderboard component)
        const leaderboardRes = await request(app).get('/api/get-scores?level=workflow-test');
        expect(leaderboardRes.status).toBe(200);
        expect(leaderboardRes.body[0].name).toBe('GhostRunner');
        expect(leaderboardRes.body[0].time).toBe(3.2);

        // Step 6: Verify ghost was saved for the best time (invokes ghost component)
        const ghostRes = await request(app).get('/api/get-ghost?level=workflow-test');
        expect(ghostRes.status).toBe(200);
        expect(ghostRes.body.name).toBe('GhostRunner');
        expect(ghostRes.body.path).toHaveLength(3);

        // Step 7: Submit a slower score and verify ghost is NOT replaced
        await request(app)
            .post('/api/submit-score')
            .send({ level: 'workflow-test', name: 'SlowPlayer', time: 10.0, ghostPath: [{ x: 0, y: 0, t: 0 }] });

        const ghostRes2 = await request(app).get('/api/get-ghost?level=workflow-test');
        expect(ghostRes2.body.name).toBe('GhostRunner'); // Still the original ghost
    });
});