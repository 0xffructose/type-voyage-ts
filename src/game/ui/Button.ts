import { Scene , GameObjects } from "phaser";

export class Button {
    
    private scene: Scene;
    private x: number; private y: number;

    private content: string;
    private textStyle: GameObjects.TextStyle;

    private func: Function;
    private textContent: GameObjects.Text;

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
        this.textContent = this.scene.add.text(this.x, this.y, this.content, this.textStyle).setOrigin(0.5).on('pointerup', this.func);
        this.textContent.setInteractive({ useHandCursor: true });
        return this.textContent;
    }

}