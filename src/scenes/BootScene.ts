import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('player_boy', 'assets/player/boy.png');
        this.load.image('player_girl', 'assets/player/girl.png');
        
        // Загружаем иконки-монетки
        this.load.image('coin_twitter', 'assets/coins/twitter.png');
        this.load.image('coin_threads', 'assets/coins/threads.png');
        this.load.image('coin_tiktok', 'assets/coins/tiktok.png');
        this.load.image('coin_inst', 'assets/coins/inst.png');
        this.load.image('coin_link', 'assets/coins/link.png');

        this.load.image('ak-47', 'assets/weapons/ak-47.png');

        const graphics = this.make.graphics();

        // Текстура пола
        graphics.fillStyle(0x222222, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('floor_placeholder', 64, 64);

        // Текстура стены
        graphics.fillStyle(0x333333);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('wall_placeholder', 64, 64);

        // Текстура двери
        graphics.fillStyle(0x8b4513);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('door_placeholder', 64, 64);

        // Текстура прицела
        graphics.clear();
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.strokeCircle(0, 0, 10);
        graphics.generateTexture('crosshair', 22, 22);

        // Текстура пули
        graphics.clear();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(0, 0, 8, 4);
        graphics.generateTexture('bullet', 8, 4);

        graphics.destroy();
    }

    create() {
        this.scene.start('MenuScene');
    }
}
