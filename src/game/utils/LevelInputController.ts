import { Display, GameObjects, Scene, Tweens } from "phaser";

export interface WordState {
    expected: string;
    typed: string;
    characterObjects: GameObjects.Text[];
    container: GameObjects.Container;
    originalWidth: number;
    isCorrect: boolean;
    errorLine: GameObjects.Graphics | null;
}

export class LevelInputController {

    private scene: Scene;
    private theme: any;
    private fontConfig: any;
    private end: () => void;

    private activeWordIndex: number = 0;
    private activeCharacterIndex: number = 0;

    private caret: GameObjects.Rectangle;
    private caretTween: Tweens.Tween;
    private startCaretBlink: () => void;

    private caretTargetX: number = 0;
    private caretTargetY: number = 0;

    private wordsState: WordState[] = [];
    
    constructor(scene: Scene, theme: any, fontConfig: any, end: () => void) {
        this.scene = scene;
        this.theme = theme;
        this.fontConfig = fontConfig;
        this.end = end;

        this.caret = this.scene.add.rectangle(0, 0, 1, 34, Display.Color.HexStringToColor(this.theme.caret).color);
        this.caret.setOrigin(0.5, 0);
        
        this.caretTargetX = 0;
        this.caretTargetY = 0;

        this.startCaretBlink = () => {
            if (this.caretTween) this.caretTween.stop();

            this.caretTween = this.scene.tweens.add({
                targets: this.caret,
                alpha: 0,
                duration: 800,
                ease: 'Linear',
                yoyo: true,
                repeat: -1,
            });
        };

        this.caret.alpha = 1;
        this.startCaretBlink();
        this.updateCaretTargetPosition();
    }

    handleCharacterInput(character: string) {
        if (this.activeWordIndex >= this.wordsState.length) return;

        const currentWord: WordState = this.wordsState[this.activeWordIndex];

        if (currentWord.errorLine) {
            currentWord.errorLine.destroy();
            currentWord.errorLine = null;
        }

        if (this.activeCharacterIndex >= currentWord.expected.length) {
            if (this.activeCharacterIndex < currentWord.expected.length + 5) {

                const lastCharacterObject: GameObjects.Text = currentWord.characterObjects[currentWord.characterObjects.length - 1];
                const newX: number = lastCharacterObject ? lastCharacterObject.x + lastCharacterObject.width : 0;

                const extraCharacter: GameObjects.Text = this.scene.add.text(newX, 0, character, this.fontConfig).setColor(this.theme.extra);
                currentWord.container.add(extraCharacter);
                currentWord.characterObjects.push(extraCharacter);

                currentWord.typed += character;
                this.activeCharacterIndex++;

                const addedWith: number = extraCharacter.width;
                for (let i = this.activeWordIndex + 1; i < this.wordsState.length; i++) {
                    this.wordsState[i].container.x += addedWith;
                }
            }
        } else {
            const expectedChar: string = currentWord.expected[this.activeCharacterIndex];
            const characterObject: GameObjects.Text = currentWord.characterObjects[this.activeCharacterIndex];

            if (character === expectedChar) characterObject.setColor(this.theme.correct);
            else characterObject.setColor(this.theme.incorrect);

            currentWord.typed += character;
            this.activeCharacterIndex++;
        }

        if (this.activeWordIndex === this.wordsState.length - 1) {
            if (currentWord.typed === currentWord.expected) {
                currentWord.isCorrect = true;
                this.end();
                return;
            }
        }

        this.updateCaretTargetPosition();
    }

    handleSpaceInput() {
        if (this.activeWordIndex >= this.wordsState.length) return;
        
        const currentWord: WordState = this.wordsState[this.activeWordIndex];

        if (currentWord.typed.length === 0) return;

        if (currentWord.errorLine) {
            currentWord.errorLine.destroy();
            currentWord.errorLine = null;
        }

        currentWord.isCorrect = (currentWord.typed === currentWord.expected);

        if (!currentWord.isCorrect) {
            let firstErrorIndex: number = -1;

            for (let i = 0; i < currentWord.expected.length; i++) {
                if (currentWord.typed[i] !== currentWord.expected[i]) {
                    firstErrorIndex = i;
                    break;
                }
            }

            if (firstErrorIndex === -1 && currentWord.typed.length > currentWord.expected.length)
                firstErrorIndex = currentWord.expected.length;

            if (firstErrorIndex === -1)
                firstErrorIndex = this.activeCharacterIndex;

            this.drawErrorUnderline(currentWord, firstErrorIndex);
        }

        this.activeWordIndex++;
        this.activeCharacterIndex = 0;
        this.updateCaretTargetPosition();

        if (this.activeWordIndex >= this.wordsState.length) {
            this.end();
        }
    }

