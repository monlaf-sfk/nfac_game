import Phaser from 'phaser';
import GameScene from './GameScene';

export default class UIScene extends Phaser.Scene {
    private scoreText!: Phaser.GameObjects.Text;
    private hpText!: Phaser.GameObjects.Text;
    private coinText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'UIScene', active: false });
    }

    create() {
        this.scoreText = this.add.text(10, 10, 'Score: 0', { 
            fontSize: '24px', 
            color: '#fff' 
        });
        
        this.hpText = this.add.text(10, 40, 'HP: 100', { 
            fontSize: '24px', 
            color: '#ff0000' 
        });

        this.coinText = this.add.text(10, 70, 'Promotion: 0', {
            fontSize: '24px',
            color: '#ffd700'
        });

        if (this.game.config.physics.arcade?.debug) {
            this.createDebugMenu();
        }
    }

    createDebugMenu() {
        const gameScene = this.scene.get('GameScene') as GameScene;

        if (!gameScene || !gameScene.player) {
            this.time.delayedCall(100, this.createDebugMenu, [], this);
            return;
        }

        if (document.getElementById('debug-menu')) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'debug-menu';
        container.style.position = 'absolute';
        container.style.top = '100px';
        container.style.left = '10px';
        container.style.color = 'white';
        container.style.backgroundColor = 'rgba(0,0,0,0.5)';
        container.style.padding = '10px';
        container.style.borderRadius = '5px';
        
        // Player Speed
        const playerSpeedLabel = document.createElement('label');
        playerSpeedLabel.textContent = `Player Speed: ${gameScene.player.speed}`;
        const playerSpeedInput = document.createElement('input');
        playerSpeedInput.type = 'range';
        playerSpeedInput.min = '50';
        playerSpeedInput.max = '1000';
        playerSpeedInput.value = String(gameScene.player.speed);
        playerSpeedInput.addEventListener('input', (event) => {
            const speed = Number((event.target as HTMLInputElement).value);
            gameScene.player.speed = speed;
            playerSpeedLabel.textContent = `Player Speed: ${speed}`;
        });

        // Bullet Speed
        const bulletSpeedLabel = document.createElement('label');
        bulletSpeedLabel.textContent = `Bullet Speed: ${gameScene.bulletSpeed}`;
        const bulletSpeedInput = document.createElement('input');
        bulletSpeedInput.type = 'range';
        bulletSpeedInput.min = '100';
        bulletSpeedInput.max = '2000';
        bulletSpeedInput.value = String(gameScene.bulletSpeed);
        bulletSpeedInput.addEventListener('input', (event) => {
            const speed = Number((event.target as HTMLInputElement).value);
            gameScene.bulletSpeed = speed;
            bulletSpeedLabel.textContent = `Bullet Speed: ${speed}`;
        });

        container.appendChild(playerSpeedLabel);
        container.appendChild(document.createElement('br'));
        container.appendChild(playerSpeedInput);
        container.appendChild(document.createElement('br'));
        container.appendChild(bulletSpeedLabel);
        container.appendChild(document.createElement('br'));
        container.appendChild(bulletSpeedInput);

        // Player Health
        const healthButton = document.createElement('button');
        healthButton.textContent = 'Increase HP (+25)';
        healthButton.style.marginTop = '10px';
        healthButton.style.padding = '5px';
        healthButton.style.backgroundColor = '#4CAF50';
        healthButton.style.border = 'none';
        healthButton.style.color = 'white';
        healthButton.style.cursor = 'pointer';
        healthButton.addEventListener('click', () => {
            gameScene.player.health += 25;
            this.updateHP(gameScene.player.health);
        });

        container.appendChild(document.createElement('br'));
        container.appendChild(healthButton);

        document.body.appendChild(container);

        this.events.on('shutdown', () => {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        });
    }

    updateScore(score: number) {
        this.scoreText.setText(`Score: ${score}`);
    }

    updateHP(hp: number) {
        this.hpText.setText(`HP: ${hp}`);
    }

    updateCoinCount(count: number) {
        this.coinText.setText(`Promotion: ${count}`);
    }
}
