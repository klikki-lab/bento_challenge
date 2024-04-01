export class EffectLint extends g.Sprite {

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_effect_line"),
            anchorX: 0.5,
            anchorY: 0.5,
            opacity: .1,
            hidden: true,
        });
    }

    private updateHandler = () => {
        if (g.game.age % 2 === 0) {
            this.scaleX *= -1
            this.modified();
        }
    };

    start(): void {
        if (!this.onUpdate.contains(this.updateHandler)) {
            this.onUpdate.add(this.updateHandler);
        }
        this.show();
    }

    stop(): void {
        if (this.onUpdate.contains(this.updateHandler)) {
            this.onUpdate.remove(this.updateHandler);
        }
        this.hide();
    }
} 