import { Scene } from 'phaser';
import { SceneKeys } from '../scene-keys';

export class Preloader extends Scene {

    isFontLoaded: boolean;

    constructor () {
        super({
            key: SceneKeys.PreloadScene,
        });
        console.log(SceneKeys.PreloadScene);
    }

    create() {

        const fontUrl: string = "https://fonts.googleapis.com/css2?family=Balsamiq+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap";
        const fontName: string = "Balsamiq Sans";    

        if (document.getElementById('google-font-balsamiq')) {
            this.loadFontAndStart(fontName);
            return;
        }

        const link: HTMLLinkElement = document.createElement('link');
        link.id = 'google-font-balsamiq';
        link.rel = 'stylesheet';
        link.href = fontUrl;

        link.onload = () => {
            console.log("Css loaded, font file downloaded!");
            this.loadFontAndStart(fontName);
        };

        link.onerror = () => {
            console.error("Google Fonts Css couldn't loaded!");
            this.scene.start(SceneKeys.MenuScene);
        };

        document.head.appendChild(link);
    }

    loadFontAndStart(fontName: string) {
        document.fonts.load(`10px "${fontName}"`).then(() => {
            console.log(`${fontName} succesfully loaded to memory!`);
            this.isFontLoaded = true;
            this.scene.start(SceneKeys.MenuScene);
        }).catch((err) => {
            console.error("An error occured while loading font:", err);
            this.scene.start(SceneKeys.MenuScene);
        });
    }
}
