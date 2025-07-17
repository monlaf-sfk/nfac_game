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

        const graphics = this.make.graphics();

        // Текстура пола
        graphics.fillStyle(0x222222, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('floor_placeholder', 64, 64);

        // Текстура стены
        graphics.fillStyle(0x555555, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('wall_placeholder', 64, 64);

        // Текстура двери
        graphics.fillStyle(0x8B0000, 1); // Темно-красный цвет
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('door_placeholder', 64, 64);

        graphics.destroy();
    }

    create() {
        this.scene.start('MenuScene');
    }
}
