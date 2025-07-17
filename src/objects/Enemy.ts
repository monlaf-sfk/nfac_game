import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    private speed = 100;
    private direction = 1;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setVelocityX(this.speed * this.direction);
    }

    update() {
        if (this.body.blocked.right) {
            this.direction = -1;
            this.setVelocityX(this.speed * this.direction);
        } else if (this.body.blocked.left) {
            this.direction = 1;
            this.setVelocityX(this.speed * this.direction);
        }
    }
}
