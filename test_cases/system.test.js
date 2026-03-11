const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

let server;
let port;
let tmpDir;

beforeAll((done) => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'textplorer-sys-'));
    process.env.DATA_DIR = tmpDir;
    jest.resetModules();
    const app = require('../server');
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
        port = server.address().port;
        done();
    });
});

afterAll((done) => {
    server.close(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        delete process.env.DATA_DIR;
        done();
    });
});

function post(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req = http.request({
            hostname: '127.0.0.1', port, path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        }, (res) => {
            let raw = '';
            res.on('data', c => { raw += c; });
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function get(path) {
    return new Promise((resolve, reject) => {
        http.get({ hostname: '127.0.0.1', port, path }, (res) => {
            let raw = '';
            res.on('data', c => { raw += c; });
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
        }).on('error', reject);
    });
}

describe('System tests', () => {

    test('GET /api/get-scores returns 200 and empty array on fresh server', async () => {
        const res = await get('/api/get-scores?level=sys-test');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test('POST /api/submit-score with missing fields returns 400', async () => {
        const res = await post('/api/submit-score', { level: 'sys-test' });
        expect(res.status).toBe(400);
    });

    test('submit a score then retrieve it from the leaderboard', async () => {
        await post('/api/submit-score', { level: 'sys-test', name: 'SystemTester', time: 4.2, ghostPath: [] });
        const res = await get('/api/get-scores?level=sys-test');
        expect(res.body.some(s => s.name === 'SystemTester')).toBe(true);
    });
});