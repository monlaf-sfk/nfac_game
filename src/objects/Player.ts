import Phaser from 'phaser';
import Weapon from './Weapon';
import GameScene from '../scenes/GameScene';
import UIScene from '../scenes/UIScene';

type ExtendedCursorKeys = Phaser.Types.Input.Keyboard.CursorKeys & {
    W?: Phaser.Input.Keyboard.Key;
    A?: Phaser.Input.Keyboard.Key;
    S?: Phaser.Input.Keyboard.Key;
    D?: Phaser.Input.Keyboard.Key;
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: ExtendedCursorKeys;
    private speed = 200;
    private weapon: Weapon | null = null;
    private spaceBar: Phaser.Input.Keyboard.Key;
    public health = 100; // Добавляем здоровье игроку
    private invulnerableUntil = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setDepth(1); // Устанавливаем глубину, чтобы игрок был поверх пола
        this.setScale(0.03); // <-- МАСШТАБИРОВАНИЕ. Измените 0.25 на другое значение (например, 0.5)
        this.setOrigin(0.5, 0.5);
        this.refreshBody();

        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        
        // Add wasd keys
        const keyboard = this.scene.input.keyboard;
        if (keyboard) {
            const wasd = keyboard.addKeys('W,A,S,D') as {
                W: Phaser.Input.Keyboard.Key;
                A: Phaser.Input.Keyboard.Key;
                S: Phaser.Input.Keyboard.Key;
                D: Phaser.Input.Keyboard.Key;
            };
            this.cursors = { ...this.cursors, ...wasd };
        }
        this.spaceBar = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.createAnimations(texture);
    }

    isInvulnerable(): boolean {
        return this.scene.time.now < this.invulnerableUntil;
    }

    takeDamage(damage: number) {
        if (this.isInvulnerable()) return;

        this.health -= damage;
        this.invulnerableUntil = this.scene.time.now + 1000; // 1 second of invulnerability
        const uiScene = this.scene.scene.get('UIScene') as UIScene;
        if (uiScene) {
            uiScene.updateHP(this.health);
        }
        if (this.health <= 0) {
            this.scene.scene.start('GameOverScene');
        }
        
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 5
        });
    }

    createAnimations(texture: string) {
        const gender = texture.startsWith('boy') ? 'boy' : 'girl';
        
        const walkFrames: { key: string }[] = [];
        for (let i = 1; i <= 4; i++) {
            walkFrames.push({ key: `${gender}_walk_${i}` });
        }

        this.anims.create({
            key: `${gender}_walk`,
            frames: walkFrames,
            frameRate: 10,
            repeat: -1
        });
    }

    setWeapon(weapon: Weapon) {
        this.weapon = weapon;
        if (this.weapon) {
            this.weapon.setDepth(this.depth + 1);
        }
    }

    update(time: number, delta: number) {
        this.setVelocity(0);
        let isMoving = false;

        if (this.cursors.left?.isDown || this.cursors.A?.isDown) {
            this.setVelocityX(-this.speed);
            this.flipX = true;
            isMoving = true;
        } else if (this.cursors.right?.isDown || this.cursors.D?.isDown) {
            this.setVelocityX(this.speed);
            this.flipX = false;
            isMoving = true;
        }

        if (this.cursors.up?.isDown || this.cursors.W?.isDown) {
            this.setVelocityY(-this.speed);
            isMoving = true;
        } else if (this.cursors.down?.isDown || this.cursors.S?.isDown) {
            this.setVelocityY(this.speed);
            isMoving = true;
        }

        const gender = this.texture.key.startsWith('boy') ? 'boy' : 'girl';

        if (isMoving) {
            this.anims.play(`${gender}_walk`, true);
        } else {
            this.anims.stop();
            this.setTexture(`${gender}_walk_3`);
        }

        if (this.weapon) {
            this.weapon.updateAttached(this);

            if (this.spaceBar.isDown) {
                this.weapon.fire(this, time);
            }
        }
    }
}
