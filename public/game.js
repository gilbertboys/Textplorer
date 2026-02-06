const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 5 } }
    },
    scene: { preload, create }
};

const game = new Phaser.Game(config);

function preload() {
    // This is where you'll later load your .txt levels!
}

function create() {
    this.add.text(400, 100, 'TEXTPLORER: HELLO WORLD', { 
        fontSize: '32px', 
        fill: '#fff' 
    }).setOrigin(0.5);

    // A simple physics box to test the engine
    const logo = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
    this.physics.add.existing(logo);
    logo.body.setBounce(0.8).setCollideWorldBounds(true);
}