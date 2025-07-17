import Phaser from 'phaser';
import Player from './Player'; // Импортируем игрока

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    private speed = 70; // Немного медленнее для баланса
    private player: Player;
    public health = 100; // Увеличиваем ХП
    private isAttacking = false;
    private attackRange = 50; // Дистанция атаки
    private detectionRange = 400; // Дистанция обнаружения игрока

    constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
        super(scene, x, y, 'spirit_stay_1');
        this.player = player; // Сохраняем ссылку на игрока
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setDepth(1); // Устанавливаем глубину, чтобы враг был поверх пола
        this.createAnimations();
        this.setScale(0.03);
        this.setOrigin(0.5, 0.5);
        this.refreshBody();

        this.anims.play('spirit_stay_anim');
    }

    takeDamage(damage: number) {
        this.health -= damage;
        if (this.health <= 0) {
            this.setActive(false);
            this.setVisible(false);
            if (this.body) {
                this.body.enable = false;
            }
            return true;
        }
        return false;
    }

    private attack() {
        if (this.isAttacking || !this.body) return;

        this.isAttacking = true;
        this.anims.play('spirit_fight_anim', true);
        this.setVelocityX(0);

        this.scene.time.delayedCall(800, () => { // Длительность анимации атаки
            if (!this.active || !this.player.active) {
                this.isAttacking = false;
                return;
            }
            
            const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            if (distance <= this.attackRange + 20) { // +20 для погрешности
                this.player.takeDamage(10);
            }
            this.isAttacking = false;
        }, [], this);
    }

    createAnimations() {
        // Stay Animation
        const stayFrames: { key: string }[] = [];
        for (let i = 1; i <= 2; i++) {
            stayFrames.push({ key: `spirit_stay_${i}` });
        }
        this.anims.create({
            key: 'spirit_stay_anim',
            frames: stayFrames,
            frameRate: 3,
            repeat: -1
        });

        // Walk Animation
        const walkFrames: { key: string }[] = [];
        for (let i = 1; i <= 8; i++) {
            walkFrames.push({ key: `spirit_walk_${i}` });
        }
        this.anims.create({
            key: 'spirit_walk_anim',
            frames: walkFrames,
            frameRate: 10,
            repeat: -1
        });

        // Fight Animation
        const fightFrames: { key: string }[] = [];
        for (let i = 1; i <= 8; i++) {
            fightFrames.push({ key: `spirit_fight_${i}` });
        }
        this.anims.create({
            key: 'spirit_fight_anim',
            frames: fightFrames,
            frameRate: 10,
            repeat: -1
        });
    }

    update() {
        const isBoss = this.texture.key === 'abai' || this.texture.key === 'diana';

        if (!this.active || !this.player.active || (!isBoss && this.isAttacking) || !this.body) {
            this.setVelocityX(0);
            if (!isBoss && !this.isAttacking) {
                this.anims.play('spirit_stay_anim', true);
            }
            return;
        }

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);

        if (distance <= this.attackRange) {
            if (!isBoss) {
                this.attack();
            } else {
                this.setVelocity(0, 0);
            }
        } else if (distance <= this.detectionRange) {
            // Движение к игроку
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
            
            if (!isBoss) {
                this.anims.play('spirit_walk_anim', true);
            }
            this.flipX = this.body.velocity.x < 0;
        } else {
            // Стоим на месте, если игрок далеко
            this.setVelocity(0, 0);
            if (!isBoss) {
                this.anims.play('spirit_stay_anim', true);
            }
        }
    }
}
