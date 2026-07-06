import { Cameras, GameObjects, Math, Scene } from "phaser";
import { SceneKeys } from "../scene-keys";
import { PopUp } from "../ui/PopUp";
import { Button } from "../ui/Button";
import { mainFontConfig } from "../config";

export class LevelSelectScene extends Scene {
    
    camera: Cameras.Scene2D.Camera;
    uiCamera: Cameras.Scene2D.Camera;

    map: GameObjects.Image;

    levelPopUp: PopUp;

    selectedLevel: number | null;

    constructor() {
        super({
            key: SceneKeys.LevelSelectScene,
        });
        console.log(SceneKeys.LevelSelectScene);
    }

    preload() {
        this.load.svg('world-map', 'public/assets/world.svg', { scale: 8 });
        this.load.json('world-data', 'public/assets/data/world-points.json');
    }

    create() {
        this.camera = this.cameras.main; 

        this.camera.fadeIn(500, 0, 0, 0);

        this.map = this.add.image(0, 0, "world-map").setScale(0.25).setOrigin(0);

        this.camera.setBounds(0, 0, this.map.displayWidth, this.map.displayHeight);
        this.camera.setZoom(1);

        this.camera.scrollX = (this.map.displayWidth - this.camera.width) / 2;
        this.camera.scrollY = (this.map.displayHeight - this.camera.height) / 2;

        // LEVEL POP UP
        this.levelPopUp = PopUp.to(this).size(650, 300);
        const levelPopUpTitle: GameObjects.Text = this.add.text(0, -125, "LEVEL ?", mainFontConfig).setOrigin(0.5);

        const playButton: GameObjects.Text = Button.to(this).position(0, 100).text("PLAY LEVEL").style(mainFontConfig).click(() => {
            this.scene.start(SceneKeys.LevelScene, { levelNumber: this.selectedLevel });
        }).build();

        const closeButton: GameObjects.Text = Button.to(this).position(300, -125).text("X").style(mainFontConfig).click(() => {
            this.levelPopUp.hide(() => {
                this.selectedLevel = null;
            });
        }).build();

        this.levelPopUp.add([levelPopUpTitle, closeButton, playButton]);

        const levels: any[] = this.cache.json.get('world-data');
        if (levels && levels.length > 0) {
            const sortedLevels: any[] = [...levels].sort((a, b) => a.id - b.id);
            const pathGraphics: GameObjects.Graphics = this.add.graphics();

            pathGraphics.lineStyle(6, 0xffd700, 0.8);
            pathGraphics.setDepth(50);

            pathGraphics.beginPath();
            sortedLevels.forEach((level, index) => {
                if (index === 0) pathGraphics.moveTo(level.x, level.y);
                else  pathGraphics.lineTo(level.x, level.y);
            });
            pathGraphics.strokePath();

            const unlockedLevel: number = parseInt(localStorage.getItem('typer_unlocked_level') || '1', 10);

            levels.forEach((level) => {
                const isUnlocked: boolean = level.id <= unlockedLevel;

                const nodeColor: any = isUnlocked ? 0xff0000 : 0x555555;
                const textColor: any = isUnlocked ? "#ffffff" : "#aaaaaa";

                const levelPoint: GameObjects.Arc = this.add.circle(level.x, level.y, 25, nodeColor).setDepth(100);
                const levelText: GameObjects.Text = this.add.text(level.x, level.y, level.id.toString(), { color: textColor, fontSize: "24px", fontStyle: "bold" }).setOrigin(0.5).setDepth(101);

                if (isUnlocked) {
                    levelPoint.setInteractive({ useHandCursor: true });

                    levelPoint.on('pointerdown', () => {
                        levelPoint.setFillStyle(0x00ff00);
                    });

                    levelPoint.on('pointerout', () => {
                        levelPoint.setFillStyle(0xff0000);
                    });

                    levelPoint.on('pointerup', (pointer: any) => {
                        levelPoint.setFillStyle(0xff0000);
                        this.selectedLevel = level.id;
                        
                        const distance = Math.Distance.Between(pointer.downX, pointer.downY, pointer.x, pointer.y);
                        
                        if (distance < 5)
                            this.levelPopUp.show(() => {
                                levelPopUpTitle.setText(`LEVEL ${this.selectedLevel}`);
                            });
                    });

                }
            });
        } else {
            console.warn("Uyarı: world-data dosyası boş veya bulunamadı.");
        }

        this.uiCamera = this.cameras.add(0, 0, this.camera.width, this.camera.height);
        this.uiCamera.ignore(this.children.list.filter(child => child !== this.levelPopUp.getPopUpContainer()));

        this.camera.ignore(this.levelPopUp.getPopUpContainer());

        let lastX: number;
        let lastY: number;

        this.input.on('pointerdown', (pointer: any) => {
            lastX = pointer.x;
            lastY = pointer.y;
        });

        this.input.on('pointermove', (pointer: any) => {
            if (!pointer.isDown) return;
            if (this.levelPopUp.getPopUpContainer().visible) return;

            const dx = pointer.x - lastX;
            const dy = pointer.y - lastY;

            this.camera.scrollX -= dx / this.camera.zoom;
            this.camera.scrollY -= dy / this.camera.zoom;

            lastX = pointer.x;
            lastY = pointer.y;
        });

        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
            if (this.levelPopUp.getPopUpContainer().visible) return;

            let zoom = this.camera.zoom;

            zoom -= deltaY * 0.001;
            zoom = Math.Clamp(zoom, 0.5, 4);
            
            this.camera.setZoom(zoom);
        });

    }

}