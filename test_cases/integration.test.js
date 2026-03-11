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