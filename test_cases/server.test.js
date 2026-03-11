const request = require('supertest');
const fs = require('fs');
const os = require('os');
const path = require('path');

let tmpDir;
let app;

beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'textplorer-test-'));
    process.env.DATA_DIR = tmpDir;
    app = require('../server');
});

afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.DATA_DIR;
});

describe('POST /api/parse-level - Jack Dunlap', () => {

    test('returns 400 when no file is attached', async () => {
        const res = await request(app).post('/api/parse-level');
        expect(res.status).toBe(400);
    });

    test('returns 400 when level is missing a spawn point', async () => {
        const res = await request(app)
            .post('/api/parse-level')
            .attach('level', Buffer.from('#'), 'bad.txt');
        expect(res.status).toBe(400);
    });

    test('returns 200 and correct spawn/finish for a valid level', async () => {
        const res = await request(app)
            .post('/api/parse-level')
            .attach('level', Buffer.from('$#'), 'good.txt');
        expect(res.status).toBe(200);
        expect(res.body.spawn).toEqual({ x: 0, y: 0 });
        expect(res.body.finish).toEqual({ x: 1, y: 0 });
    });
});