    handleBackspaceInput() {
        if (this.activeCharacterIndex === 0) {
            if (this.activeWordIndex > 0) {
                const previousWord: WordState = this.wordsState[this.activeWordIndex - 1];
                if (!previousWord.isCorrect) {
                    this.activeWordIndex--;
                    this.activeCharacterIndex = previousWord.typed.length;

                    if (previousWord.errorLine) {
                        previousWord.errorLine.destroy();
                        previousWord.errorLine = null;
                    }

                    this.updateCaretTargetPosition();
                }
            }
            return;
        }

        this.activeCharacterIndex--;
        const currentWord: WordState = this.wordsState[this.activeWordIndex];

        if (currentWord.errorLine) {
            currentWord.errorLine.destroy();
            currentWord.errorLine = null;
        }

        if (this.activeCharacterIndex >= currentWord.expected.length) {
            const characterObject: GameObjects.Text | undefined = currentWord.characterObjects.pop();
            const removedWidth: number | undefined = characterObject?.width;
            
            characterObject?.destroy();

            for (let i = this.activeWordIndex + 1; i < this.wordsState.length; i++) {
                this.wordsState[i].container.x -= removedWidth!;
            }
        } else {
            const characterObject: GameObjects.Text = currentWord.characterObjects[this.activeCharacterIndex];
            characterObject.setColor(this.theme.pending);
        }

        currentWord.typed = currentWord.typed.slice(0, -1);
        this.updateCaretTargetPosition();
    }

    updateCaretTargetPosition() {
        if (this.activeWordIndex >= this.wordsState.length) {
            this.caretTargetX = this.caret.x;
            this.caretTargetY = this.caret.y;
            return;
        }

        const currentWord: WordState = this.wordsState[this.activeWordIndex];

        const containerX: number = currentWord.container.x;
        const containerY: number = currentWord.container.y;

        let characterX: number = 0;
        if (this.activeCharacterIndex > 0) {
            const previousCharacterObject: GameObjects.Text = currentWord.characterObjects[this.activeCharacterIndex - 1];
            characterX = previousCharacterObject.x + previousCharacterObject.width;
        }

        this.caretTargetX = containerX + characterX;
        this.caretTargetY = containerY + 2;
    }

    updateCaret() {
        if (this.caretTargetX !== undefined && this.caretTargetY !== undefined) {
            const lerpSpeed = 0.6; 
            this.caret.x += (this.caretTargetX - this.caret.x) * lerpSpeed;
            this.caret.y += (this.caretTargetY - this.caret.y) * lerpSpeed;
        }
    }

    drawErrorUnderline(wordObject: WordState, startIndex: number) {
        const graphics: GameObjects.Graphics = this.scene.add.graphics();
        graphics.lineStyle(2, Display.Color.HexStringToColor(this.theme.errorLine).color, 1);

        const startCharacterObject: GameObjects.Text = wordObject.characterObjects[startIndex] || wordObject.characterObjects[wordObject.characterObjects.length - 1];
        const startX: number = startCharacterObject.x;

        const lastCharacterObject: GameObjects.Text = wordObject.characterObjects[wordObject.characterObjects.length - 1];
        const endX: number = lastCharacterObject.x + lastCharacterObject.width;

        const yPosition: number = 38;
        const waveLength: number = 3;
        const waveHeight: number = 3;

        graphics.beginPath();
        let toggle: boolean = true;

        for (let x = startX; x <= endX; x += waveLength) {
            const currentY: number = yPosition + (toggle ? 0 : waveHeight);
            if (x === startX) graphics.moveTo(x, currentY);
            else graphics.lineTo(x, currentY);

            toggle = !toggle;
        }
        graphics.strokePath();

        wordObject.container.add(graphics);
        wordObject.errorLine = graphics;
    }

    getActiveWordIndex() {
        return this.activeWordIndex;
    }

    getWordsState() {
        return this.wordsState;
    }

    getCaret() {
        return this.caret;
    }

    getCaretTween() {
        return this.caretTween;
    }

    startCaretBlinker() {
        this.startCaretBlink();
    }

}