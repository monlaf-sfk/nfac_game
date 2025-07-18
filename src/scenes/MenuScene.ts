import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    private boyButton!: Phaser.GameObjects.Image;
    private girlButton!: Phaser.GameObjects.Image;
    private titleText!: Phaser.GameObjects.Text;

    constructor() {
        super('MenuScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.titleText = this.add.text(centerX, 150, 'Choose Your Character', {
            fontSize: '48px',
            color: '#fff',
        }).setOrigin(0.5);

        this.boyButton = this.add.image(centerX - 150, centerY, 'boy_walk_1').setScale(0.1).setInteractive({ useHandCursor: true });
        this.girlButton = this.add.image(centerX + 150, centerY, 'girl_walk_1').setScale(0.1).setInteractive({ useHandCursor: true });

        this.boyButton.on('pointerdown', () => this.showLevelSelection('boy'));
        this.girlButton.on('pointerdown', () => this.showLevelSelection('girl'));
    }

    showLevelSelection(gender: string) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.boyButton.destroy();
        this.girlButton.destroy();
        this.titleText.destroy();

        const level1Button = this.add.text(centerX, centerY - 50, 'Start Level 1', {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#333'
        }).setPadding(10).setOrigin(0.5).setInteractive({ useHandCursor: true });

        level1Button.on('pointerdown', () => {
            this.scene.start('GameScene', { gender });
        });

        const level2Button = this.add.text(centerX, centerY + 50, 'Start Level 2', {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#333'
        }).setPadding(10).setOrigin(0.5).setInteractive({ useHandCursor: true });

        level2Button.on('pointerdown', () => {
            this.scene.start('Level2Scene', { gender });
        });

        const level3Button = this.add.text(centerX, centerY + 150, 'Start Level 3', {
            fontSize: '32px',
            color: '#fff',
            backgroundColor: '#333'
        }).setPadding(10).setOrigin(0.5).setInteractive({ useHandCursor: true });

        level3Button.on('pointerdown', () => {
            this.scene.start('Level3Scene', { gender });
        });
    }
}
