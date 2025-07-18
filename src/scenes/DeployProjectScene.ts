import Phaser from 'phaser';
import Level3Scene from './Level3Scene';

export default class DeployProjectScene extends Phaser.Scene {
    private enterKey?: Phaser.Input.Keyboard.Key;
    private spaceKey?: Phaser.Input.Keyboard.Key;
    private parentScene!: Level3Scene;

    constructor() {
        super('DeployProjectScene');
    }

    init(data: { parentScene: Level3Scene }) {
        this.parentScene = data.parentScene;
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.cameras.main.setBackgroundColor('#34d3e8');

        this.add.text(centerX, centerY - 50, 'Deploy project?', {
            fontSize: '48px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(centerX, centerY + 50, 'Press Enter or Space to Deploy', {
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
            this.parentScene.onProjectDeployed();
            this.scene.stop();
        }
    }
} 