import { FontSize } from "../../common/fontSize";

export class CountdownTimer extends g.Label {

    onStart: g.Trigger<number> = new g.Trigger();
    onTick: g.Trigger<number> = new g.Trigger();
    onFinish: g.Trigger<void> = new g.Trigger();
    private _isGameOver: boolean = false;

    constructor(scene: g.Scene, font: g.DynamicFont, private remainingSec: number) {
        super({
            scene: scene,
            text: `のこり時間 ${remainingSec.toString()}`,
            font: font,
            fontSize: FontSize.LARGE,
            x: FontSize.LARGE,
            y: FontSize.LARGE / 2,
        });
    }

    get isGameOver(): boolean { return this._isGameOver; }

    start = () => { this.onUpdate.add(this.updateHandler); };

    private updateHandler = () => {
        if (!this.onStart.destroyed()) {
            this.onStart.fire(this.remainingSec);
            this.onStart.destroy();
        }

        this.remainingSec -= 1 / g.game.fps;
        const sec = Math.ceil(this.remainingSec);
        const text = `のこり時間 ${sec}`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();

            if (sec > 0) {
                this.onTick.fire(sec);
            } else if (sec <= 0) {
                this._isGameOver = true;
                this.onFinish.fire();
                this.onUpdate.destroy();
            }
        }
    };
}