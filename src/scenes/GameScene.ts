import Phaser from 'phaser';
import Player from '../objects/Player';
import UIScene from './UIScene';
import Weapon from '../objects/Weapon';
import Enemy from '../objects/Enemy';
import Bullet from '../objects/Bullet';

interface Room {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
    enemies: { type: string, count: number }[];
    coins: { name: string, count: number }[];
    isCleared: boolean;
    openings: { top?: boolean, bottom?: boolean, left?: boolean, right?: boolean };
}

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
    private rooms: Room[] = [];

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
        this.enemies = this.physics.add.group({
            runChildUpdate: true,
        });
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });
        this.doors = this.physics.add.staticGroup();

        // Сначала создаем игрока
        const playerTexture = this.gender === 'male' ? 'boy_walk_1' : 'girl_walk_1';
        this.player = new Player(this, 2500, 2500, playerTexture);

        // Теперь создаем мир, который зависит от игрока
        this.createWorld();

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
        this.physics.add.overlap(this.player, this.weapons, this.pickUpWeapon, undefined, this);
        this.physics.add.collider(this.player, this.enemies, this.playerHitByEnemy, undefined, this);
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
        const roomSize = { width: 768, height: 640 };
        const bottomRoomY = 3396;

        this.rooms = [
            { id: 'room1', x: 2500, y: 2500, ...roomSize, enemies: [{ type: 'spirit', count: 2 }, { type: 'cleaner', count: 1 }], coins: [{ name: 'coin_link', count: 1 }], isCleared: false, openings: { left: true, right: true, bottom: true } },
            { id: 'room2', x: 1476, y: 2500, ...roomSize, enemies: [{ type: 'spirit', count: 3 }, { type: 'guard', count: 1 }], coins: [{ name: 'coin_inst', count: 1 }, { name: 'coin_threads', count: 1 }], isCleared: false, openings: { right: true, bottom: true } },
            { id: 'room3', x: 3524, y: 2500, ...roomSize, enemies: [{ type: 'cleaner', count: 2 }, { type: 'spirit', count: 2 }, { type: 'guard', count: 1 }], coins: [{ name: 'coin_tiktok', count: 1 }, { name: 'coin_twitter', count: 1 }], isCleared: false, openings: { left: true, top: true } },
            { id: 'miniboss_room', x: 3524, y: 1604, ...roomSize, enemies: [{ type: 'spirit', count: 5 }], coins: [{ name: 'coin_inst', count: 1 }], isCleared: false, openings: { top: true, bottom: true } },
            { id: 'boss_room', x: 3524, y: 708, ...roomSize, enemies: [{ type: 'spirit', count: 8 }], coins: [{ name: 'coin_link', count: 1 }], isCleared: false, openings: { bottom: true } },
            { id: 'bottom_left_room', x: 1476, y: bottomRoomY, ...roomSize, enemies: [{ type: 'spirit', count: 3 }], coins: [{ name: 'coin_threads', count: 1 }], isCleared: false, openings: { top: true, right: true } },
            { id: 'bottom_center_room', x: 2500, y: bottomRoomY, ...roomSize, enemies: [{ type: 'spirit', count: 3 }], coins: [{ name: 'coin_twitter', count: 1 }], isCleared: false, openings: { top: true, left: true } }
        ];

        this.rooms.forEach(room => {
            this.createRoom(room.x, room.y, room.openings);
        });

        const room1 = this.rooms.find(r => r.id === 'room1')!;
        const room2 = this.rooms.find(r => r.id === 'room2')!;
        const room3 = this.rooms.find(r => r.id === 'room3')!;
        const minibossRoom = this.rooms.find(r => r.id === 'miniboss_room')!;
        const bossRoom = this.rooms.find(r => r.id === 'boss_room')!;
        const bottomLeftRoom = this.rooms.find(r => r.id === 'bottom_left_room')!;
        const bottomCenterRoom = this.rooms.find(r => r.id === 'bottom_center_room')!;

        this.createHorizontalCorridor(room2.x, room1.x, room1.y);
        this.createHorizontalCorridor(room1.x, room3.x, room1.y);
        this.createVerticalCorridor(minibossRoom.y, room3.y, room3.x);
        this.createVerticalCorridor(bossRoom.y, minibossRoom.y, minibossRoom.x);
        this.createVerticalCorridor(room1.y, bottomCenterRoom.y, room1.x);
        this.createVerticalCorridor(room2.y, bottomLeftRoom.y, room2.x);
        this.createHorizontalCorridor(bottomLeftRoom.x, bottomCenterRoom.x, bottomCenterRoom.y);

        this.weapons.add(new Weapon(this, room1.x, room1.y, 'ak-47'));

        this.rooms.forEach(room => {
            this.spawnEnemies(room);
        });
    }

    spawnEnemies(room: Room) {
        room.enemies.forEach(enemyInfo => {
            for (let i = 0; i < enemyInfo.count; i++) {
                const x = Phaser.Math.Between(room.x - room.width / 4, room.x + room.width / 4);
                const y = Phaser.Math.Between(room.y - room.height / 4, room.y + room.height / 4);
                const enemy = new Enemy(this, x, y, this.player);
                enemy.setData('roomId', room.id);
                this.enemies.add(enemy);
            }
        });
    }

    checkRoomCompletion(roomId: string) {
        console.log(`Checking completion for room: ${roomId}`);
        const room = this.rooms.find(r => r.id === roomId);
        if (!room || room.isCleared) {
            console.log(`Room ${roomId} is already cleared or does not exist.`);
            return;
        }

        const remainingEnemies = this.enemies.getChildren().filter(e => e.getData('roomId') === roomId && e.active);
        console.log(`Remaining enemies in room ${roomId}: ${remainingEnemies.length}`);
        if (remainingEnemies.length === 0) {
            console.log(`Room ${roomId} is cleared, spawning coins.`);
            room.isCleared = true;
            this.spawnCoins(room);
        }
    }

    spawnCoins(room: Room) {
        room.coins.forEach(coinInfo => {
            for (let i = 0; i < coinInfo.count; i++) {
                let x, y;
                if (room.id === 'room1') {
                    x = room.x;
                    y = room.y;
                } else if (room.id === 'room2') {
                    x = i === 0 ? room.x - room.width / 4 : room.x + room.width / 4;
                    y = i === 0 ? room.y - room.height / 4 : room.y + room.height / 4;
                } else if (room.id === 'room3') {
                    x = room.x;
                    y = i === 0 ? room.y - room.height / 4 : room.y + room.height / 4;
                } else {
                    x = Phaser.Math.Between(room.x - room.width / 4, room.x + room.width / 4);
                    y = Phaser.Math.Between(room.y - room.height / 4, room.y + room.height / 4);
                }
                const coin = this.coins.create(x, y, coinInfo.name);
                const newScale = 0.005; 
                coin.setScale(newScale); 

                this.tweens.add({
                    targets: coin,
                    scaleX: newScale * 1.2,
                    scaleY: newScale * 1.2,
                    duration: 700,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
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
        const isDead = enemy.takeDamage(50); // Предполагаем, что урон от пули 50
        if (isDead) {
            const roomId = enemy.getData('roomId');
            if (roomId) {
                this.checkRoomCompletion(roomId);
            }
        }
    }

    playerHitByEnemy(player, enemy) {
        if (this.player.isInvulnerable()) return;

        this.player.takeDamage(10);
        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene) {
            uiScene.updateHP(this.player.health);
        }
    }

    private startDialog(title: string, text: string, onComplete: () => void) {
        this.scene.launch('DialogScene', { title, text, onComplete });
        this.scene.pause('GameScene');
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

        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene) {
            uiScene.updateHP(this.player.health);
        }

        const minibossRoom = this.rooms.find(r => r.id === 'miniboss_room');
        if (minibossRoom && !minibossRoom.isCleared && this.player.y < minibossRoom.y + minibossRoom.height / 2) {
            minibossRoom.isCleared = true; // prevent re-triggering
            this.startDialog('Абай', 'СДЕЛАЙ ДОМАШКУ ПО БЭКУ, НАУЧИСЬ FASTAPI И ПОТОМ ТОЛЬКО ПРИХОДИ.', () => {
                this.scene.resume('GameScene');
                const boss = new Enemy(this, minibossRoom.x, minibossRoom.y, this.player);
                boss.setTexture('abai');
                boss.setData('roomId', minibossRoom.id);
                this.enemies.add(boss);
            });
        }

        const bossRoom = this.rooms.find(r => r.id === 'boss_room');
        if (bossRoom && !bossRoom.isCleared && this.player.y < bossRoom.y + bossRoom.height / 2) {
            bossRoom.isCleared = true; // prevent re-triggering
            this.startDialog('Диана', 'Ты хочешь работать над проектом? А где ты был на daily stand-up в среду?', () => {
                this.scene.resume('GameScene');
                const boss = new Enemy(this, bossRoom.x, bossRoom.y, this.player);
                boss.setTexture('diana');
                boss.setData('roomId', bossRoom.id);
                this.enemies.add(boss);
            });
        }
    }
}
