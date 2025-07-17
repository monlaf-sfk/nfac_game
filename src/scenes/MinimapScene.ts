import Phaser from 'phaser';
import GameScene from './GameScene';
import Level2Scene from './Level2Scene';

export default class MinimapScene extends Phaser.Scene {
    private mapGraphics!: Phaser.GameObjects.Graphics;
    private playerMarker!: Phaser.GameObjects.Graphics;
    private gameScene!: GameScene | Level2Scene;
    private worldSize = 5000;
    private mapSize = 200;
    private mapScale: number;
    private roomDefs = [
        { x: 2500, y: 2500, type: 'normal' },
        { x: 2500, y: 3396, type: 'normal' },
        { x: 1476, y: 2500, type: 'normal' },
        { x: 1476, y: 3396, type: 'normal' },
        { x: 3524, y: 2500, type: 'normal' },
        { x: 3524, y: 1604, type: 'miniboss' },
        { x: 3524, y: 708,  type: 'boss' }
    ];
    private roomWidth = 12 * 64; // 768
    private roomHeight = 10 * 64; // 640
    private corridorWidth = 2 * 64; // 128

    constructor() {
        super({ key: 'MinimapScene', active: false });
        this.mapScale = this.mapSize / this.worldSize;
    }

    init(data: { gameScene: GameScene | Level2Scene }) {
        this.gameScene = data.gameScene;
    }

    create() {
        const mapX = this.cameras.main.width - this.mapSize - 10;
        const mapY = 10;

        const border = this.add.graphics();
        border.fillStyle(0x000000, 0.7);
        border.fillRect(mapX, mapY, this.mapSize, this.mapSize);
        border.lineStyle(2, 0xffffff, 1);
        border.strokeRect(mapX, mapY, this.mapSize, this.mapSize);

        this.mapGraphics = this.add.graphics({ x: mapX, y: mapY });
        this.drawMap();

        this.playerMarker = this.add.graphics({ x: mapX, y: mapY });
    }

    drawMap() {
        this.mapGraphics.clear();
        
        // Рисуем комнаты
        this.roomDefs.forEach(room => {
            if (room.type === 'boss') this.mapGraphics.fillStyle(0xcc0000, 1);
            else if (room.type === 'miniboss') this.mapGraphics.fillStyle(0xff8c00, 1);
            else this.mapGraphics.fillStyle(0x777777, 1);
            
            this.mapGraphics.fillRect(
                (room.x - this.roomWidth / 2) * this.mapScale,
                (room.y - this.roomHeight / 2) * this.mapScale,
                this.roomWidth * this.mapScale,
                this.roomHeight * this.mapScale
            );
        });

        // Рисуем коридоры
        this.mapGraphics.fillStyle(0x777777, 1);
        
        const r = this.roomDefs;
        // Горизонтальные
        this.drawHorizontalCorridorOnMap(r[2], r[0]);
        this.drawHorizontalCorridorOnMap(r[0], r[4]);
        // Вертикальные
        this.drawVerticalCorridorOnMap(r[0], r[1]);
        this.drawVerticalCorridorOnMap(r[2], r[3]);
        this.drawVerticalCorridorOnMap(r[5], r[4]);
        this.drawVerticalCorridorOnMap(r[6], r[5]);

        // Текст
        const mapX = this.cameras.main.width - this.mapSize - 10;
        const mapY = 10;
        const bossRoomData = this.roomDefs.find(r => r.type === 'boss')!;
        this.add.text(mapX + (bossRoomData.x) * this.mapScale, mapY + (bossRoomData.y) * this.mapScale, 'B', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        const minibossRoomData = this.roomDefs.find(r => r.type === 'miniboss')!;
        this.add.text(mapX + (minibossRoomData.x) * this.mapScale, mapY + (minibossRoomData.y) * this.mapScale, 'M', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    }

    drawHorizontalCorridorOnMap(room1: any, room2: any) {
        const startX = (Math.min(room1.x, room2.x) + this.roomWidth / 2) * this.mapScale;
        const endX = (Math.max(room1.x, room2.x) - this.roomWidth / 2) * this.mapScale;
        const y = (room1.y - this.corridorWidth / 2) * this.mapScale;
        this.mapGraphics.fillRect(startX, y, endX - startX, this.corridorWidth * this.mapScale);
    }

    drawVerticalCorridorOnMap(room1: any, room2: any) {
        const startY = (Math.min(room1.y, room2.y) + this.roomHeight / 2) * this.mapScale;
        const endY = (Math.max(room1.y, room2.y) - this.roomHeight / 2) * this.mapScale;
        const x = (room1.x - this.corridorWidth / 2) * this.mapScale;
        this.mapGraphics.fillRect(x, startY, this.corridorWidth * this.mapScale, endY - startY);
    }


    update() {
        if (!this.gameScene || !this.gameScene.player) {
            return;
        }

        this.playerMarker.clear();
        this.playerMarker.fillStyle(0xff0000, 1);

        const playerMapX = this.gameScene.player.x * this.mapScale;
        const playerMapY = this.gameScene.player.y * this.mapScale;

        this.playerMarker.fillCircle(playerMapX, playerMapY, 3);
    }
} 