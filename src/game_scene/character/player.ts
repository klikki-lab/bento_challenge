import { CommonScene } from "../../common/commonScene";
import { Surprise } from "../effect/surprise";
import { Character } from "./character";

export class Player extends Character {

    private _isEating: boolean = false;
    private _isScolded: boolean = false;

    constructor(scene: CommonScene) {
        super(scene, scene.asset.getImageById("img_player"));

        this.interval = Math.floor((1000 / 30) * 2);
        this.onFinish.add(() => {
            this.frames = [3, 4];
            this.frameNumber = 0;
            this.loop = true;
            this.modified();
            this.start();
        });
    }

    get isEating(): boolean { return this._isEating && !this._isScolded; }

    startEating = () => {
        this._isEating = true;

        this.frames = [1, 2];
        this.frameNumber = 0;
        this.loop = true;
        this.modified();
        this.start();
    };

    stopEating = () => {
        this._isEating = false;

        this.frames = [0];
        this.frameNumber = 0;
        this.modified();
        this.start();
    };

    get isScolded(): boolean { return this._isScolded; }

    scolded = (): void => {
        this._isScolded = true;
        this._isEating = false;

        this.frames = [1];
        this.frameNumber = 0;
        this.loop = false;
        this.modified();
        this.start();

        new Surprise(this.scene, this);
    }

    forgiven = (): void => {
        this._isScolded = false;
        this.stopEating();
    }
}