import Phaser from 'phaser';

export default class BackendActivationScene extends Phaser.Scene {
    constructor() {
        super('BackendActivationScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const bg = this.add.image(centerX, centerY, 'backend_question');
        bg.setScale(0.5); // Scale the image to fit better

        // Adjusted button positions and sizes for the scaled image
        const yesButton = this.add.zone(centerX - 75, centerY + 40, 60, 30).setInteractive({ useHandCursor: true });
        yesButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.stop('MinimapScene');
            this.scene.stop('BackendActivationScene');
            this.scene.start('GameOverScene', { message: 'Level Complete! Backend Activated!' });
        });

        const noButton = this.add.zone(centerX + 15, centerY + 40, 60, 30).setInteractive({ useHandCursor: true });
        noButton.on('pointerdown', () => {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.stop('MinimapScene');
            this.scene.stop('BackendActivationScene');
            this.scene.start('GameOverScene', { message: 'Level Complete! Backend remains dormant.' });
        });
    }
} 