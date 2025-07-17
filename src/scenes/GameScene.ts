import Phaser from 'phaser';
import Player from '../objects/Player';
import UIScene from './UIScene';
import Weapon from '../objects/Weapon';
import Enemy from '../objects/Enemy';
import Bullet from '../objects/Bullet';

export default class GameScene extends Phaser.Scene {
    public player!: Player;
    private gender!: string;
    private walls!: Phaser.Physics.Arcade.StaticGroup;
    private coins!: Phaser.Physics.Arcade.Group;
    private weapons!: Phaser.Physics.Arcade.Group;
    private enemies!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private doors!: Phaser.Physics.Arcade.StaticGroup;
    private coinCount = 0;
    public crosshair!: Phaser.GameObjects.Image;

    constructor() {
        super('GameScene');
    }

    init(data: { gender: string }) {
        this.gender = data.gender;
    }

    create() {
        this.physics.world.setBounds(0, 0, 5000, 5000);

        this.walls = this.physics.add.staticGroup();
        this.coins = this.physics.add.group();
        this.weapons = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });
        this.doors = this.physics.add.staticGroup();
        this.createWorld();
        
        const playerTexture = this.gender === 'male' ? 'player_boy' : 'player_girl';
        this.player = new Player(this, 2500, 2500, playerTexture);
        
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
        this.physics.add.overlap(this.player, this.weapons, this.pickUpWeapon, undefined, this);
        this.physics.add.collider(this.player, this.enemies);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.bullets, this.walls, this.bulletHitWall, undefined, this);
        this.physics.add.collider(this.bullets, this.enemies, this.bulletHitEnemy, undefined, this);

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 5000, 5000);

        this.crosshair = this.add.image(0, 0, 'crosshair');
        this.crosshair.setDepth(100); // Убедимся, что прицел поверх всего
        this.input.setDefaultCursor('none'); // Скрываем системный курсор
        
        this.scene.launch('UIScene');
        this.scene.launch('MinimapScene');
    }

    createWorld() {
        // Новые, правильные координаты для ровных комнат
        const startRoom = { x: 2500, y: 2500 };
        const defRoom = { x: 2500, y: 3396 };
        const leftRoom = { x: 1476, y: 2500 };
        const leftDownRoom = { x: 1476, y: 3396 };
        const rightRoom = { x: 3524, y: 2500 };
        const minibossRoom = { x: 3524, y: 1604 };
        const bossRoom = { x: 3524, y: 708 };

        // 1. Сначала создаем всю геометрию: комнаты и коридоры
        this.createRoom(startRoom.x, startRoom.y, { left: true, right: true, bottom: true });
        this.createRoom(defRoom.x, defRoom.y, { top: true });
        this.createRoom(leftRoom.x, leftRoom.y, { right: true, bottom: true });
        this.createRoom(leftDownRoom.x, leftDownRoom.y, { top: true });
        this.createRoom(rightRoom.x, rightRoom.y, { left: true, top: true });
        this.createRoom(minibossRoom.x, minibossRoom.y, { bottom: true, top: true });
        this.createRoom(bossRoom.x, bossRoom.y, { bottom: true });
        
        this.createHorizontalCorridor(leftRoom.x, startRoom.x, startRoom.y);
        this.createHorizontalCorridor(startRoom.x, rightRoom.x, startRoom.y);
        this.createVerticalCorridor(startRoom.y, defRoom.y, defRoom.x);
        this.createVerticalCorridor(leftRoom.y, leftDownRoom.y, leftRoom.x);
        this.createVerticalCorridor(minibossRoom.y, rightRoom.y, rightRoom.x);
        this.createVerticalCorridor(bossRoom.y, minibossRoom.y, minibossRoom.x);

        // 2. Теперь, когда пол на месте, размещаем монеты
        const promoRooms = [startRoom, defRoom, leftRoom, leftDownRoom, rightRoom];
        promoRooms.forEach(room => this.placeCoinInRoom(room.x, room.y));
        
        this.weapons.add(new Weapon(this, startRoom.x, startRoom.y, 'ak-47'));
        this.enemies.add(new Enemy(this, defRoom.x, defRoom.y));

        // Размещаем двери
        this.placeDoor(rightRoom.x, rightRoom.y - 320 - 64, 'miniboss'); // Дверь к мини-боссу
        this.placeDoor(minibossRoom.x, minibossRoom.y - 320 - 64, 'boss'); // Дверь к боссу (пока всегда закрыта)
    }

    createRoom(centerX: number, centerY: number, openings: { top?: boolean, bottom?: boolean, left?: boolean, right?: boolean }) {
        const wallSize = 64;
        const roomWidth = 12 * wallSize; // 768
        const roomHeight = 10 * wallSize; // 640
        const doorSize = 2 * wallSize; // 128

        const left = centerX - roomWidth / 2;
        const top = centerY - roomHeight / 2;
        
        this.add.tileSprite(left, top, roomWidth, roomHeight, 'floor_placeholder').setOrigin(0);

        for (let i = 0; i < roomWidth / wallSize; i++) {
            for (let j = 0; j < roomHeight / wallSize; j++) {
                const x = left + i * wallSize;
                const y = top + j * wallSize;

                const isBoundary = i === 0 || i === (roomWidth / wallSize) - 1 || j === 0 || j === (roomHeight / wallSize) - 1;
                if (!isBoundary) continue;

                let isDoor = false;
                if (openings.top && j === 0 && x >= centerX - doorSize / 2 && x < centerX + doorSize / 2) isDoor = true;
                if (openings.bottom && j === (roomHeight / wallSize) - 1 && x >= centerX - doorSize / 2 && x < centerX + doorSize / 2) isDoor = true;
                if (openings.left && i === 0 && y >= centerY - doorSize / 2 && y < centerY + doorSize / 2) isDoor = true;
                if (openings.right && i === (roomWidth / wallSize) - 1 && y >= centerY - doorSize / 2 && y < centerY + doorSize / 2) isDoor = true;

                if (!isDoor) {
                    this.walls.create(x, y, 'wall_placeholder').setOrigin(0).refreshBody();
                }
            }
        }
    }

    placeCoinInRoom(centerX: number, centerY: number) {
        const roomWidth = 12 * 64;
        const roomHeight = 10 * 64;
        const coinTextures = ['coin_twitter', 'coin_threads', 'coin_tiktok', 'coin_inst', 'coin_link'];
        const x = Phaser.Math.Between(centerX - roomWidth/4, centerX + roomWidth/4);
        const y = Phaser.Math.Between(centerY - roomHeight/4, centerY + roomHeight/4);
        const texture = Phaser.Math.RND.pick(coinTextures);
        const coin = this.coins.create(x, y, texture);
        
        const newScale = 0.005; // Новый, увеличенный масштаб
        coin.setScale(newScale); 

        this.tweens.add({
            targets: coin,
            scaleX: newScale * 1.2, // Немного увеличиваем при пульсации
            scaleY: newScale * 1.2,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createHorizontalCorridor(x1: number, x2: number, y: number) {
        const wallSize = 64;
        const roomWidth = 12 * wallSize;
        const corridorWidth = 2 * wallSize;
        const startX = Math.min(x1, x2) + roomWidth / 2;
        const endX = Math.max(x1, x2) - roomWidth / 2;
        this.add.tileSprite(startX, y - corridorWidth / 2, endX - startX, corridorWidth, 'floor_placeholder').setOrigin(0);
        for (let x = startX; x < endX; x += wallSize) {
            this.walls.create(x, y - corridorWidth / 2 - wallSize, 'wall_placeholder').setOrigin(0).refreshBody();
            this.walls.create(x, y + corridorWidth / 2, 'wall_placeholder').setOrigin(0).refreshBody();
        }
    }
    
    createVerticalCorridor(y1: number, y2: number, x: number) {
        const wallSize = 64;
        const roomHeight = 10 * wallSize;
        const corridorWidth = 2 * wallSize;
        const startY = Math.min(y1, y2) + roomHeight / 2;
        const endY = Math.max(y1, y2) - roomHeight / 2;
        this.add.tileSprite(x - corridorWidth / 2, startY, corridorWidth, endY - startY, 'floor_placeholder').setOrigin(0);
        for (let y = startY; y < endY; y += wallSize) {
            this.walls.create(x - corridorWidth / 2 - wallSize, y, 'wall_placeholder').setOrigin(0).refreshBody();
            this.walls.create(x + corridorWidth / 2, y, 'wall_placeholder').setOrigin(0).refreshBody();
        }
    }

    placeDoor(x: number, y: number, doorId: string) {
        // Помечаем ОБЕ части двери одним ID
        const door1 = this.doors.create(x - 64, y, 'door_placeholder').setOrigin(0).refreshBody();
        door1.setData('doorId', doorId);
        
        const door2 = this.doors.create(x, y, 'door_placeholder').setOrigin(0).refreshBody();
        door2.setData('doorId', doorId);
    }

    collectCoin(player, coin) {
        (coin as Phaser.Physics.Arcade.Sprite).destroy();
        this.coinCount++;
        const uiScene = this.scene.get('UIScene') as UIScene;
        uiScene.updateCoinCount(this.coinCount);

        if (this.coinCount >= 5) {
            this.openDoor('miniboss');
        }
    }

    openDoor(doorId: string) {
        const doorsToDestroy: Phaser.GameObjects.GameObject[] = [];
        this.doors.children.each(door => {
            if (door.getData('doorId') === doorId) {
                doorsToDestroy.push(door);
            }
            return true;
        });
        
        doorsToDestroy.forEach(door => door.destroy());
    }

    pickUpWeapon(player, weapon) {
        const weaponInstance = weapon as Weapon;
        this.weapons.remove(weaponInstance, false);

        (player as Player).setWeapon(weaponInstance);
        
        // Отключаем физическое тело, чтобы больше не было столкновений
        if (weaponInstance.body) {
            weaponInstance.body.enable = false;
        }
    }

    fireBullet(x: number, y: number, angle: number) {
        const bullet = this.bullets.get(x, y) as Bullet;
        if (bullet) {
            bullet.fire(x, y, angle);
        }
    }

    bulletHitWall(bullet, wall) {
        bullet.destroy();
    }

    bulletHitEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
    }

    update(time: number, delta: number) {
        this.player.update(time, delta);
        this.enemies.getChildren().forEach(enemy => (enemy as Enemy).update());

        if (this.crosshair) {
            const pointer = this.input.activePointer;
            let targetX = pointer.worldX;
            let targetY = pointer.worldY;

            let onEnemy = false;
            this.enemies.getChildren().forEach(enemy => {
                const enemySprite = enemy as Phaser.Physics.Arcade.Sprite;
                if (Phaser.Geom.Rectangle.Contains(enemySprite.getBounds(), pointer.worldX, pointer.worldY)) {
                    targetX = enemySprite.x;
                    targetY = enemySprite.y;
                    onEnemy = true;
                }
            });

            this.crosshair.setPosition(targetX, targetY);
            if (onEnemy) {
                this.crosshair.setTint(0xff0000);
            } else {
                this.crosshair.clearTint();
            }
        }
    }
}
