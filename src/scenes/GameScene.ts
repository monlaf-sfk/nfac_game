import Phaser from 'phaser';
import Player from '../objects/Player';
import UIScene from './UIScene';
import Weapon from '../objects/Weapon';
import Enemy from '../objects/Enemy';
import Bullet from '../objects/Bullet';
import PowerUp from '../objects/PowerUp';

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
    isBossTriggered?: boolean;
    isFriendTriggered?: boolean;
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
    private powerUps!: Phaser.Physics.Arcade.Group;
    private coinCount = 0;
    public crosshair!: Phaser.GameObjects.Image;
    private rooms: Room[] = [];
    public bulletSpeed = 400;
    private computer?: Phaser.Physics.Arcade.Sprite;
    private fogOfWarOverlays!: Map<string, Phaser.GameObjects.Container>;

    constructor() {
        super('GameScene');
    }

    init(data: { gender: string }) {
        this.gender = data.gender;
    }

    create() {
        this.fogOfWarOverlays = new Map();
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
        this.powerUps = this.physics.add.group({
            classType: PowerUp,
            runChildUpdate: true
        });

        // Сначала создаем игрока
        const playerTexture = this.gender === 'boy' ? 'boy_walk_1' : 'girl_walk_1';
        this.player = new Player(this, 2500, 2500, playerTexture);

        // Теперь создаем мир, который зависит от игрока
        this.createWorld();

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.overlap(this.player, this.weapons, this.pickUpWeapon, undefined, this);
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.collider(this.player, this.enemies, this.playerHitByEnemy, undefined, this);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.bullets, this.walls, this.bulletHitWall, undefined, this);
        this.physics.add.collider(this.bullets, this.enemies, this.bulletHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 5000, 5000);

        this.crosshair = this.add.image(0, 0, 'crosshair');
        this.crosshair.setDepth(100); // Убедимся, что прицел поверх всего
        this.input.setDefaultCursor('none'); // Скрываем системный курсор
        
        const corridors = this.getCorridorDefs();
        this.scene.launch('UIScene', { parentScene: this });
        this.scene.launch('MinimapScene', { gameScene: this, rooms: this.rooms, corridors });
        this.scene.bringToTop('UIScene');
        this.scene.bringToTop('MinimapScene');

        this.scene.pause('GameScene');
        this.scene.launch('NotificationScene', { 
            parentSceneKey: 'GameScene',
            text: [
                'Welcome to the nfactorial incubator 2025!',
                'To pass it you will need to:',
                '',
                '- Defeat members to get promo coins',
                '- Defeat mini-bosses to learn',
                '- Defeat bosses to check your skills'
            ],
            leftImage: { key: 'dialogue_arman', scale: 0.02 },
            rightImage: { key: 'nfactorial_logo', scale: 0.1 }
        });
    }

    createWorld() {
        const roomSize = { width: 768, height: 640 };
        const bottomRoomY = 3396;

        this.rooms = [
            { id: 'room1', x: 2500, y: 2500, ...roomSize, enemies: [], coins: [{ name: 'coin_link', count: 1 }], isCleared: true, openings: { left: true, right: true, bottom: true } },
            { id: 'room2', x: 1476, y: 2500, ...roomSize, enemies: [{ type: 'spirit', count: 3 }, { type: 'guard', count: 1 }], coins: [{ name: 'coin_inst', count: 2 }], isCleared: false, openings: { right: true, bottom: true } },
            { id: 'room3', x: 3524, y: 2500, ...roomSize, enemies: [{ type: 'cleaner', count: 2 }, { type: 'spirit', count: 2 }, { type: 'guard', count: 1 }], coins: [{ name: 'coin_tiktok', count: 1 }], isCleared: false, openings: { left: true, top: true } },
            { id: 'miniboss_room', x: 3524, y: 1604, ...roomSize, enemies: [], coins: [], isCleared: false, openings: { top: true, bottom: true }, isBossTriggered: false },
            { id: 'boss_room', x: 3524, y: 708, ...roomSize, enemies: [], coins: [], isCleared: false, openings: { bottom: true }, isBossTriggered: false },
            { id: 'bottom_left_room', x: 1476, y: bottomRoomY, ...roomSize, enemies: [{ type: 'spirit', count: 3 }], coins: [{ name: 'coin_threads', count: 1 }], isCleared: false, openings: { top: true, right: true } },
            { id: 'bottom_center_room', x: 2500, y: bottomRoomY, ...roomSize, enemies: [{ type: 'spirit', count: 3 }], coins: [{ name: 'coin_twitter', count: 1 }], isCleared: false, openings: { top: true, left: true } }
        ];

        this.rooms.forEach(room => {
            this.createRoom(room.x, room.y, room.openings);
        });

        this.rooms.forEach(room => {
            if (room.id.includes('boss') || room.id.includes('miniboss')) {
                const roomWidth = 12 * 64;
                const roomHeight = 10 * 64;
    
                const overlayRect = this.add.rectangle(room.x, room.y, roomWidth, roomHeight, 0x000000, 0.9);
                overlayRect.setDepth(50);
    
                const questionMark = this.add.text(room.x, room.y, '?', {
                    fontSize: '128px',
                    color: '#fff',
                    fontStyle: 'bold'
                }).setOrigin(0.5);
                questionMark.setDepth(51);
    
                const container = this.add.container(0, 0, [overlayRect, questionMark]);
                this.fogOfWarOverlays.set(room.id, container);
            }
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

        this.placeDoor(minibossRoom.x, 2100, 'miniboss_door');

        const eligibleRooms = this.rooms.filter(r => r.id !== 'room1' && !r.id.includes('boss'));
        const selectedRoom = Phaser.Utils.Array.GetRandom(eligibleRooms);
        if (selectedRoom) {
            const powerUpX = Phaser.Math.Between(selectedRoom.x - selectedRoom.width / 4, selectedRoom.x + selectedRoom.width / 4);
            const powerUpY = Phaser.Math.Between(selectedRoom.y - selectedRoom.height / 4, selectedRoom.y + selectedRoom.height / 4);
            this.powerUps.add(new PowerUp(this, powerUpX, powerUpY, 'nfactorial_logo'));
        }

        const triggerZone = this.add.zone(minibossRoom.x, 2200, 128, 64);
        this.physics.world.enable(triggerZone);
        (triggerZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        (triggerZone.body as Phaser.Physics.Arcade.Body).moves = false;
        
        this.physics.add.overlap(this.player, triggerZone, () => {
            if (this.coinCount < 5) {
                this.scene.pause('GameScene');
                this.scene.launch('NotificationScene', {
                    parentSceneKey: 'GameScene',
                    text: "It's too early, dude. Go collect 5 promotions and kill everyone!",
                    leftImage: { key: 'question_mark', scale: 0.2 }
                });
                // Disable the trigger zone to prevent repeated notifications
                (triggerZone.body as Phaser.Physics.Arcade.Body).enable = false;
                // Re-enable after a delay
                this.time.delayedCall(5000, () => {
                    (triggerZone.body as Phaser.Physics.Arcade.Body).enable = true;
                });
            }
        }, undefined, this);

        this.weapons.add(new Weapon(this, room1.x, room1.y, 'ak-47'));

        this.rooms.forEach(room => {
            this.spawnEnemies(room);
        });

        this.events.on('enemy-died', this.handleEnemyDeath, this);
    }

    handleEnemyDeath(enemy: Enemy) {
        const roomId = enemy.getData('roomId');
        enemy.destroy();
        if (roomId) {
            this.checkRoomCompletion(roomId);
        }
    }

    getCorridorDefs() {
        const room1 = this.rooms.find(r => r.id === 'room1')!;
        const room2 = this.rooms.find(r => r.id === 'room2')!;
        const room3 = this.rooms.find(r => r.id === 'room3')!;
        const minibossRoom = this.rooms.find(r => r.id === 'miniboss_room')!;
        const bossRoom = this.rooms.find(r => r.id === 'boss_room')!;
        const bottomLeftRoom = this.rooms.find(r => r.id === 'bottom_left_room')!;
        const bottomCenterRoom = this.rooms.find(r => r.id === 'bottom_center_room')!;

        return [
            { x1: room2.x, y1: room2.y, x2: room1.x, y2: room1.y, horizontal: true },
            { x1: room1.x, y1: room1.y, x2: room3.x, y2: room3.y, horizontal: true },
            { x1: minibossRoom.x, y1: minibossRoom.y, x2: room3.x, y2: room3.y, horizontal: false },
            { x1: bossRoom.x, y1: bossRoom.y, x2: minibossRoom.x, y2: minibossRoom.y, horizontal: false },
            { x1: room1.x, y1: room1.y, x2: bottomCenterRoom.x, y2: bottomCenterRoom.y, horizontal: false },
            { x1: room2.x, y1: room2.y, x2: bottomLeftRoom.x, y2: bottomLeftRoom.y, horizontal: false },
            { x1: bottomLeftRoom.x, y1: bottomLeftRoom.y, x2: bottomCenterRoom.x, y2: bottomCenterRoom.y, horizontal: true },
        ];
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
        const room = this.rooms.find(r => r.id === roomId);
        if (!room || room.isCleared) {
            return;
        }

        const remainingEnemies = this.enemies.getChildren().filter(e => e.getData('roomId') === roomId && e.active);
        if (remainingEnemies.length === 0) {
            room.isCleared = true;
            this.spawnCoins(room);
            if (room.id === 'bottom_center_room') {
                const friend = this.physics.add.sprite(room.x - room.width / 4, room.y - room.height / 4, 'friend_almas').setScale(0.05).setInteractive();
                friend.setData('friendId', 'almas');
            }
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
                    this.walls.create(x, y, 'wall_placeholder').setOrigin(0).setScale(0.5).refreshBody();
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
            this.walls.create(x, y - corridorWidth / 2 - wallSize, 'wall_placeholder').setOrigin(0).setScale(0.5).refreshBody();
            this.walls.create(x, y + corridorWidth / 2, 'wall_placeholder').setOrigin(0).setScale(0.5).refreshBody();
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
            this.walls.create(x - corridorWidth / 2 - wallSize, y, 'wall_placeholder').setOrigin(0).setScale(0.5).refreshBody();
            this.walls.create(x + corridorWidth / 2, y, 'wall_placeholder').setOrigin(0).setScale(0.5).refreshBody();
        }
    }

    placeDoor(x: number, y: number, doorId: string) {
        // Помечаем ОБЕ части двери одним ID
        const door1 = this.doors.create(x - 64, y, 'door_placeholder').setOrigin(0).refreshBody();
        door1.setData('doorId', doorId);
        
        const door2 = this.doors.create(x, y, 'door_placeholder').setOrigin(0).refreshBody();
        door2.setData('doorId', doorId);
    }

    collectCoin(player: Phaser.Physics.Arcade.Sprite, coin: Phaser.Physics.Arcade.Sprite) {
        coin.destroy();
        this.coinCount++;
        const uiScene = this.scene.get('UIScene') as UIScene;
        uiScene.updateCoinCount(this.coinCount);

        if (this.coinCount >= 5) {
            this.openDoor('miniboss_door');
            this.scene.pause('GameScene');
            this.scene.launch('NotificationScene', {
                parentSceneKey: 'GameScene',
                text: 'You have done 5 promotions, now you can go to mini-boss to defeat him! Gates is open!',
                leftImage: { key: 'dialogue_arman', scale: 0.02 },
                rightImage: { key: 'nfactorial_logo', scale: 0.1 }
            });
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
        const bullet = this.bullets.get(x, y, 'bullet') as Bullet;
        if (bullet) {
            bullet.fire(x, y, angle, this.bulletSpeed);
        }
    }

    bulletHitWall(bullet, wall) {
        bullet.destroy();
    }

    bulletHitEnemy(bullet: Bullet, enemy: Enemy) {
        const roomId = enemy.getData('roomId'); // Получаем ID комнаты ДО уничтожения врага
        bullet.destroy();
        const isDead = enemy.takeDamage(50);
        if (isDead) {

            if (roomId === 'miniboss_room' && enemy.texture.key === 'abai') {
                this.scene.pause('GameScene');
                this.scene.launch('NotificationScene', {
                    parentSceneKey: 'GameScene',
                    text: 'You have defeated mini-boss: Abai, now you can go to main boss! Gates is open!',
                    leftImage: { key: 'dialogue_arman', scale: 0.02 },
                    rightImage: { key: 'nfactorial_logo', scale: 0.1 }
                });
            }

            const bossRoom = this.rooms.find(r => r.id === 'boss_room');
            if (bossRoom && roomId === bossRoom.id && enemy.texture.key === 'diana') {
                this.spawnComputer(bossRoom.x, bossRoom.y);
            }
        }
    }

    spawnComputer(x: number, y: number) {
        this.computer = this.physics.add.sprite(x, y, 'pc');
        this.computer.setScale(0.1);
        this.computer.setInteractive();
        this.physics.add.overlap(this.player, this.computer, this.interactWithComputer, undefined, this);
    }

    interactWithComputer() {
        if (this.computer) {
            this.scene.launch('BackendActivationScene');
            this.scene.pause('GameScene');
        }
    }

    playerHitByEnemy(player, enemy) {
        if (this.player.isInvulnerable()) return;

        this.player.takeDamage(10);
        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene) {
            uiScene.updateHP(this.player.health);
        }

        if (this.player.health <= 0) {
            this.scene.stop('GameScene');
            this.scene.stop('UIScene');
            this.scene.stop('MinimapScene');
            this.scene.start('GameOverScene', { win: false });
        }
    }

    private startDialog(dialogue: { title: string; text: string; portraitKey: string }[], onComplete: () => void) {
        this.scene.pause('GameScene');
        this.scene.launch('DialogScene', { dialogue, onComplete });
        this.scene.bringToTop('DialogScene');
    }

    update(time: number, delta: number) {
        this.player.update(time, delta);
        this.enemies.getChildren().forEach(enemy => (enemy as Enemy).update());

        if (this.crosshair) {
            const pointer = this.input.activePointer;
            this.crosshair.setPosition(pointer.worldX, pointer.worldY);

            if (this.player.weapon) {
                this.player.weapon.updateAttached(this.player);
                if (pointer.isDown) {
                    this.player.weapon.fire(this.player, time);
                }
            }
        }

        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene) {
            uiScene.updateHP(this.player.health);
        }

        const playerPortrait = this.gender === 'male' ? 'dialogue_boy_player' : 'dialogue_girl_player';

        const almasRoom = this.rooms.find(r => r.id === 'bottom_center_room');
        const playerBounds = this.player.getBounds();
        if (almasRoom && almasRoom.isCleared && !almasRoom.isFriendTriggered) {
            const almasSprite = this.children.list.find(child => child.getData && child.getData('friendId') === 'almas');
            if (almasSprite) {
                const almasBounds = (almasSprite as Phaser.GameObjects.Sprite).getBounds();
                if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, almasBounds)) {
                    almasRoom.isFriendTriggered = true;
                    const almasDialogue = [
                        { title: 'Игрок', text: 'Алмас, я дошёл почти до финала этажа.', portraitKey: playerPortrait },
                        { title: 'Алмас', text: 'Брат, ты вообще красавчик. Главное — не перегори. Ты ж не GPT, чтобы 24/7.', portraitKey: 'dialogue_almas' },
                        { title: 'Игрок', text: 'Спасибо, стараюсь.', portraitKey: playerPortrait },
                        { title: 'Алмас', text: 'Пей воду, общайся, не забывай про жизнь за пределами лаптопа. Мы тут не просто коды пишем — мы кайфуем.', portraitKey: 'dialogue_almas' },
                        { title: 'Игрок', text: 'Принято. Спасибо за вайб.', portraitKey: playerPortrait },
                        { title: 'Алмас', text: 'Всегда рад. Жми на full power — ты на правильном пути.', portraitKey: 'dialogue_almas' }
                    ];
                    this.startDialog(almasDialogue, () => {
                        this.scene.resume('GameScene');
                    });
                }
            }
        }
        
        // Check for boss triggers
        const minibossRoom = this.rooms.find(r => r.id === 'miniboss_room');
        if (minibossRoom && !minibossRoom.isBossTriggered && this.player.y < minibossRoom.y + minibossRoom.height / 2 + 100) {
            minibossRoom.isBossTriggered = true; // prevent re-triggering
            const abaiDialogue = [
                { title: 'Игрок', text: 'Я определился с идеей и уже сделал 5 промоушенов, так научи меня бэку и помоги его сделать!', portraitKey: playerPortrait },
                { title: 'Абай', text: 'СДЕЛАЙ ДОМАШКУ ПО БЭКУ, НАУЧИСЬ FASTAPI И ПОТОМ ТОЛЬКО ПРИХОДИ.', portraitKey: 'dialogue_abai' },
                { title: 'Игрок', text: 'Я уже всё знаю!', portraitKey: playerPortrait },
                { title: 'Абай', text: 'ТАК ДОКАЖИ ЖЕ МНЕ!', portraitKey: 'dialogue_abai' }
            ];
            this.startDialog(abaiDialogue, () => {
                this.scene.resume('GameScene');

                const overlay = this.fogOfWarOverlays.get(minibossRoom.id);
                if (overlay) {
                    overlay.destroy();
                    this.fogOfWarOverlays.delete(minibossRoom.id);
                }

                const boss = new Enemy(this, minibossRoom.x, minibossRoom.y, this.player);
                boss.anims.stop();
                boss.setTexture('abai');
                boss.setScale(0.02);
                boss.health = 500;
                boss.setData('roomId', minibossRoom.id);
                this.enemies.add(boss);
                if (boss.body) {
                    boss.body.setSize(boss.width, boss.height);
                }
            });
        }

        const bossRoom = this.rooms.find(r => r.id === 'boss_room');
        if (bossRoom && !bossRoom.isBossTriggered && this.player.y < bossRoom.y + bossRoom.height / 2 + 100) {
            bossRoom.isBossTriggered = true; // prevent re-triggering
            const dianaDialogue = [
                { title: 'Диана', text: 'Ты хочешь работать над проектом? А где ты был на daily stand-up в среду?', portraitKey: 'dialogue_diana' },
                { title: 'Игрок', text: 'Я кодил ночью, не успел встать. Но всё готово.', portraitKey: playerPortrait },
                { title: 'Диана', text: 'У нас тут не ночлежка, а инкубатор. Пропуски, тишина в канале, отсутствие активности — ты должен это компенсировать.', portraitKey: 'dialogue_diana' },
                { title: 'Игрок', text: 'Я покажу тебе прогресс и активность.', portraitKey: playerPortrait },
                { title: 'Диана', text: 'Давай. Один фейк — и ты в "Shadow Realm" без ревью.', portraitKey: 'dialogue_diana' }
            ];
            this.startDialog(dianaDialogue, () => {
                this.scene.resume('GameScene');

                const overlay = this.fogOfWarOverlays.get(bossRoom.id);
                if (overlay) {
                    overlay.destroy();
                    this.fogOfWarOverlays.delete(bossRoom.id);
                }
                
                const boss = new Enemy(this, bossRoom.x, bossRoom.y, this.player);
                boss.anims.stop();
                boss.setTexture('diana');
                boss.setScale(0.02);
                boss.health = 1000;
                boss.setData('roomId', bossRoom.id);
                this.enemies.add(boss);
                if (boss.body) {
                    boss.body.setSize(boss.width, boss.height);
                }
            });
        }
    }

    collectPowerUp(player: Phaser.Physics.Arcade.Sprite, powerUp: PowerUp) {
        powerUp.destroy();
        (player as Player).heal(100); // Heal to full
    }
}
