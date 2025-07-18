import Phaser from 'phaser';

interface NotificationData {
    parentSceneKey: string;
    text: string | string[];
    leftImage?: { key: string, scale: number };
    rightImage?: { key: string, scale: number };
}

export default class NotificationScene extends Phaser.Scene {
    constructor() {
        super('NotificationScene');
    }

    create(data: NotificationData) {
        const { parentSceneKey, text, leftImage, rightImage } = data;
        const { width, height } = this.scale;

        const panel = this.add.container(width / 2, height / 2);
        panel.setDepth(1000);

        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.9);
        const panelWidth = 800;
        const panelHeight = 250;
        background.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 16);
        panel.add(background);

        let wrapWidth = panelWidth - 100;

        if (leftImage) {
            const leftImg = this.add.image(-panelWidth / 2 + 100, 0, leftImage.key).setScale(leftImage.scale);
            panel.add(leftImg);
            wrapWidth -= 150;
        }

        if (rightImage) {
            const rightImg = this.add.image(panelWidth / 2 - 100, 0, rightImage.key).setScale(rightImage.scale);
            panel.add(rightImg);
            wrapWidth -= 150;
        }

        const textObject = this.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: wrapWidth }
        }).setOrigin(0.5);
        panel.add(textObject);

        this.input.once('pointerdown', () => {
            this.scene.stop();
            this.scene.resume(parentSceneKey);
        });
    }
} 