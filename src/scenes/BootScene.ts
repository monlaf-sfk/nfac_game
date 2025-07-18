import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // this.load.image('player_boy', 'assets/player/boy.png');
        // this.load.image('player_girl', 'assets/player/girl.png');

        for (let i = 1; i <= 4; i++) {
            this.load.image(`boy_walk_${i}`, `assets/player/boy_walk_${i}.png`);
            this.load.image(`girl_walk_${i}`, `assets/player/girl_walk_${i}.png`);
        }
        
        // Загружаем иконки-монетки
        this.load.image('coin_twitter', 'assets/coins/twitter.png');
        this.load.image('coin_threads', 'assets/coins/threads.png');
        this.load.image('coin_tiktok', 'assets/coins/tiktok.png');
        this.load.image('coin_inst', 'assets/coins/inst.png');
        this.load.image('coin_link', 'assets/coins/link.png');

        this.load.image('ak-47', 'assets/weapons/ak-47.png');

        // Bosses
        this.load.image('abai', 'assets/bosses/abai.png');
        this.load.image('diana', 'assets/bosses/diana.png');
        this.load.image('arman', 'assets/bosses/arman.png');
        this.load.image('asseliy', 'assets/bosses/asseliy.png');
        this.load.image('bahredin', 'assets/bosses/bahredin.png');
        this.load.image('bernar', 'assets/bosses/bernar.png');
        this.load.image('dialogue_abai', 'assets/dialogue/abai.png');
        this.load.image('dialogue_diana', 'assets/dialogue/diana.png');
        this.load.image('dialogue_almas', 'assets/dialogue/almas.png');
        this.load.image('dialogue_bahredin', 'assets/bosses/bahredin.png');
        this.load.image('dialogue_asseliy', 'assets/bosses/asseliy.png');
        this.load.image('dialogue_boy_player', 'assets/dialogue/boy_player.png');
        this.load.image('dialogue_girl_player', 'assets/dialogue/girl_player.png');
        this.load.image('dialogue_igor', 'assets/friends/igor.png');
        this.load.image('dialogue_bernar', 'assets/bosses/bernar.png');
        this.load.image('dialogue_nurmek', 'assets/friends/nurmek.png');
        this.load.image('dialogue_arman', 'assets/bosses/arman.png');

        this.load.image('nfactorial_logo', 'assets/friends/nfactorial.png');

        this.load.image('question_mark', 'assets/ui/question_mark.png');

        // Friends
        this.load.image('almass', 'assets/friends/almass.png');
        this.load.image('friend_nurmek', 'assets/friends/nurmek.png');
        this.load.image('friend_igor', 'assets/friends/igor.png');
        this.load.image('friend_almas', 'assets/friends/almass.png');

        // Objects
        this.load.image('pc', 'assets/object/pc.png');
        this.load.image('backend_question', 'assets/object/backend.png');
        this.load.image('wall_1', 'assets/object/wall_1.png'); // Add wall_1.png

        // Загрузка кадров для врага
        for (let i = 1; i <= 2; i++) {
            this.load.image(`spirit_stay_${i}`, `assets/enemies/spirit_stay_${i}.png`);
        }
        for (let i = 1; i <= 8; i++) {
            this.load.image(`spirit_walk_${i}`, `assets/enemies/spirit_walk_${i}.png`);
            this.load.image(`spirit_fight_${i}`, `assets/enemies/spirit_fight_${i}.png`);
        }


        const graphics = this.make.graphics();

        // Текстура пола
        graphics.fillStyle(0x222222, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('floor_placeholder', 64, 64);

        // Текстура стены
        this.load.image('wall_placeholder', 'assets/object/wall_1.png'); // Use wall_1.png for wall_placeholder

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
