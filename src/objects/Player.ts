import Phaser from 'phaser';
import Weapon from './Weapon';
import GameScene from '../scenes/GameScene';

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

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setScale(0.01); // <-- МАСШТАБИРОВАНИЕ. Измените 0.25 на другое значение (например, 0.5)

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
    }

    setWeapon(weapon: Weapon) {
        this.weapon = weapon;
        if (this.weapon) {
            this.weapon.setDepth(this.depth + 1);
        }
    }

    update(time: number, delta: number) {
        this.setVelocity(0);

        if (this.cursors.left?.isDown || this.cursors.A?.isDown) {
            this.setVelocityX(-this.speed);
        } else if (this.cursors.right?.isDown || this.cursors.D?.isDown) {
            this.setVelocityX(this.speed);
        }

        if (this.cursors.up?.isDown || this.cursors.W?.isDown) {
            this.setVelocityY(-this.speed);
        } else if (this.cursors.down?.isDown || this.cursors.S?.isDown) {
            this.setVelocityY(this.speed);
        }

        if (this.weapon) {
            this.weapon.updateAttached(this);

            if (this.spaceBar.isDown) {
                this.weapon.fire(this, time);
            }
        }
    }
}
