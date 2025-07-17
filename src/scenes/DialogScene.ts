import Phaser from 'phaser';

export default class DialogScene extends Phaser.Scene {
    constructor() {
        super('DialogScene');
    }

    create(data: { title: string, text: string, onComplete: () => void }) {
        const { title, text, onComplete } = data;

        const dialogBox = this.add.graphics();
        dialogBox.fillStyle(0x000000, 0.8);
        dialogBox.fillRect(this.cameras.main.width / 2 - 250, this.cameras.main.height / 2 - 100, 500, 200);

        const titleText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 80, title, {
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const contentText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, text, {
            fontSize: '18px',
            color: '#ffffff',
            align: 'left',
            wordWrap: { width: 480 }
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.stop();
            onComplete();
        });
    }
} 