import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create(data: { message: string }) {
        this.add.text(400, 300, data.message, {
            fontSize: '32px',
            color: '#fff'
        }).setOrigin(0.5);

        const restartButton = this.add.text(400, 400, 'Restart', {
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#333'
        }).setPadding(10).setOrigin(0.5);

        restartButton.setInteractive();
        restartButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
