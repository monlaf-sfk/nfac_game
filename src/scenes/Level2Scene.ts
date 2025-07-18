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
    isBossTriggered?: boolean;
    isFriendTriggered?: boolean;
}

export default class Level2Scene extends Phaser.Scene {
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
    public bulletSpeed = 400;
    private computer?: Phaser.Physics.Arcade.Sprite;
    private fogOfWarOverlays!: Map<string, Phaser.GameObjects.Container>;

    constructor() {
        super('Level2Scene');
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

        const playerTexture = this.gender === 'boy' ? 'boy_walk_1' : 'girl_walk_1';
        this.player = new Player(this, 2500, 2500, playerTexture);

        this.createWorld();

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.doors);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.overlap(this.player, this.weapons, this.pickUpWeapon as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.collider(this.player, this.enemies, this.playerHitByEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.bullets, this.walls, this.bulletHitWall as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.collider(this.bullets, this.enemies, this.bulletHitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setBounds(0, 0, 5000, 5000);
        this.cameras.main.setZoom(1);

        this.crosshair = this.add.image(0, 0, 'crosshair');
        this.crosshair.setDepth(100);
        this.input.setDefaultCursor('none');

        const corridors = this.getCorridorDefs();
        this.scene.launch('UIScene', { parentScene: this });
        this.scene.launch('MinimapScene', { gameScene: this, rooms: this.rooms, corridors });
        this.scene.bringToTop('UIScene');
        this.scene.bringToTop('MinimapScene');
    }

    createWorld() {
        const roomSize = { width: 768, height: 640 };
        const bottomRoomY = 3396;

        this.rooms = [
            { id: 'start', x: 2500, y: 2500, ...roomSize, enemies: [], coins: [], isCleared: true, openings: { left: true, right: true, top: true } },
            { id: 'dead_end', x: 2500, y: 1604, ...roomSize, enemies: [{ type: 'spirit', count: 4 }], coins: [{ name: 'coin_inst', count: 2 }], isCleared: false, openings: { bottom: true } },
            { id: 'left_1', x: 1476, y: 2500, ...roomSize, enemies: [{ type: 'spirit', count: 3 }], coins: [{ name: 'coin_link', count: 1 }], isCleared: false, openings: { right: true, left: true } },
            { id: 'left_2', x: 452, y: 2500, ...roomSize, enemies: [{ type: 'spirit', count: 5 }], coins: [{ name: 'coin_tiktok', count: 1 }], isCleared: false, openings: { right: true, bottom: true } },
            { id: 'bottom_left', x: 452, y: bottomRoomY, ...roomSize, enemies: [{ type: 'spirit', count: 2 }, { type: 'guard', count: 1 }], coins: [{ name: 'coin_threads', count: 1 }], isCleared: false, openings: { top: true }, isFriendTriggered: false },
            { id: 'miniboss', x: 3524, y: 2500, ...roomSize, enemies: [], coins: [{ name: 'coin_twitter', count: 1 }], isCleared: false, openings: { left: true, top: true }, isBossTriggered: false },
            { id: 'boss', x: 3524, y: 1604, ...roomSize, enemies: [], coins: [{ name: 'coin_inst', count: 2 }], isCleared: false, openings: { bottom: true }, isBossTriggered: false }
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

        const startRoom = this.rooms.find(r => r.id === 'start')!;
        const deadEndRoom = this.rooms.find(r => r.id === 'dead_end')!;
        const leftRoom1 = this.rooms.find(r => r.id === 'left_1')!;
        const leftRoom2 = this.rooms.find(r => r.id === 'left_2')!;
        const bottomLeftRoom = this.rooms.find(r => r.id === 'bottom_left')!;
        const minibossRoom = this.rooms.find(r => r.id === 'miniboss')!;
        const bossRoom = this.rooms.find(r => r.id === 'boss')!;

        this.createVerticalCorridor(deadEndRoom.y, startRoom.y, startRoom.x);
        this.createHorizontalCorridor(leftRoom1.x, startRoom.x, startRoom.y);
        this.createHorizontalCorridor(leftRoom2.x, leftRoom1.x, leftRoom1.y);
        this.createVerticalCorridor(leftRoom2.y, bottomLeftRoom.y, leftRoom2.x);
        this.createHorizontalCorridor(startRoom.x, minibossRoom.x, startRoom.y);
        this.createVerticalCorridor(bossRoom.y, minibossRoom.y, minibossRoom.x);

        this.placeDoor(minibossRoom.x - 498, minibossRoom.y, 'miniboss_door_1', true);

        const triggerZone = this.add.zone(minibossRoom.x - 498 - 64, minibossRoom.y, 64, 128);
        this.physics.world.enable(triggerZone);
        (triggerZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        (triggerZone.body as Phaser.Physics.Arcade.Body).moves = false;
        
        this.physics.add.overlap(this.player, triggerZone, () => {
            if (this.coinCount < 5) {
                this.scene.pause('Level2Scene');
                this.scene.launch('NotificationScene', {
                    parentSceneKey: 'Level2Scene',
                    text: "It's too early, dude. Go collect 5 promotions and kill everyone!",
                    leftImage: { key: 'question_mark', scale: 0.2 }
                });
                (triggerZone.body as Phaser.Physics.Arcade.Body).enable = false;
                this.time.delayedCall(5000, () => {
                    (triggerZone.body as Phaser.Physics.Arcade.Body).enable = true;
                });
            }
        }, undefined, this);

        this.placeDoor(bossRoom.x, bossRoom.y + 420, 'boss_door_1', false);

        this.weapons.add(new Weapon(this, startRoom.x, startRoom.y, 'ak-47'));

        this.rooms.forEach(room => {
            this.spawnEnemies(room);
        });
    }

    getCorridorDefs() {
        const startRoom = this.rooms.find(r => r.id === 'start')!;
        const deadEndRoom = this.rooms.find(r => r.id === 'dead_end')!;
        const leftRoom1 = this.rooms.find(r => r.id === 'left_1')!;
        const leftRoom2 = this.rooms.find(r => r.id === 'left_2')!;
        const bottomLeftRoom = this.rooms.find(r => r.id === 'bottom_left')!;
        const minibossRoom = this.rooms.find(r => r.id === 'miniboss')!;
        const bossRoom = this.rooms.find(r => r.id === 'boss')!;

        return [
            { x1: deadEndRoom.x, y1: deadEndRoom.y, x2: startRoom.x, y2: startRoom.y, horizontal: false },
            { x1: leftRoom1.x, y1: leftRoom1.y, x2: startRoom.x, y2: startRoom.y, horizontal: true },
            { x1: leftRoom2.x, y1: leftRoom2.y, x2: leftRoom1.x, y2: leftRoom1.y, horizontal: true },
            { x1: leftRoom2.x, y1: leftRoom2.y, x2: bottomLeftRoom.x, y2: bottomLeftRoom.y, horizontal: false },
            { x1: startRoom.x, y1: startRoom.y, x2: minibossRoom.x, y2: minibossRoom.y, horizontal: true },
            { x1: bossRoom.x, y1: bossRoom.y, x2: minibossRoom.x, y2: minibossRoom.y, horizontal: false },
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
            if (roomId === 'miniboss') {
                this.openDoor('miniboss_door_1');
                this.openDoor('miniboss_exit_door');
                this.openDoor('boss_door_1');
                const friend = this.physics.add.sprite(room.x + room.width / 4, room.y - room.height / 4, 'friend_igor').setScale(0.05).setInteractive();
                friend.setData('friendId', 'igor');
            }
            if (roomId === 'boss') {
                this.openDoor('boss_exit_door');
                this.spawnComputer(room.x, room.y);
            }
        }
    }

    spawnCoins(room: Room) {
        room.coins.forEach(coinInfo => {
            for (let i = 0; i < coinInfo.count; i++) {
                const x = Phaser.Math.Between(room.x - room.width / 4, room.x + room.width / 4);
                const y = Phaser.Math.Between(room.y - room.height / 4, room.y + room.height / 4);
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

    createHorizontalCorridor(x1: number, x2: number, y: number) {
        const wallSize = 64;
        const roomWidth = 12 * wallSize;
        const corridorWidth = 2 * wallSize;
        const startX = Math.min(x1, x2) + roomWidth / 2;
        const endX = Math.max(x1, x2) - roomWidth / 2;
        const corridorLength = endX - startX;

        this.add.tileSprite(startX, y - corridorWidth / 2, corridorLength, corridorWidth, 'floor_placeholder').setOrigin(0);

        for (let i = startX; i < endX; i += wallSize) {
            this.walls.create(i, y - corridorWidth / 2 - wallSize, 'wall_placeholder').setOrigin(0).refreshBody();
            this.walls.create(i, y + corridorWidth / 2, 'wall_placeholder').setOrigin(0).refreshBody();
        }
    }

    createVerticalCorridor(y1: number, y2: number, x: number) {
        const wallSize = 64;
        const roomHeight = 10 * wallSize;
        const corridorWidth = 2 * wallSize;
        const startY = Math.min(y1, y2) + roomHeight / 2;
        const endY = Math.max(y1, y2) - roomHeight / 2;
        const corridorLength = endY - startY;

        this.add.tileSprite(x - corridorWidth / 2, startY, corridorWidth, corridorLength, 'floor_placeholder').setOrigin(0);

        for (let i = startY; i < endY; i += wallSize) {
            this.walls.create(x - corridorWidth / 2 - wallSize, i, 'wall_placeholder').setOrigin(0).refreshBody();
            this.walls.create(x + corridorWidth / 2, i, 'wall_placeholder').setOrigin(0).refreshBody();
        }
    }

    placeDoor(x: number, y: number, doorId: string, isVertical: boolean) {
        const wallSize = 64;
        const doorTint = 0xff0000;

        if (isVertical) {
            const doorTop = this.doors.create(x, y - wallSize, 'wall_placeholder');
            doorTop.setData('doorId', doorId).setOrigin(0).refreshBody().setTint(doorTint);
    
            const doorBottom = this.doors.create(x, y, 'wall_placeholder');
            doorBottom.setData('doorId', doorId).setOrigin(0).refreshBody().setTint(doorTint);
        } else {
            const doorLeft = this.doors.create(x - wallSize, y, 'wall_placeholder');
            doorLeft.setData('doorId', doorId).setOrigin(0).refreshBody().setTint(doorTint);

            const doorRight = this.doors.create(x, y, 'wall_placeholder');
            doorRight.setData('doorId', doorId).setOrigin(0).refreshBody().setTint(doorTint);
        }
    }

    collectCoin(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, coin: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        (coin as Phaser.Physics.Arcade.Sprite).destroy();
        this.coinCount++;
        const ui = this.scene.get('UIScene') as UIScene;
        ui.updateCoinCount(this.coinCount);

        if (this.coinCount >= 5) {
            this.openDoor('miniboss_door_1');
            this.scene.pause('Level2Scene');
            this.scene.launch('NotificationScene', {
                parentSceneKey: 'Level2Scene',
                text: 'You have done 5 promotions, now you can go to mini-boss to defeat him! Gates is open!',
                leftImage: { key: 'dialogue_arman', scale: 0.02 },
                rightImage: { key: 'nfactorial_logo', scale: 0.1 }
            });
        }
    }

    openDoor(doorId: string) {
        const doorsToDestroy: Phaser.GameObjects.GameObject[] = [];
        this.doors.getChildren().forEach(door => {
            if (door.getData('doorId') === doorId) {
                doorsToDestroy.push(door);
            }
        });
        doorsToDestroy.forEach(door => door.destroy());
    }

    pickUpWeapon(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, weapon: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const playerSprite = player as Player;
        const weaponSprite = weapon as Weapon;
        playerSprite.setWeapon(weaponSprite);
        weaponSprite.setOwner(playerSprite);
    }

    fireBullet(x: number, y: number, angle: number) {
        const bullet = this.bullets.get(x, y, 'bullet') as Bullet;
        if (bullet) {
            bullet.fire(x, y, angle, this.bulletSpeed);
        }
    }

    bulletHitWall(bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody, wall: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        bullet.destroy();
    }

    bulletHitEnemy(bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        const enemySprite = enemy as Enemy;
        (bullet as Phaser.Physics.Arcade.Sprite).destroy();
        const isDead = enemySprite.takeDamage(50);
        if (isDead) {
            const roomId = enemySprite.getData('roomId');
            this.checkRoomCompletion(roomId);

            if (roomId === 'miniboss' && enemySprite.texture.key === 'bahredin') {
                this.scene.pause('Level2Scene');
                this.scene.launch('NotificationScene', {
                    parentSceneKey: 'Level2Scene',
                    text: 'You have defeated mini-boss: Bahredin, now you can go to main boss! Gates is open!',
                    leftImage: { key: 'dialogue_arman', scale: 0.02 },
                    rightImage: { key: 'nfactorial_logo', scale: 0.1 }
                });
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
            this.scene.launch('FrontendActivationScene');
            this.scene.pause();
        }
    }

    playerHitByEnemy(player: Phaser.Types.Physics.Arcade.GameObjectWithBody, enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
        if (this.player.isInvulnerable()) return;
        this.player.takeDamage(10);
        const uiScene = this.scene.get('UIScene') as UIScene;
        if (uiScene) {
            uiScene.updateHP(this.player.health);
        }

        if (this.player.health <= 0) {
            this.scene.stop('Level2Scene');
            this.scene.stop('UIScene');
            this.scene.stop('MinimapScene');
            this.scene.start('GameOverScene', { win: false });
        }
    }

    private startDialog(dialogue: { title: string; text: string; portraitKey: string }[], onComplete: () => void) {
        this.scene.pause('Level2Scene');
        this.scene.launch('DialogScene', { dialogue, onComplete });
        this.scene.bringToTop('DialogScene');
    }

    update(time: number, delta: number) {
        this.player.update(time, delta);
        this.enemies.getChildren().forEach(enemy => (enemy as Enemy).update());

        const pointer = this.input.activePointer;
        const camera = this.cameras.main;
        const worldX = pointer.x + camera.scrollX;
        const worldY = pointer.y + camera.scrollY;

        if (this.crosshair) {
            this.crosshair.setPosition(worldX, worldY);

            if (this.player.weapon) {
            this.player.weapon.updateAttached(this.player);
                if (pointer.isDown) {
                this.player.weapon.fire(this.player, time);
                }
            }
        }

        const playerPortrait = this.gender === 'male' ? 'dialogue_boy_player' : 'dialogue_girl_player';

        const minibossRoom = this.rooms.find(r => r.id === 'miniboss')!;
        if (!minibossRoom.isBossTriggered && this.player.x > minibossRoom.x - minibossRoom.width / 2 && this.player.x < minibossRoom.x + minibossRoom.width/2 && this.player.y > minibossRoom.y - minibossRoom.height/2 && this.player.y < minibossRoom.y + minibossRoom.height/2) {
            minibossRoom.isBossTriggered = true;
            const bahredinDialogue = [
                { title: 'Игрок', text: 'Бахредин, я готов показать тебе свой дизайн.', portraitKey: playerPortrait },
                { title: 'Бахредин', text: 'Дизайн? Ты думаешь, пара картинок в Figma — это дизайн? Где твои user flow, где CJM? Ты хотя бы с пользователями говорил?', portraitKey: 'dialogue_bahredin' },
                { title: 'Игрок', text: 'Я... я думал, это не так важно на старте.', portraitKey: playerPortrait },
                { title: 'Бахредин', text: 'Не важно?! Ты строишь дом без фундамента! Иди и не возвращайся, пока у тебя не будет полноценного исследования. А пока — докажи, что ты хотя бы можешь защитить свои "идеи"!', portraitKey: 'dialogue_bahredin' }
            ];

            this.startDialog(bahredinDialogue, () => {
                this.scene.resume('Level2Scene');

                const overlay = this.fogOfWarOverlays.get(minibossRoom.id);
                if (overlay) {
                    overlay.destroy();
                    this.fogOfWarOverlays.delete(minibossRoom.id);
                }

                this.openDoor('miniboss_door_1'); // Open door behind
                this.placeDoor(minibossRoom.x, minibossRoom.y + minibossRoom.height / 2 - 32, 'miniboss_exit_door', true); // Close door in front
        
                const boss = new Enemy(this, minibossRoom.x, minibossRoom.y, this.player);
                boss.setTexture('bahredin');
                boss.setData('roomId', minibossRoom.id);
                this.enemies.add(boss);
                boss.setScale(0.03);
                boss.health = 500;
                if (boss.body) {
                    boss.body.setSize(boss.width, boss.height);
                }
            });
        }

        const bossRoom = this.rooms.find(r => r.id === 'boss')!;
        if (!bossRoom.isBossTriggered && minibossRoom.isCleared && this.player.y < bossRoom.y + bossRoom.height / 2 && this.player.y > bossRoom.y - bossRoom.height/2 && this.player.x > bossRoom.x - bossRoom.width/2 && this.player.x < bossRoom.x + bossRoom.width/2) {
            bossRoom.isBossTriggered = true;
            const asseliyDialogue = [
                { title: 'Игрок', text: 'Я прошел все испытания и готов к работе над проектом.', portraitKey: playerPortrait },
                { title: 'Аселия', text: 'Готов? Ты уверен, что понимаешь, что такое "проект"? Это не просто код, это ответственность. Ты должен быть готов к ревью 24/7.', portraitKey: 'dialogue_asseliy' },
                { title: 'Игрок', text: 'Я готов, я все сделал.', portraitKey: playerPortrait },
                { title: 'Аселия', text: 'Докажи. Покажи мне, что твой код так же хорош, как и твоя уверенность.', portraitKey: 'dialogue_asseliy' }
            ];

            this.startDialog(asseliyDialogue, () => {
                this.scene.resume('Level2Scene');

                const overlay = this.fogOfWarOverlays.get(bossRoom.id);
                if (overlay) {
                    overlay.destroy();
                    this.fogOfWarOverlays.delete(bossRoom.id);
                }

                this.openDoor('boss_door_1');
                this.placeDoor(bossRoom.x, bossRoom.y + 420, 'boss_exit_door', false); // Close door behind
                
                const boss = new Enemy(this, bossRoom.x, bossRoom.y - 100, this.player);
                boss.setTexture('asseliy');
                boss.setData('roomId', bossRoom.id);
                this.enemies.add(boss);
                boss.setScale(0.03);
                boss.health = 750;
                if (boss.body) {
                    boss.body.setSize(boss.width, boss.height);
                }
            });
        }

        const friendRoom = this.rooms.find(r => r.id === 'bottom_left')!;
        if (!friendRoom.isFriendTriggered && friendRoom.isCleared && this.player.x > friendRoom.x - friendRoom.width / 2 && this.player.x < friendRoom.x + friendRoom.width/2 && this.player.y > friendRoom.y - friendRoom.height/2 && this.player.y < friendRoom.y + friendRoom.height/2) {
            friendRoom.isFriendTriggered = true;
            const friend = this.physics.add.sprite(friendRoom.x, friendRoom.y, 'nurmek').setScale(0.15).setInteractive();
            friend.anims.play('nurmek_anim');
        }

        const igorMinibossRoom = this.rooms.find(r => r.id === 'miniboss')!;
        if (igorMinibossRoom.isCleared && !igorMinibossRoom.isFriendTriggered && this.player.x > igorMinibossRoom.x && this.player.y < igorMinibossRoom.y) {
            igorMinibossRoom.isFriendTriggered = true;
            const igorDialogue = [
                { title: 'Игрок', text: 'Игорь, привет. Я почти дошёл до Асель.', portraitKey: playerPortrait },
                { title: 'Игорь', text: 'Красава! Но помни — кодить мало. Если о тебе никто не узнает, ты как пустая репа.', portraitKey: 'dialogue_igor' },
                { title: 'Игрок', text: 'Что посоветуешь?', portraitKey: playerPortrait },
                { title: 'Игорь', text: 'Зарегистрируйся на Peerlist, заполни профиль. И не забудь про Product Hunt — там лайки = валюта внимания.', portraitKey: 'dialogue_igor' },
                { title: 'Игрок', text: 'Спасибо. Увижу тебя на homepage!', portraitKey: playerPortrait },
                { title: 'Игорь', text: 'Увидишь — если оформляешь чётко. Удачи!', portraitKey: 'dialogue_igor' }
            ];
            this.startDialog(igorDialogue, () => {
                this.scene.resume('Level2Scene');
            });
        }
    }
}
