import Phaser from 'phaser';
import GameScene from './GameScene';
import Level2Scene from './Level2Scene';
import Level3Scene from './Level3Scene';

interface RoomDef {
    x: number;
    y: number;
    id: string;
}

interface CorridorDef {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    horizontal: boolean;
}

export default class MinimapScene extends Phaser.Scene {
    private mapGraphics!: Phaser.GameObjects.Graphics;
    private playerMarker!: Phaser.GameObjects.Graphics;
    private gameScene!: GameScene | Level2Scene | Level3Scene;
    private worldSize = 5000;
    private mapSize = 200;
    private mapScale: number;
    private rooms: RoomDef[] = [];
    private corridors: CorridorDef[] = [];
    private roomWidth = 12 * 64; // 768
    private roomHeight = 10 * 64; // 640
    private corridorWidth = 2 * 64; // 128

    constructor() {
        super({ key: 'MinimapScene', active: false });
        this.mapScale = this.mapSize / this.worldSize;
    }

    init(data: { gameScene: GameScene | Level2Scene | Level3Scene, rooms: any[], corridors: any[] }) {
        this.gameScene = data.gameScene;
        this.rooms = data.rooms.map(r => ({ x: r.x, y: r.y, id: r.id }));
        this.corridors = data.corridors;
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
        this.rooms.forEach(room => {
            if (room.id.includes('boss')) this.mapGraphics.fillStyle(0xcc0000, 1);
            else if (room.id.includes('miniboss')) this.mapGraphics.fillStyle(0xff8c00, 1);
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
        this.corridors.forEach(corridor => {
            if (corridor.horizontal) {
                this.drawHorizontalCorridorOnMap(corridor);
            } else {
                this.drawVerticalCorridorOnMap(corridor);
            }
        });

        // Текст
        const mapX = this.cameras.main.width - this.mapSize - 10;
        const mapY = 10;

        const bossRoomData = this.rooms.find(r => r.id.includes('boss'));
        if (bossRoomData) {
            this.add.text(mapX + bossRoomData.x * this.mapScale, mapY + bossRoomData.y * this.mapScale, 'B', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        }

        const minibossRoomData = this.rooms.find(r => r.id.includes('miniboss'));
        if (minibossRoomData) {
            this.add.text(mapX + minibossRoomData.x * this.mapScale, mapY + minibossRoomData.y * this.mapScale, 'M', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        }
    }

    drawHorizontalCorridorOnMap(corridor: CorridorDef) {
        const startX = (Math.min(corridor.x1, corridor.x2) + this.roomWidth / 2) * this.mapScale;
        const endX = (Math.max(corridor.x1, corridor.x2) - this.roomWidth / 2) * this.mapScale;
        const y = (corridor.y1 - this.corridorWidth / 2) * this.mapScale;
        this.mapGraphics.fillRect(startX, y, endX - startX, this.corridorWidth * this.mapScale);
    }

    drawVerticalCorridorOnMap(corridor: CorridorDef) {
        const startY = (Math.min(corridor.y1, corridor.y2) + this.roomHeight / 2) * this.mapScale;
        const endY = (Math.max(corridor.y1, corridor.y2) - this.roomHeight / 2) * this.mapScale;
        const x = (corridor.x1 - this.corridorWidth / 2) * this.mapScale;
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