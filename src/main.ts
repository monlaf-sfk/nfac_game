import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';
import UIScene from './scenes/UIScene';
import MinimapScene from './scenes/MinimapScene';
import DialogScene from './scenes/DialogScene';
import BackendActivationScene from './scenes/BackendActivationScene';
import FakeLoadingScene from './scenes/FakeLoadingScene';
import Level2Scene from './scenes/Level2Scene';

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
    scene: [BootScene, MenuScene, GameScene, UIScene, MinimapScene, GameOverScene, DialogScene, BackendActivationScene, FakeLoadingScene, Level2Scene]
};

new Phaser.Game(config);
