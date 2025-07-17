import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';
import UIScene from './scenes/UIScene';
import MinimapScene from './scenes/MinimapScene';
import DialogScene from './scenes/DialogScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: true
        }
    },
    scene: [BootScene, MenuScene, GameScene, UIScene, MinimapScene, GameOverScene, DialogScene]
};

new Phaser.Game(config);
