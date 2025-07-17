import Phaser from 'phaser';
import GameScene from '../scenes/GameScene';

export default class Weapon extends Phaser.Physics.Arcade.Sprite {
    private lastFired = 0;
    public fireRate = 500;
    private gameScene: GameScene;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.gameScene = scene as GameScene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.setScale(0.02);
        this.setOrigin(0.1, 0.5);
        
        if (this.body) {
            (this.body as Phaser.Physics.Arcade.Body).setEnable(false);
        }
    }

    public fire(owner: Phaser.Physics.Arcade.Sprite, time: number): void {
        if (time > this.lastFired) {
            const angle = this.rotation;

            const muzzleOffset = this.displayWidth * (1 - this.originX);
            const muzzleX = this.x + muzzleOffset * Math.cos(angle);
            const muzzleY = this.y + muzzleOffset * Math.sin(angle);

            this.gameScene.fireBullet(muzzleX, muzzleY, angle);
            this.lastFired = time + this.fireRate;
        }
    }

    public updateAttached(owner: Phaser.Physics.Arcade.Sprite): void {
        const angle = Phaser.Math.Angle.Between(
            owner.x,
            owner.y,
            this.gameScene.crosshair.x,
            this.gameScene.crosshair.y
        );

        this.setRotation(angle);
        this.setPosition(owner.x, owner.y);

        this.setFlipY(this.gameScene.crosshair.x < owner.x);
    }
} 