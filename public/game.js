const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
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

function preload() {
    this.load.image('playerFigure', 'stickman.png')
}

function create(data) {
    // Clear all existing game objects
    this.children.removeAll();

    // Initialize groups for physics interactions
    walls = this.physics.add.staticGroup();
    spikes = this.physics.add.group();
    springs = this.physics.add.group();

    // If we have level data (passed via launch or global), render it
    const levelData = data?.levelData || currentLevelData;

    if (levelData) {
        renderLevel.call(this, levelData);
    } else {
        this.add.text(400, 100, 'TEXTPLORER: WASD to move', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);

        player = this.physics.add.sprite(400, 300, 'playerFigure');
        player.setScale(0.5);
        player.setCollideWorldBounds(true);

        const logo = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
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

    // Add title
    scene.add.text(400, 10, 'TEXTPLORER: WASD to move, ESC for menu', {
        fontSize: '16px',
        fill: '#fff'
    }).setOrigin(0.5, 0);

    // Create walls - add to static group for proper collision
    levelData.walls.forEach(wall => {
        const x = wall.x * cellSize + cellSize / 2;
        const y = wall.y * cellSize + cellSize / 2;
        // Render the actual character as white text
        const wallText = scene.add.text(x, y, wall.symbol || '#', {
            fontSize: `${cellSize}px`,
            fill: '#ffffff',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        scene.physics.add.existing(wallText, true); // true = static body
        wallText.body.setSize(cellSize, cellSize);
        walls.add(wallText);
    });

    // Create spikes
    levelData.spikes.forEach(spike => {
        const x = spike.x * cellSize + cellSize / 2;
        const y = spike.y * cellSize + cellSize / 2;
        const spikeText = scene.add.text(x, y, '^', {
            fontSize: `${cellSize}px`,
            fill: '#ff0000',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        scene.physics.add.existing(spikeText);
        spikeText.body.setAllowGravity(false);
        spikeText.body.setImmovable(true);
        spikeText.body.setSize(cellSize, cellSize);
        spikes.add(spikeText);
        spikeText.isDangerous = true;
    });

    // Create springs 
    levelData.springs.forEach(spring => {
        const x = spring.x * cellSize + cellSize / 2;
        const y = spring.y * cellSize + cellSize / 2;
        const springText = scene.add.text(x, y, 'Z', {
            fontSize: `${cellSize}px`,
            fill: '#ffff00',
            fontFamily: 'monospace'
        }).setOrigin(0.5);
        scene.physics.add.existing(springText);
        springText.body.setAllowGravity(false);
        springText.body.setImmovable(true);
        springText.body.setSize(cellSize, cellSize);
        springs.add(springText);
        springText.isSpring = true;
    });

    // Create finish point - disable gravity, make immovable
    const finishX = levelData.finish.x * cellSize + cellSize / 2;
    const finishY = levelData.finish.y * cellSize + cellSize / 2;
    finish = scene.add.text(finishX, finishY, '#', {
        fontSize: `${cellSize}px`,
        fill: '#00ff00',
        fontFamily: 'monospace'
    }).setOrigin(0.5);
    scene.physics.add.existing(finish);
    finish.body.setAllowGravity(false);
    finish.body.setImmovable(true);
    finish.body.setSize(cellSize, cellSize);
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

    // Set up collisions
    scene.physics.add.collider(player, walls);
    scene.physics.add.collider(spikes, walls);
    scene.physics.add.collider(springs, walls);
    scene.physics.add.overlap(player, spikes, handleSpikeCollision);
    scene.physics.add.overlap(player, springs, handleSpringCollision);
    scene.physics.add.overlap(player, finish, handleFinishCollision);

    // Store reference to level data for restart functionality
    player.spawnPoint = spawnPoint;
}

function handleSpikeCollision(player, spike) {
    // Reset player to spawn point
    player.x = player.spawnPoint.x;
    player.y = player.spawnPoint.y;
    player.setVelocity(0, 0);
}

function handleSpringCollision(player, spring) {
    // Boost player upward
    player.setVelocityY(-500);
}

function handleFinishCollision(player, finish) {
    // Level complete!
    const scene = game.scene.scenes[0];
    scene.add.text(400, 300, 'LEVEL COMPLETE!', {
        fontSize: '48px',
        fill: '#00ff00'
    }).setOrigin(0.5);
    scene.physics.pause();
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

    if (cursors.up.isDown && player.body.blocked.down) {
        player.body.setVelocityY(-350);
    }
}