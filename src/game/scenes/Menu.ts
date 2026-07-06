import { Scene } from 'phaser';
import { SceneKeys } from '../scene-keys';
import { Button } from '../ui/Button';

export class Menu extends Scene {

    fontConfig: any;

    constructor() {
        super({
            key: SceneKeys.MenuScene
        });
        // 
        console.log(SceneKeys.MenuScene);
    }

    init(data: object) {

    }

    create() {
        console.log("MENU SCENE -> CREATE");

        this.fontConfig = { fontFamily: '"Balsamiq Sans", sans-serif', fontSize: '32px', fontWeight: '200' };

        const centerX: number = this.scale.width / 2;
        const centerY: number = this.scale.height / 2;

        const title: Phaser.GameObjects.Text  = this.add.text(centerX, centerY - 160, "TYPE VOYAGE", this.fontConfig).setOrigin(0.5); 
        title.setStroke('#000000', 8);

        const singlePlayerButton: Phaser.GameObjects.Text = Button.to(this).position(centerX, centerY - 20).text("Singleplayer").style(this.fontConfig).click(() => {
            this.scene.start(SceneKeys.SingleplayerModeScene, { levelId: 1 });
        }).build();
        
        singlePlayerButton.setStroke('#000', 4);
    
        const multiPlayerButton: Phaser.GameObjects.Text = Button.to(this).position(centerX, centerY + 40).text("Multiplayer").style(this.fontConfig).click(() => {
            this.scene.start(SceneKeys.MultiplayerModeScene);
        }).build();

        multiPlayerButton.setStroke('#000000', 4);
        
        const menuButtons: Phaser.GameObjects.Text[] = [singlePlayerButton, multiPlayerButton];
        menuButtons.forEach(button => {
            button.on("pointerover", () => {
                this.tweens.add({
                    targets: button,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100
                });
            });

            button.on("pointerout", () => {
                this.tweens.add({
                    targets: button,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
            });
        });
        
    }
    
}