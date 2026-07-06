import { GameObjects, Scene, Time } from "phaser";
import { mainFontConfig } from "../config";

export class CountdownTimer {
    
    private scene: Scene;
    
    private x: number; private y: number;
    private text: GameObjects.Text;

    private timeRef: number;
    private timerEvent: Time.TimerEvent;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    static to(scene: Scene): CountdownTimer {
        
        return new CountdownTimer(scene);
    }

    position(x: number, y: number): CountdownTimer {
        this.x = x; this.y = y;
        this.text = this.scene.add.text(x, y, "HAZIR", mainFontConfig).setOrigin(0.5);
        return this;
    }

    time(time: number): CountdownTimer {
        this.timeRef = time;
        return this;
    }

    start(beforeStart?: Function, onEnd?: Function): CountdownTimer {
        beforeStart?.();

        this.timerEvent = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeRef--;
                this.text.setText(this.timeRef.toString());

                if (this.timeRef <= 0) {
                    onEnd?.();
                }
            },
            callbackScope: this.scene,
            loop: true,
        });

        return this;
    }

    pause() {
        if (this.timerEvent) this.timerEvent.paused = !this.timerEvent.paused;
    }

    stop(action?: Function, delayedStop?: Function): CountdownTimer {
        action?.();

        this.timerEvent.remove();

        this.scene.time.delayedCall(300, delayedStop?.());

        return this;
    }
    
    getText(): GameObjects.Text {
        return this.text;
    }

    getTimeLeft(): number {
        return this.timeRef;
    }

}