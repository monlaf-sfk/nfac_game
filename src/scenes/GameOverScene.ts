import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create(data: { win: boolean }) {
        const { width, height } = this.scale;
        const titleText = data.win ? 'You are the new founder!' : 'You’ve been Soft Rejected';
        const titleColor = data.win ? '#ffd700' : '#ff4444';

        // Background
        this.add.rectangle(0, 0, width, height, 0x0a0a2a).setOrigin(0);

        // Stars
        for (let i = 0; i < 200; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Phaser.Math.FloatBetween(0.5, 1);
            this.add.circle(x, y, size, 0xffffff, alpha);
        }

        // Title
        this.add.text(width / 2, height / 2 - 100, titleText, {
            fontSize: '64px',
            fontFamily: '"Arial Black", Gadget, sans-serif',
            color: titleColor,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Restart Button
        const restartButton = this.add.text(width / 2, height / 2 + 50, 'Play Again', {
            fontSize: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            backgroundColor: '#ff4494',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        // Author credit
        this.add.text(width / 2, height - 50, 'A game by rasulkerimzhanov', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#aaaaaa'
        }).setOrigin(0.5);
    }
}
