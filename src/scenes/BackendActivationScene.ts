import Phaser from 'phaser';

export default class BackendActivationScene extends Phaser.Scene {
    private enterKey?: Phaser.Input.Keyboard.Key;
    private spaceKey?: Phaser.Input.Keyboard.Key;

    constructor() {
        super('BackendActivationScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.cameras.main.setBackgroundColor('#34d3e8'); // Light blue background

        this.add.text(centerX, centerY - 50, 'Activate backend?', {
            fontSize: '48px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 50, 'Press Enter or Space to Activate', {
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);

        if (this.input.keyboard) {
            this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        }
    }

    update() {
        if ((this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) ||
            (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey))) {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.stop('MinimapScene');
            this.scene.start('FakeLoadingScene', { nextScene: 'Level2Scene', gender: this.scene.get('GameScene').player.texture.key.startsWith('boy') ? 'boy' : 'girl' });
        }
    }
} 