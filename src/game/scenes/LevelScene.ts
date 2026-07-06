import { Cameras, GameObjects, Scene, Time } from "phaser";
import { SceneKeys } from "../scene-keys";
import { levelDatas } from "../level-datas";
import { CountdownTimer } from "../utils/CountdownTimer";
import { PopUp } from "../ui/PopUp";
import { Button } from "../ui/Button";
import { LevelInputController, WordState } from "../utils/LevelInputController";
import { mainFontConfig } from "../config";

export class LevelScene extends Scene {

    private levelId: number; 
    private levelData: any;

    private targetWords: string[] = [];

    private isStarted: boolean = false;
    private isOver: boolean = false;
    private isPaused: boolean = false;

    private timeLeft: number;

    private levelInputController: LevelInputController;
    private audioContext: AudioContext | null = null;

    private colorTheme: any;

    private mainContainer: GameObjects.Container;

    private timer: CountdownTimer;
    private idleTimer: Time.TimerEvent;

    private pausePopUp: PopUp;

    constructor() {
        super({
            key: SceneKeys.LevelScene,
        });
        console.log(SceneKeys.LevelScene);
    }
    
    init(data: object) {
        this.isStarted = false;
        this.isOver = false;
        this.isPaused = false;

        this.levelId = data.levelNumber;
        this.levelData = levelDatas[data.levelNumber];
        
        this.timeLeft = this.levelData.timeLimit;

        const totalWordsToType: number = 10;
        this.targetWords = [];
        for (let i = 0; i < totalWordsToType; i++) {
            const randomWord = this.levelData.words[Math.floor(Math.random() * this.levelData.words.length)];
            this.targetWords.push(randomWord);
        }
    }

    create() {
        this.colorTheme = { pending: '#646669', correct: '#d1d0c5', incorrect: '#ca4754', extra: '#7e2a33', caret: '#e2b714', timer: '#e2b714', errorLine: '#ca4754', pauseBg: '#000000', };
        
        this.levelInputController = new LevelInputController(this, this.colorTheme, mainFontConfig, this.endLevel.bind(this));

        this.mainContainer = this.add.container(0, 0);

        this.buildTextGrid();
        
        this.timer = CountdownTimer.to(this).position(400, -50).time(this.timeLeft);
        this.mainContainer.add(this.timer.getText());

        this.mainContainer.add(this.levelInputController.getCaret());

        this.registerInputSystem();

        this.pausePopUp = PopUp.to(this).size(650, 300);
        const pausePopUpTitle: GameObjects.Text = this.add.text(0, -125, "PAUSED", mainFontConfig).setOrigin(0.5);
        
        const resumeButton: GameObjects.Text = Button.to(this).position(100, 100).text("RESUME").style(mainFontConfig).click(() => {
            this.togglePause();
        }).build();
        
        const quitButton: GameObjects.Text = Button.to(this).position(-100, 100).text("QUIT").style(mainFontConfig).click(() => {
            this.input.setDefaultCursor('default');
            if (this.audioContext && this.audioContext.state === 'running')
                this.audioContext.suspend();

            this.scene.start(SceneKeys.LevelSelectScene);
        }).build();

        this.pausePopUp.add([ pausePopUpTitle, resumeButton, quitButton ]);
    }

    buildTextGrid() {
        let currentX: number = 0; let currentY: number = 0;
        const maxLineWidth: number = 800; const spaceWidth: number = 20;
        let actualMaxWidth: number = 0;

        this.targetWords.forEach((word) => {
            const temporaryText: GameObjects.Text = this.add.text(0, 0, word, mainFontConfig);
            const wordWidth: number = temporaryText.width;

            temporaryText.destroy();

            // Sonraki satır
            if (currentX + wordWidth > maxLineWidth) {
                currentX = 0;
                currentY += 45;
            }

            const wordContainer: GameObjects.Container = this.add.container(currentX, currentY);
            this.mainContainer.add(wordContainer);

            const wordObject: WordState = {
                expected: word,
                typed: "",
                characterObjects: [],
                container: wordContainer,
                originalWidth: wordWidth,
                isCorrect: false,
                errorLine: null,
            };

            let charX: number = 0;
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const charText: GameObjects.Text = this.add.text(charX, 0, char, mainFontConfig).setColor(this.colorTheme.pending);

                wordContainer.add(charText);
                wordObject.characterObjects.push(charText);

                charX += charText.width;
            }

            this.levelInputController.getWordsState().push(wordObject);
            currentX += wordWidth + spaceWidth;

            if (currentX > actualMaxWidth)
                actualMaxWidth = currentX;
        });
        
        const totalBlockWidth: number = currentY > 0 ? maxLineWidth : actualMaxWidth - spaceWidth;
        const totalBlockHeight: number = currentY + 45;

        const screenWidth: number = this.scale.width;
        const screenHeight: number = this.scale.height;

