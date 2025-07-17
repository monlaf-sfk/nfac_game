import Phaser from 'phaser';

type DialogueEntry = {
    title: string;
    text: string;
    portraitKey: string;
};

export default class DialogScene extends Phaser.Scene {
    private dialogue: DialogueEntry[] = [];
    private currentIndex = 0;
    private onComplete!: () => void;

    private dialogBox!: Phaser.GameObjects.Graphics;
    private titleText!: Phaser.GameObjects.Text;
    private bodyText!: Phaser.GameObjects.Text;
    private portraitImage!: Phaser.GameObjects.Image;

    private boxWidth = 700;
    private boxHeight = 200;
    private padding = 20;
    private portraitSize = 160;

    constructor() {
        super('DialogScene');
    }

    create(data: { dialogue: DialogueEntry[], onComplete: () => void }) {
        this.dialogue = data.dialogue;
        this.onComplete = data.onComplete;
        this.currentIndex = 0;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const boxX = centerX - this.boxWidth / 2;
        const boxY = centerY - this.boxHeight / 2;

        this.dialogBox = this.add.graphics();
        this.dialogBox.fillStyle(0x000000, 0.8);
        this.dialogBox.fillRoundedRect(boxX, boxY, this.boxWidth, this.boxHeight, 10);
        this.dialogBox.lineStyle(2, 0xffffff, 0.8);
        this.dialogBox.strokeRoundedRect(boxX, boxY, this.boxWidth, this.boxHeight, 10);

        this.displayCurrentDialogue();

        this.input.once('pointerdown', this.nextDialogue, this);
    }

    displayCurrentDialogue() {
        if (this.titleText) this.titleText.destroy();
        if (this.bodyText) this.bodyText.destroy();
        if (this.portraitImage) this.portraitImage.destroy();

        const entry = this.dialogue[this.currentIndex];
        if (!entry) return;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const boxX = centerX - this.boxWidth / 2;
        const boxY = centerY - this.boxHeight / 2;

        const portraitX = boxX + this.padding + this.portraitSize / 2;
        const portraitY = boxY + this.boxHeight / 2;
        this.portraitImage = this.add.image(portraitX, portraitY, entry.portraitKey);
        this.portraitImage.setScale(this.portraitSize / this.portraitImage.height);

        const textX = boxX + this.portraitSize + this.padding * 2;
        const textY = boxY + this.padding;
        const textWidth = this.boxWidth - this.portraitSize - this.padding * 3;
        
        this.titleText = this.add.text(textX, textY, entry.title, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0, 0);

        const bodyTextY = textY + this.titleText.height + 10;
        this.bodyText = this.add.text(textX, bodyTextY, entry.text, {
            fontSize: '18px',
            color: '#dddddd',
            wordWrap: { width: textWidth },
            lineSpacing: 5,
        }).setOrigin(0, 0);
    }

    nextDialogue() {
        this.currentIndex++;
        if (this.currentIndex < this.dialogue.length) {
            this.displayCurrentDialogue();
            this.input.once('pointerdown', this.nextDialogue, this);
        } else {
            this.scene.stop();
            this.onComplete();
        }
    }
} 