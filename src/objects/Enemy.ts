import Phaser from 'phaser';
import Player from './Player'; // Импортируем игрока

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    private speed = 70; // Немного медленнее для баланса
    private player: Player;
    public health = 100; // Увеличиваем ХП
    private isAttacking = false;
    private attackRange = 50; // Дистанция атаки
    private detectionRange = 400; // Дистанция обнаружения игрока
    private maxHealth = 100;
    private healthBar!: Phaser.GameObjects.Graphics;
    private healthBarBackground!: Phaser.GameObjects.Graphics;

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

        this.healthBar = scene.add.graphics();
        this.healthBarBackground = scene.add.graphics();
        this.healthBarBackground.setDepth(10);
        this.healthBar.setDepth(10);
        this.updateHealthBar();

        this.anims.play('spirit_walk', true);
    }

    setTexture(key: string, frame?: string | number): this {
        super.setTexture(key, frame);
        const isBoss = ['abai', 'diana', 'bahredin', 'arman', 'asseliy', 'bernar'].includes(this.texture.key);
        if (isBoss) {
            if (this.anims.isPlaying) {
                this.anims.stop();
            }
            this.setBossBody();
        }
        return this;
    }

    setBossBody() {
        if (!this.body) {
            return;
        }

        switch (this.texture.key) {
            case 'bahredin': {
                const frameWidth = this.texture.get().width;
                const frameHeight = this.texture.get().height;
                const bodyWidth = frameWidth / 3;
                const bodyHeight = frameHeight / 3;

                this.body.setSize(bodyWidth, bodyHeight);
                this.body.setOffset(frameWidth / 3, frameHeight / 3);
                break;
            }
        }
    }

    takeDamage(damage: number) {
        this.health -= damage;
        this.updateHealthBar();

        this.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            this.clearTint();
        });

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
        if (!this.active) {
            this.healthBar.setVisible(false);
            this.healthBarBackground.setVisible(false);
            return;
        }
        this.updateHealthBar();

        const isBoss = this.texture.key === 'abai' || this.texture.key === 'diana' || this.texture.key === 'bahredin' || this.texture.key === 'arman' || this.texture.key === 'asseliy' || this.texture.key === 'bernar';

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

    private updateHealthBar() {
        if (this.health > this.maxHealth) {
            this.maxHealth = this.health;
        }

        this.healthBarBackground.clear();
        this.healthBar.clear();

        if (this.health >= this.maxHealth || this.health <= 0) {
            this.healthBar.setVisible(false);
            this.healthBarBackground.setVisible(false);
            return;
        }

        this.healthBar.setVisible(true);
        this.healthBarBackground.setVisible(true);

        const healthBarWidth = 40;
        const healthBarHeight = 4;
        const x = this.x - healthBarWidth / 2;
        const y = this.y - this.displayHeight / 2 - 8;

        this.healthBarBackground.fillStyle(0xff0000, 0.7);
        this.healthBarBackground.fillRect(x, y, healthBarWidth, healthBarHeight);

        const healthPercentage = this.health / this.maxHealth;

        if (healthPercentage < 0.3) {
            this.healthBar.fillStyle(0xff0000, 1);
        } else if (healthPercentage < 0.6) {
            this.healthBar.fillStyle(0xffa500, 1);
        } else {
            this.healthBar.fillStyle(0x00ff00, 1);
        }

        this.healthBar.fillRect(x, y, healthBarWidth * healthPercentage, healthBarHeight);
    }

    destroy(fromScene?: boolean) {
        this.healthBar.destroy();
        this.healthBarBackground.destroy();
        super.destroy(fromScene);
    }
}
