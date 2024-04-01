export class Exclamation extends g.Sprite {

    constructor(scene: g.Scene, parent: g.E | g.Scene, e: g.E) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_exclamation_mark"),
            anchorX: .5,
            anchorY: .5,
            x: e.x,
            y: e.y - e.height * .75,
        });

        scene.setTimeout(() => {
            this.destroy();
        }, 150);
    }
}