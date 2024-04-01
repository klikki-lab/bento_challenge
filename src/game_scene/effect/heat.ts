export class Heat extends g.FrameSprite {

    protected static readonly SIZE = 64;

    constructor(scene: g.Scene, parent: g.E) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_heat"),
            srcWidth: Heat.SIZE,
            srcHeight: Heat.SIZE,
            width: Heat.SIZE,
            height: Heat.SIZE,
            anchorX: .5,
            anchorY: .5,
            x: parent.width / 2,
            y: -parent.height / 4,
            frames: [0, 1, 2],
        });
        this.start();

        let vec = 1;
        this.onUpdate.add(() => {
            this.y -= (this.height * .2) * vec;
            this.opacity = vec;
            vec *= 0.5;
            this.modified();
            if (vec <= 0.1) {
                this.destroy();
            }
        });
    }
}