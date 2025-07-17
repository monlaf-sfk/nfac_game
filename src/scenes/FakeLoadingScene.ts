import Phaser from 'phaser';

export default class FakeLoadingScene extends Phaser.Scene {
    constructor() {
        super('FakeLoadingScene');
    }

    create(data: { nextScene: string; gender: string }) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.text(centerX, centerY, 'Loading...', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            this.scene.start(data.nextScene, { gender: data.gender });
        });
    }
} 