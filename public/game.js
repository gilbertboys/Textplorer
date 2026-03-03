let timerText;
let timerStart;
let timerRunning = false;
let currentLevelKey = null;


const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
    },
    scene: { key: 'default', preload, create, update }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let currentLevelData = null;
let walls;
let spikes;
let springs;
let finish;
let spawnPoint;
let monstersGroup;
let underscores;
let dropping = false;
let dropEndTime = 0;
let jumpTime = 0;
const maxJumpTime = 200; // milliseconds player can hold for higher jump

// Returns hitbox dimensions based on character shape
function getHitboxForSymbol(symbol, cellSize) {
    const hitboxes = {
        // Vertical lines - tall and narrow
        '|': { width: cellSize * 0.2, height: cellSize * 0.9 },
        // Horizontal lines - wide and short
        '-': { width: cellSize * 0.8, height: cellSize * 0.2 },
        '_': { width: cellSize * 0.9, height: cellSize * 0.15 },
        '=': { width: cellSize * 0.8, height: cellSize * 0.5 },
        // Square-ish characters
        '#': { width: cellSize * 0.85, height: cellSize * 0.85 },
        '@': { width: cellSize * 0.8, height: cellSize * 0.85 },
        'O': { width: cellSize * 0.75, height: cellSize * 0.85 },
        '0': { width: cellSize * 0.7, height: cellSize * 0.85 },
        // Brackets and parens - narrow
        '[': { width: cellSize * 0.4, height: cellSize * 0.85 },
        ']': { width: cellSize * 0.4, height: cellSize * 0.85 },
        '(': { width: cellSize * 0.45, height: cellSize * 0.85 },
        ')': { width: cellSize * 0.45, height: cellSize * 0.85 },
        '{': { width: cellSize * 0.45, height: cellSize * 0.85 },
        '}': { width: cellSize * 0.45, height: cellSize * 0.85 },
        // Pointed characters - spike-like
        '^': { width: cellSize * 0.7, height: cellSize * 0.6 },
        'v': { width: cellSize * 0.7, height: cellSize * 0.6 },
        'V': { width: cellSize * 0.8, height: cellSize * 0.7 },
        '<': { width: cellSize * 0.6, height: cellSize * 0.7 },
        '>': { width: cellSize * 0.6, height: cellSize * 0.7 },
        // Diagonal lines - smaller centered box
        '/': { width: cellSize * 0.3, height: cellSize * 0.8 },
        '\\': { width: cellSize * 0.3, height: cellSize * 0.8 },
        // Small punctuation
        '.': { width: cellSize * 0.2, height: cellSize * 0.2 },
        ',': { width: cellSize * 0.2, height: cellSize * 0.3 },
        ':': { width: cellSize * 0.2, height: cellSize * 0.5 },
        ';': { width: cellSize * 0.2, height: cellSize * 0.6 },
        "'": { width: cellSize * 0.15, height: cellSize * 0.3 },
        '"': { width: cellSize * 0.35, height: cellSize * 0.3 },
        '`': { width: cellSize * 0.2, height: cellSize * 0.25 },
        // Medium width characters
        '+': { width: cellSize * 0.6, height: cellSize * 0.6 },
        '*': { width: cellSize * 0.6, height: cellSize * 0.6 },
        'x': { width: cellSize * 0.65, height: cellSize * 0.6 },
        'X': { width: cellSize * 0.75, height: cellSize * 0.8 },
        '~': { width: cellSize * 0.8, height: cellSize * 0.3 },
        // Letters - approximate based on typical shapes
        'Z': { width: cellSize * 0.7, height: cellSize * 0.8 },
        'W': { width: cellSize * 0.9, height: cellSize * 0.8 },
        'M': { width: cellSize * 0.85, height: cellSize * 0.8 },
        'I': { width: cellSize * 0.3, height: cellSize * 0.8 },
        'l': { width: cellSize * 0.2, height: cellSize * 0.8 },
        'i': { width: cellSize * 0.2, height: cellSize * 0.75 },
        '!': { width: cellSize * 0.2, height: cellSize * 0.8 },
    };
    return hitboxes[symbol] || { width: cellSize * 0.8, height: cellSize * 0.8 };
}

function preload() {
    this.load.image('playerFigure', 'stickman.png')
}

