import { Scene } from 'phaser';
import { SceneKeys } from '../scene-keys';
import { Button } from '../ui/Button';

export class SingleplayerModeScene extends Scene {

    fontConfig: any;

    constructor() {
        super({
            key: SceneKeys.SingleplayerModeScene,
        })
        console.log(SceneKeys.SingleplayerModeScene);
    }

    create() {
        
        this.fontConfig = { fontFamily: '"Balsamiq Sans", sans-serif', fontSize: '32px', fontWeight: '200' };
        
        const centerX: number = this.scale.width / 2;
        const centerY: number = this.scale.height / 2;

        const title: Phaser.GameObjects.Text = this.add.text(centerX, centerY - 150, "Tek Oyunculu", this.fontConfig).setOrigin(0.5);
        title.setStroke('#000000', 6);

        const storyButton: Phaser.GameObjects.Text = Button.to(this).position(centerX, centerY - 20).text("Hikaye Modu").style(this.fontConfig).click(() => {
            this.scene.start(SceneKeys.LevelSelectScene, { mode: "story" });
        }).build();
        storyButton.setStroke('#000', 4);

        const survivalButton: Phaser.GameObjects.Text = Button.to(this).position(centerX, centerY + 50).text("Sonsuz Mod").style(this.fontConfig).click(() => {
            return;
        }).build();
        survivalButton.setStroke('#000', 4);

        const backButton: Phaser.GameObjects.Text = Button.to(this).position(centerX, centerY + 130).text("Geri Dön").style(this.fontConfig).click(() => {
            this.scene.start(SceneKeys.MenuScene);
        }).build();
        backButton.setStroke('#000', 4);

        const buttons: Phaser.GameObjects.Text[] = [storyButton, survivalButton, backButton];
        buttons.forEach(button => {
            button.on('pointerover', () => {
                this.tweens.add({ 
                    targets: button, 
                    scaleX: 1.1, 
                    scaleY: 1.1, 
                    duration: 100 
                });
            });

            button.on('pointerout', () => {
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