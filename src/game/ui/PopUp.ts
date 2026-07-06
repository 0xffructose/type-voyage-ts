import { GameObjects, Scene } from "phaser";

export class PopUp {

    private scene: Scene;
    private width: number; private height: number;

    private popUpContainer: GameObjects.Container;
    private popUpPanel: GameObjects.Rectangle;

    constructor(scene: Scene) {
        this.scene = scene;

        const { width, height } = scene.cameras.main;
        this.popUpContainer = scene.add.container(width / 2, height / 2).setDepth(1000).setVisible(false);

        // OVERLAY
        const overlay: GameObjects.Rectangle = scene.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.6).setInteractive();

        this.popUpPanel = scene.add.rectangle(0, 0, 128, 128, 0x222222, 1).setStrokeStyle(4, 0xffffff);

        this.popUpContainer.add([overlay, this.popUpPanel]);
    }

    static to(scene: Scene): PopUp {
        return new PopUp(scene);
    } 

    size(width: number, height: number): PopUp {
        this.width = width; this.height = height;
        
        this.popUpPanel.width = width; 
        this.popUpPanel.height = height;
        
        this.popUpPanel.geom.setSize(width, height);
        this.popUpPanel.updateDisplayOrigin();
        this.popUpPanel.updateData();

        this.popUpPanel.setStrokeStyle(4, 0xffffff);

        return this;
    }

    show() {
        this.popUpContainer.setVisible(true); this.popUpContainer.setScale(0.8);
        this.popUpContainer.setAlpha(0);
        
        this.scene.tweens.add({
            targets: this.popUpContainer,
            scale: 1,
            alpha: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    hide() {
        this.popUpContainer.setVisible(false);
    }

    getPopUpContainer() {
        return this.popUpContainer;
    }

}