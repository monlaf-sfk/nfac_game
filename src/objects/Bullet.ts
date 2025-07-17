import Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    private speed = 400;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet');
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    fire(x: number, y: number, angle: number) {
        this.setPosition(x, y);
        this.setRotation(angle);
        if (this.body) {
            const angleInDegrees = Phaser.Math.RadToDeg(angle);
            this.scene.physics.velocityFromAngle(angleInDegrees, this.speed, this.body.velocity);
        }
    }

    update(time: number, delta: number) {
        if (!Phaser.Geom.Rectangle.Overlaps(this.scene.physics.world.bounds, this.getBounds())) {
            this.destroy();
        }
    }
}
