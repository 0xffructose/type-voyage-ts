import { AUTO, Game, Scale } from 'phaser';

import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { Menu } from './scenes/Menu';
import { SingleplayerModeScene } from './scenes/SingleplayerModeScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    pixelArt: false,
    antialias: true,
    scale: {
        parent: "game-container",
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    backgroundColor: '#028af8',
    autoFocus: true,
    scene: [
        Boot,
        Preloader,
        Menu,
        SingleplayerModeScene,
        LevelSelectScene
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
