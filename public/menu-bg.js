(function () {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&*()[]{}|;:<>?/~`';
    const FONT_SIZE = 20;
    const NAME_FONT_SIZE = Math.round(FONT_SIZE * 2 / 3); // ~13px
    const NUM_LETTERS = 70;
    const NAMES = ['drew', 'norman', 'jack', 'jacob'];
    const NAME_INTERVAL = 30; // seconds between name drops

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function hslToRgb(h, s, l) {
        h /= 360;
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const f = (t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        return [Math.round(f(h + 1/3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1/3) * 255)];
    }

    function newLetter(stagger) {
        return {
            x: Math.random() * window.innerWidth,
            y: stagger ? -Math.random() * window.innerHeight : -FONT_SIZE,
            speed: 40 + Math.random() * 60,
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            hue: Math.random() * 360,
            hueSpeed: 60 + Math.random() * 180
        };
    }

    function newNameDrop() {
        return {
            name: NAMES[Math.floor(Math.random() * NAMES.length)],
            x: Math.random() * window.innerWidth,
            y: -NAME_FONT_SIZE,
            speed: 40 + Math.random() * 60,
            hue: Math.random() * 360,
            hueSpeed: 60 + Math.random() * 180
        };
    }

    // Restore saved state from previous page, fast-forwarding positions by elapsed time
    let letters, nameDrops, nameTotalElapsed, nextNameAt;
    try {
        const saved = sessionStorage.getItem('menuBgState');
        if (saved) {
            const state = JSON.parse(saved);
            sessionStorage.removeItem('menuBgState');
            const elapsed = Math.min((Date.now() - state.savedAt) / 1000, 2);

            state.letters.forEach(letter => {
                letter.y += letter.speed * elapsed;
                letter.hue = (letter.hue + letter.hueSpeed * elapsed) % 360;
                if (letter.y > window.innerHeight + FONT_SIZE) {
                    Object.assign(letter, newLetter(false));
                }
            });
            letters = state.letters;

            (state.nameDrops || []).forEach(drop => {
                drop.y += drop.speed * elapsed;
                drop.hue = (drop.hue + drop.hueSpeed * elapsed) % 360;
            });
            nameDrops = (state.nameDrops || []).filter(drop => drop.y <= window.innerHeight + NAME_FONT_SIZE);

            nameTotalElapsed = (state.nameTotalElapsed || 0) + elapsed;
            nextNameAt = state.nextNameAt || NAME_INTERVAL;
            // Skip any missed spawns during navigation
            if (nameTotalElapsed >= nextNameAt) {
                nextNameAt = Math.ceil(nameTotalElapsed / NAME_INTERVAL) * NAME_INTERVAL;
            }
        }
    } catch (e) {}

    if (!letters || letters.length !== NUM_LETTERS) {
        letters = Array.from({ length: NUM_LETTERS }, () => newLetter(true));
    }
    if (!nameDrops) nameDrops = [];
    if (nameTotalElapsed === undefined) nameTotalElapsed = 0;
    if (nextNameAt === undefined) nextNameAt = NAME_INTERVAL;

    let lastTime = performance.now();

    // Save state before navigating to another page
    window.addEventListener('beforeunload', () => {
        try {
            sessionStorage.setItem('menuBgState', JSON.stringify({
                letters, nameDrops, nameTotalElapsed, nextNameAt,
                savedAt: Date.now()
            }));
        } catch (e) {}
    });

    function animate(timestamp) {
        const gameContainer = document.getElementById('game-container');
        if (gameContainer && gameContainer.style.display !== 'none') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            lastTime = timestamp;
            requestAnimationFrame(animate);
            return;
        }

        const delta = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;

        // Spawn a name drop every NAME_INTERVAL seconds
        nameTotalElapsed += delta;
        if (nameTotalElapsed >= nextNameAt) {
            nextNameAt += NAME_INTERVAL;
            nameDrops.push(newNameDrop());
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw regular letters
        ctx.font = `${FONT_SIZE}px monospace`;
        ctx.textAlign = 'center';
        letters.forEach(letter => {
            letter.y += letter.speed * delta;
            letter.hue = (letter.hue + letter.hueSpeed * delta) % 360;

            if (letter.y > canvas.height + FONT_SIZE) {
                Object.assign(letter, newLetter(false));
            }

            const progress = Math.max(0, letter.y / canvas.height);
            const opacity = Math.max(0, 1 - Math.pow(progress, 2.5));
            if (opacity < 0.01) return;

            const [r, g, b] = hslToRgb(letter.hue, 1, 0.5);
            const color = `rgb(${r},${g},${b})`;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = color;
            ctx.fillText(letter.char, letter.x, letter.y);
            ctx.restore();
        });

        // Draw name drops — each letter gets its own rainbow hue offset
        ctx.font = `${NAME_FONT_SIZE}px monospace`;
        const charWidth = NAME_FONT_SIZE * 0.6;
        nameDrops = nameDrops.filter(drop => {
            drop.y += drop.speed * delta;
            drop.hue = (drop.hue + drop.hueSpeed * delta) % 360;

            if (drop.y > canvas.height + NAME_FONT_SIZE) return false;

            const progress = Math.max(0, drop.y / canvas.height);
            const opacity = Math.max(0, 1 - Math.pow(progress, 2.5));
            if (opacity < 0.01) return true;

            const startX = drop.x - (drop.name.length * charWidth) / 2;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.textAlign = 'left';
            for (let i = 0; i < drop.name.length; i++) {
                const charHue = (drop.hue + i * 30) % 360;
                const [r, g, b] = hslToRgb(charHue, 1, 0.5);
                const color = `rgb(${r},${g},${b})`;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.fillStyle = color;
                ctx.fillText(drop.name[i], startX + i * charWidth, drop.y);
            }
            ctx.restore();

            return true;
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();
