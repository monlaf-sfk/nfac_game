import Phaser from 'phaser';

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
