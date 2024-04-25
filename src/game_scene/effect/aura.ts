export class Aura extends g.FrameSprite {

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_aura"),
            srcWidth: 128,
            srcHeight: 192,
            width: 128,
            height: 192,
            opacity: 0,
            anchorX: .5,
            anchorY: .5,
            frames: [0, 1, 2],
        });
    }
}