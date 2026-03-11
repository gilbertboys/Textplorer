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

    test('handles concurrent requests in a multi-user environment', async () => {
        const level = 'concurrent-test';
        const userCount = 10;

        // Simulate multiple users submitting scores simultaneously
        const submitPromises = [];
        for (let i = 0; i < userCount; i++) {
            submitPromises.push(
                post('/api/submit-score', {
                    level,
                    name: `ConcurrentUser${i}`,
                    time: 5.0 + (i * 0.1),
                    ghostPath: []
                })
            );
        }

        const submitResults = await Promise.all(submitPromises);

        // All submissions should succeed
        submitResults.forEach((res, i) => {
            expect(res.status).toBe(200);
        });

        // Simulate concurrent reads while verifying all scores are present
        const readPromises = [];
        for (let i = 0; i < 5; i++) {
            readPromises.push(get(`/api/get-scores?level=${level}`));
        }

        const readResults = await Promise.all(readPromises);

        // All reads should return consistent data
        readResults.forEach(res => {
            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(userCount);
        });

        // Verify all concurrent users are in the leaderboard
        const finalRes = await get(`/api/get-scores?level=${level}`);
        for (let i = 0; i < userCount; i++) {
            expect(finalRes.body.some(s => s.name === `ConcurrentUser${i}`)).toBe(true);
        }
    });
});