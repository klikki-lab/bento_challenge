import { CommonScene } from "../../common/commonScene";
import { Character } from "./character";

export class Student extends Character {

    private isListen: boolean = false;

    constructor(scene: CommonScene, asset: g.ImageAsset) {
        super(scene, asset);

        this.frames = [0, 1];
        this.frameNumber = 0;
        this.interval = 1000 / 30 * 3;
        this.loop = true;

        const write = () => {
            this.isListen = false;
            this.frameNumber = 0;
            this.modified();
            this.start();
        };

        const listen = () => {
            this.isListen = true;
            this.stop();
        }

        this.onUpdate.add(() => {
            if (g.game.random.generate() < 1 / g.game.fps) {
                if (this.isListen) {
                    write();
                } else {
                    listen();
                }
            }
        });
    }
}