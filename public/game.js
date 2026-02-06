const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 } }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player;
let cursors;

function preload() {
    //load txt files
}

function create() {
    this.add.text(400, 100, 'TEXTPLORER: WASD to move', { 
        fontSize: '32px', 
        fill: '#fff' 
    }).setOrigin(0.5);

    player = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
    this.physics.add.existing(player);
    player.body.setCollideWorldBounds(true);

    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    const logo = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
    this.physics.add.existing(logo);
    logo.body.setBounce(0.8).setCollideWorldBounds(true);
}

function update() {
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