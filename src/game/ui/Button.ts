import { Scene , GameObjects } from "phaser";

export class Button {
    
    private scene: Scene;
    private x: number; private y: number;

    private content: string;
    private textStyle: GameObjects.TextStyle;

    private func: Function;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    static to(scene: Scene): Button {
        return new Button(scene);
    }

    position(x: number, y: number) {
        this.x = x; this.y = y;
        return this;
    }

    text(content: string) {
        this.content = content;
        return this;
    }

    style(textStyle: GameObjects.TextStyle) {
        this.textStyle = textStyle;
        return this;
    }

    click(func: Function) {
        this.func = func;
        return this;
    }

    build() {
        let text: Phaser.GameObjects.Text = this.scene.add.text(this.x, this.y, this.content, this.textStyle).setOrigin(0.5).once('pointerup', this.func);
        text.setInteractive({ useHandCursor: true });
        return text;
    }

}