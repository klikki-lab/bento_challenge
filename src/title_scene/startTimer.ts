import { FontSize } from "../common/fontSize";

export class StartTimer extends g.Label {

    onTick: g.Trigger<number> = new g.Trigger();
    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.DynamicFont, private remainingSec: number) {
        super({
            scene: scene,
            text: `開始まで ${remainingSec.toString()} 秒`,
            font: font,
            fontSize: FontSize.LARGE,
            anchorX: 0.5,
            anchorY: 0.5,
            x: g.game.width / 2,
            y: g.game.height - FontSize.LARGE * 2,
        });
    }

    start = () => { this.onUpdate.add(this.updateHandler); };

    private updateHandler = (): void | boolean => {
        this.remainingSec -= 1 / g.game.fps;
        const sec = Math.ceil(this.remainingSec);
        const text = `開始まで ${sec.toString()} 秒`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();

            if (sec > 0) {
                this.onTick.fire(sec);
            } else if (sec < 0) {
                this.onFinish.fire();
                return true;
            }
        }
    };
}