import { Scene } from 'phaser';
import { SceneKeys } from '../scene-keys';

export class Boot extends Scene
{
    constructor ()
    {
        super({
            key: SceneKeys.BootScene,
        });
        console.log(SceneKeys.BootScene);
    }

    preload ()
    {
        // this.load.image('background', 'assets/bg.png');
    }

    create ()
    {
        this.scene.start(SceneKeys.PreloadScene);
    }
}