function create(data) {
    // Clear all existing game objects
    this.children.removeAll();

    // Initialize groups for physics interactions
    walls = this.physics.add.staticGroup();
    underscores = this.physics.add.staticGroup();
    spikes = this.physics.add.group({ allowGravity: false, immovable: true });
    springs = this.physics.add.group({ allowGravity: false, immovable: true });
    monstersGroup = this.physics.add.group({ allowGravity: false });
    dropping = false;

    // If we have level data (passed via launch or global), render it
    const levelData = data?.levelData || currentLevelData;

    if (levelData) {
        renderLevel.call(this, levelData);
    } else {
        this.add.text(640, 100, 'TEXTPLORER: WASD to move', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        player = this.physics.add.sprite(640, 360, 'playerFigure');
        player.setScale(0.5);
        player.setCollideWorldBounds(true);

        const logo = this.add.rectangle(640, 360, 50, 50, 0x00ff00);
        this.physics.add.existing(logo);
        logo.body.setBounce(0.8).setCollideWorldBounds(true);
    }

    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // ESC to return to menu
    this.input.keyboard.on('keydown-ESC', returnToMenu);
}

function renderLevel(levelData) {
    const scene = game.scene.scenes[0];
    const cellSize = 40; // pixels per character

    // Calculate level dimensions based on all elements
    const allElements = [
        ...levelData.walls,
        ...levelData.spikes,
        ...levelData.springs,
        levelData.spawn,
        levelData.finish
    ];
    const maxX = Math.max(...allElements.map(e => e.x)) + 1;
    const maxY = Math.max(...allElements.map(e => e.y)) + 1;
    const levelWidth = Math.max(maxX * cellSize, config.width);
    const levelHeight = Math.max(maxY * cellSize, config.height);

    // Set world bounds to match level size
    scene.physics.world.setBounds(0, 0, levelWidth, levelHeight);

    // Find positions of rainbow name characters (drew, jacob, jack, norman)
    const rainbowPositions = new Set();
    const rainbowNames = ['drew', 'jacob', 'jack', 'norman'];
    levelData.grid.forEach((row, rowY) => {
        const lowerRow = row.toLowerCase();
        rainbowNames.forEach(name => {
            let idx = lowerRow.indexOf(name);
            while (idx !== -1) {
                for (let i = 0; i < name.length; i++) {
                    rainbowPositions.add(`${idx + i},${rowY}`);
                }
                idx = lowerRow.indexOf(name, idx + 1);
            }
        });
    });

    // Create walls - add to static group for proper collision
    const rainbowTexts = [];
    levelData.walls.forEach(wall => {
        const x = wall.x * cellSize + cellSize / 2;
        const y = wall.y * cellSize + cellSize / 2;
        const symbol = wall.symbol || '#';
        const isRainbow = rainbowPositions.has(`${wall.x},${wall.y}`);
        // Render the actual character as white text
        const wallText = scene.add.text(x, y, symbol, {
            fontSize: `${cellSize}px`,
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        scene.physics.add.existing(wallText, true); // true = static body
        const hitbox = getHitboxForSymbol(symbol, cellSize);
        wallText.body.setSize(hitbox.width, hitbox.height);
        walls.add(wallText);
        if (isRainbow) {
            rainbowTexts.push({ text: wallText, xOffset: wall.x });
        }
    });

    // Apply cycling rainbow glow to name characters
    if (rainbowTexts.length > 0) {
        scene.tweens.addCounter({
            from: 0,
            to: 360,
            duration: 1500,
            repeat: -1,
            onUpdate: function(tween) {
                const baseHue = tween.getValue();
                rainbowTexts.forEach(({ text, xOffset }) => {
                    const hue = ((baseHue + xOffset * 20) % 360) / 360;
                    const color = Phaser.Display.Color.HSLToColor(hue, 1, 0.5);
                    const hex = '#' + color.color.toString(16).padStart(6, '0');
                    text.setColor(hex);
                    text.setShadow(0, 0, hex, 10, true, true);
                });
            }
        });
    }

    // Create spikes
    levelData.spikes.forEach(spike => {
        const x = spike.x * cellSize + cellSize / 2;
        const y = spike.y * cellSize + cellSize / 2;
        const symbol = spike.symbol || '^';
        const spikeText = scene.add.text(x, y, symbol, {
            fontSize: `${cellSize}px`,
            fill: '#ff0000',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        scene.physics.add.existing(spikeText);
        spikeText.body.setAllowGravity(false);
        spikeText.body.setImmovable(true);
        const hitbox = getHitboxForSymbol(symbol, cellSize);
        spikeText.body.setSize(hitbox.width, hitbox.height);
        spikes.add(spikeText);
        spikeText.isDangerous = true;
    });

    // Create springs 
    levelData.springs.forEach(spring => {
        const x = spring.x * cellSize + cellSize / 2;
        const y = spring.y * cellSize + cellSize / 2;
        const symbol = spring.symbol || 'Z';
        const springText = scene.add.text(x, y, symbol, {
            fontSize: `${cellSize}px`,
            fill: '#ffff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        scene.physics.add.existing(springText);
        springText.body.setAllowGravity(false);
        springText.body.setImmovable(true);
        const hitbox = getHitboxForSymbol(symbol, cellSize);
        springText.body.setSize(hitbox.width, hitbox.height);
        springs.add(springText);
        springText.isSpring = true;
    });

    // Create monsters - patrol 2 cells left/right from spawn point
    levelData.monsters.forEach(monster => {
        const x = monster.x * cellSize + cellSize / 2;
        const y = monster.y * cellSize + cellSize / 2;
        const monsterText = scene.add.text(x, y, '%', {
            fontSize: `${cellSize}px`,
            fill: '#ff0000',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        scene.physics.add.existing(monsterText);
        monsterText.body.setAllowGravity(false);
        monsterText.body.setImmovable(false);
        const hitbox = getHitboxForSymbol('%', cellSize);
        monsterText.body.setSize(hitbox.width, hitbox.height);
        monsterText.patrolLeft = x;
        monsterText.patrolRight = x + 2 * cellSize;
        monsterText.body.setVelocityX(100);
        monstersGroup.add(monsterText);
        scene.tweens.addCounter({
            from: 0,
            to: 5,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: function(tween) {
                monsterText.setShadow(0, 0, '#ff0000', tween.getValue(), true, true);
            }
        });
        scene.tweens.add({
            targets: monsterText,
            alpha: { from: 0.75, to: 1 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    });

    // Create finish point - disable gravity, make immovable
    const finishX = levelData.finish.x * cellSize + cellSize / 2;
    const finishY = levelData.finish.y * cellSize + cellSize / 2;
    const finishSymbol = levelData.finish.symbol || '#';
    finish = scene.add.text(finishX, finishY, finishSymbol, {
        fontSize: `${cellSize}px`,
        fill: '#00ff00',
        fontFamily: 'monospace'
    }).setOrigin(0.5);
    scene.physics.add.existing(finish);
    finish.body.setAllowGravity(false);
    finish.body.setImmovable(true);
    const finishHitbox = getHitboxForSymbol(finishSymbol, cellSize);
    finish.body.setSize(finishHitbox.width, finishHitbox.height);
    finish.isFinish = true;

    // Create player at spawn
    spawnPoint = { x: levelData.spawn.x * cellSize + cellSize / 2, y: levelData.spawn.y * cellSize + cellSize / 2 };

    // Check if texture exists, if not create placeholder
    if (scene.textures.exists('playerFigure')) {
        player = scene.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'playerFigure');
        player.setScale(0.5);
    } else {
        // Fallback if image doesn't load - create a cyan rectangle
        player = scene.add.rectangle(spawnPoint.x, spawnPoint.y, 30, 40, 0x00ffff);
        scene.physics.add.existing(player);
    }

    player.setCollideWorldBounds(true);
    player.setBodySize(30, 40);

    // Set up camera to follow player
    scene.cameras.main.setBounds(0, 0, levelWidth, levelHeight);
    scene.cameras.main.startFollow(player, true, 0.1, 0.1);

    // Set up collisions
    scene.physics.add.collider(player, walls);
    scene.physics.add.collider(player, underscores, null, function(player, _platform) {
        if (dropping) return false;
        return player.body.velocity.y >= 0;
    }, scene);
    scene.physics.add.collider(spikes, walls);
    scene.physics.add.collider(springs, walls);
    scene.physics.add.overlap(player, spikes, handleSpikeCollision);
    scene.physics.add.overlap(player, springs, handleSpringCollision);
    scene.physics.add.overlap(player, finish, handleFinishCollision);
    scene.physics.add.overlap(player, monstersGroup, handleMonsterCollision);

    // Store reference to level data for restart functionality
    player.spawnPoint = spawnPoint;

    // Start timer
    timerStart = Date.now();
    timerRunning = true;

    // Display timer in top-left corner
    timerText = scene.add.text(16, 16, '0.000s', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(999);
}

function handleSpikeCollision(player, spike) {
    // Reset player to spawn point
    player.x = player.spawnPoint.x;
    player.y = player.spawnPoint.y;
    player.setVelocity(0, 0);
}

function handleMonsterCollision(player, monster) {
    player.x = player.spawnPoint.x;
    player.y = player.spawnPoint.y;
    player.setVelocity(0, 0);
}

function handleSpringCollision(player, spring) {
    // Boost player upward
    player.setVelocityY(-500);
}

function handleFinishCollision(player, finish) {
    timerRunning = false;
    const finalTime = ((Date.now() - timerStart) / 1000).toFixed(3);

    const scene = game.scene.scenes[0];
    scene.physics.pause();

    // Dim overlay
    const overlay = scene.add.rectangle(
        game.scale.width / 2, game.scale.height / 2,
        game.scale.width, game.scale.height,
        0x000000, 0.7
    ).setScrollFactor(0).setDepth(1000);

    // Level complete text
    scene.add.text(game.scale.width / 2, game.scale.height / 2 - 160, 'LEVEL COMPLETE!', {
        fontSize: '48px', fill: '#00ff00', fontFamily: 'monospace'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Their time
    scene.add.text(game.scale.width / 2, game.scale.height / 2 - 100, 'Your time: ' + finalTime + 's', {
        fontSize: '28px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Top 3 leaderboard
    const levelKey = currentLevelKey || 'unknown';
    fetch('/api/get-scores?level=' + levelKey)
        .then(r => r.json())
        .then(scores => {
            scene.add.text(game.scale.width / 2, game.scale.height / 2 - 50, 'TOP TIMES', {
                fontSize: '20px', fill: '#ffc75f', fontFamily: 'monospace'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

            const top3 = scores.slice(0, 3);
            top3.forEach((s, i) => {
                scene.add.text(game.scale.width / 2, game.scale.height / 2 - 20 + (i * 30),
                    (i + 1) + '.  ' + s.name + '  ' + s.time.toFixed(3) + 's', {
                    fontSize: '18px', fill: '#ffffff', fontFamily: 'monospace'
                }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
            });
        });

    // Name input and submit using DOM
    const submitDiv = document.createElement('div');
    submitDiv.id = 'score-submit';
    submitDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, 40px);
        display: flex;
        gap: 10px;
        align-items: center;
        z-index: 9999;
        font-family: 'Courier New', monospace;
    `;
    submitDiv.innerHTML = `
        <input id="playerName" maxlength="20" placeholder="Enter name..."
            style="background:#111; color:#fff; border:1px solid #9cb4f1;
                   padding:8px 12px; font-family:'Courier New',monospace;
                   font-size:16px; width:180px;" />
        <button id="submitScoreBtn"
            style="background:none; color:#975439; border:1px solid #9cb4f1;
                   padding:8px 16px; font-family:'Courier New',monospace;
                   font-size:16px; cursor:pointer;">
            Submit
        </button>
    `;
    document.body.appendChild(submitDiv);

    document.getElementById('submitScoreBtn').addEventListener('click', async () => {
        const name = document.getElementById('playerName').value.trim();
        if (!name) return;
        await fetch('/api/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: levelKey, name, time: parseFloat(finalTime) })
        });
        submitDiv.remove();
    });

    // Esc to menu
    scene.add.text(game.scale.width / 2, game.scale.height / 2 + 140, 'Press Esc to return to menu', {
        fontSize: '20px', fill: '#666', fontFamily: 'monospace'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
}

function returnToMenu() {
    // Hide game, show menu
    const gameContainer = document.getElementById('game-container');
    const mainHeader = document.querySelector('header.main');

    if (gameContainer) gameContainer.style.display = 'none';
    if (mainHeader) {
        mainHeader.style.display = 'flex';
        mainHeader.style.flexDirection = 'column';
        mainHeader.style.justifyContent = 'center';
        mainHeader.style.alignItems = 'center';
    }
    document.body.style.overflow = 'hidden';

    const submitDiv = document.getElementById('score-submit');
    if (submitDiv) submitDiv.remove();
    // Restart the scene to clean up
    game.scene.stop();
    game.scene.start();
}

function update() {
    if (!player) return;

    const speed = 200;

    if (cursors.left.isDown) {
        player.body.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
        player.body.setVelocityX(speed);
    } else {
        player.body.setVelocityX(0);
    }

    // Variable jump height - hold W longer for higher jumps
    if (player.body.blocked.down) {
        jumpTime = 0;
    }

    if (cursors.up.isDown) {
        if (player.body.blocked.down) {
            // Start jump
            player.body.setVelocityY(-200);
            jumpTime = 1;
        } else if (jumpTime > 0 && jumpTime < maxJumpTime) {
            // Continue adding upward velocity while holding W
            player.body.setVelocityY(-200);
            jumpTime += 16; // approximate frame time
        }
    } else {
        // Key released, stop adding jump force
        if (jumpTime > 0) {
            jumpTime = maxJumpTime; // prevent further boosting
        }
    }

    if (cursors.down.isDown && !dropping && player.body.blocked.down) {
        dropping = true;
        dropEndTime = Date.now() + 200;
    }
    if (dropping && Date.now() > dropEndTime) {
        dropping = false;
    }

    if (monstersGroup) {
        monstersGroup.getChildren().forEach(monster => {
            if (monster.x >= monster.patrolRight) {
                monster.body.setVelocityX(-100);
            } else if (monster.x <= monster.patrolLeft) {
                monster.body.setVelocityX(100);
            }
        });
    }

    if (timerRunning && timerText) {
        const elapsed = ((Date.now() - timerStart) / 1000).toFixed(3);
        timerText.setText(elapsed + 's');
    }
}