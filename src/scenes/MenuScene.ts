import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.text(centerX, centerY - 150, 'nFactorial Soul Knight', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.createMenuButton('Start', centerY, () => {
            // This can be expanded to show gender selection first
            this.showGenderSelection();
        });
    }

    showGenderSelection() {
        // Clear existing buttons
        this.children.removeAll();
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Add title again
        this.add.text(centerX, centerY - 150, 'nFactorial Soul Knight', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 50, 'Choose your gender', {
            fontSize: '24px',
            color: '#dddddd'
        }).setOrigin(0.5);

        this.createMenuButton('Male', centerY + 50, () => {
            this.scene.start('GameScene', { gender: 'male' });
        });

        this.createMenuButton('Female', centerY + 120, () => {
            this.scene.start('GameScene', { gender: 'female' });
        });
    }

    createMenuButton(text: string, y: number, onClick: () => void) {
        const button = this.add.text(this.cameras.main.width / 2, y, text, {
            fontSize: '32px',
            color: '#fff',
        }).setOrigin(0.5).setPadding(10);

        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            button.setStyle({ fill: '#ffc300' });
        });
        button.on('pointerout', () => {
            button.setStyle({ fill: '#fff' });
        });

        button.on('pointerdown', onClick);
    }
}
