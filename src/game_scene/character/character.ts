import { CommonScene } from "../../common/commonScene";

export abstract class Character extends g.FrameSprite {

    private static readonly WIDTH = 130;
    private static readonly HEIGHT = 128;

    constructor(scene: CommonScene, src: g.ImageAsset) {
        super({
            scene: scene,
            src: src,
            srcWidth: Character.WIDTH,
            srcHeight: Character.HEIGHT,
            width: Character.WIDTH,
            height: Character.HEIGHT,
            anchorX: .5,
            anchorY: .5,
        });
    }
}