        const centerX = (screenWidth - totalBlockWidth) / 2;
        const centerY = (screenHeight - totalBlockHeight) / 2;

        this.mainContainer.setPosition(centerX, centerY);
    }

    update() {
        this.levelInputController.updateCaret();
    }

    registerInputSystem() {
        const handleKeyDown = (event: any) => {
            if (event.key === 'Escape') {
                this.togglePause();
                return;
            }

            if (this.isOver || this.isPaused) return;

            const isValidKey: boolean = event.key.length === 1 || event.key === 'Backspace';

            if (isValidKey) {
                // TRIGGER SOUND

                if (!this.isStarted)
                    this.timer.start(() => {
                        this.isStarted = true;
                    }, () => {
                        this.endLevel();
                    });

                if (this.levelInputController.getCaretTween()) this.levelInputController.getCaretTween().stop();
                this.levelInputController.getCaret().alpha = 1;

                if (this.idleTimer) this.idleTimer.remove();

                this.idleTimer = this.time.delayedCall(500, () => {
                    this.levelInputController.startCaretBlinker();
                });

                this.cameras.main.shake(40, 0.002);
            }

            if (event.key.length === 1) {
                if (event.key === ' ') {
                    event.preventDefault();
                    this.levelInputController.handleSpaceInput();
                } else this.levelInputController.handleCharacterInput(event.key);
            } else if (event.key === 'Backspace')
                this.levelInputController.handleBackspaceInput();
        }

        this.input.keyboard?.on('keydown', handleKeyDown);
        this.events.once('shutdown', () => {
            this.input.keyboard?.off('keydown', handleKeyDown);
        });

    }

    showResults() {
        let correctWordsCount: number = 0;
        let incorrectWordsCount: number = 0;
        let correctCharactersCount: number = 0;
        
        for (let i = 0; i <= this.levelInputController.getActiveWordIndex(); i++) {
            const word: WordState = this.levelInputController.getWordsState()[i];
            if (!word || word.typed.length === 0) continue;

            if (word.isCorrect) {
                correctWordsCount++;
                correctCharactersCount += word.expected.length + 1;
            } else incorrectWordsCount++;
        }

        const totalProcessedWords: number = correctWordsCount + incorrectWordsCount;
        const accuracy: number = totalProcessedWords > 0 ? Math.round((correctWordsCount / totalProcessedWords) * 100) : 0;
        
        const timeSpentSeconds: number = this.levelData.timeLimit - this.timer.getTimeLeft();
        const actualTime: number = timeSpentSeconds > 0 ? timeSpentSeconds : 1;
        const timeInMinutes: number = actualTime / 60;
        
        const wpm = Math.round((correctCharactersCount / 5) / timeInMinutes) || 0;

        const resultPopUp: PopUp = PopUp.to(this).size(450, 350);
        const resultPopUpTitle: GameObjects.Text = this.add.text(0, -125, "RESULTS", mainFontConfig).setOrigin(0.5);
        
        const wpmResultText: GameObjects.Text = this.add.text(0, 0, `WPM: ${wpm}`, mainFontConfig).setOrigin(0.5);
        const accuracyResultText: GameObjects.Text = this.add.text(0, 80, `ACCURACY: %${accuracy}`, mainFontConfig).setOrigin(0.5);
        const wordsResultText: GameObjects.Text = this.add.text(0, 160, `CORRECT: ${correctWordsCount} | INCORRECT: ${incorrectWordsCount}`, mainFontConfig).setOrigin(0.5);
        
        const backButton: GameObjects.Text = Button.to(this).position(-100, 200).text("BACK").style(mainFontConfig).click(() => {
            this.input.setDefaultCursor('default');
            if (this.audioContext && this.audioContext.state === 'running')
                this.audioContext.suspend();

            const unlockedLevel: number = parseInt(localStorage.getItem('typer_unlocked_level') || '1', 10);

            if (this.levelId >= unlockedLevel) {
                localStorage.setItem('typer_unlocked_level', `${this.levelId + 1}`);
            }

            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(SceneKeys.LevelSelectScene); 
            }); 
        }).build();

        resultPopUp.add([resultPopUpTitle, wpmResultText, accuracyResultText, wordsResultText, backButton]);

        resultPopUp.show();
    }   

    togglePause() {
        if (this.isOver) return;

        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.pausePopUp.show();
            
            this.timer.pause();

            if (this.audioContext && this.audioContext.state === 'running')
                this.audioContext.suspend();
        } else {
            this.pausePopUp.hide();

            this.timer.pause();

            if (this.audioContext && this.audioContext.state === 'running')
                this.audioContext.resume();
        }
    }

    endLevel() {
        this.isOver = true;

        this.timer.stop(() => {
            this.timer.getText().setText('Test Bitti!');
        }, () => {
            this.showResults();
        });

        this.tweens.add({
            targets: this.mainContainer,
            alpha: 0.1,
            duration: 500
        });
    }

}