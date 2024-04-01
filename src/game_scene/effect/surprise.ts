export class Surprise extends g.Sprite {

    constructor(scene: g.Scene, parent: g.E) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_surprise"),
            anchorX: 0.5,
            anchorY: 0.5,
        });
        this.x = parent.width / 2 - this.width * .2;
        this.y = this.height * .2;

        let frame = 0;
        this.onUpdate.add(() => {
            if (frame++ > g.game.fps * 0.1) {
                this.destroy();
            }
        });
    }
}