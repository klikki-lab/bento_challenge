import { CommonScene } from "../../common/commonScene";
import { Character } from "./character";
import { Heat } from "../effect/heat";
import * as tl from "@akashic-extension/akashic-timeline";

const Status = {
    WAITING: 0x0,
    NORMAL: 0x2,
    MONITORING: 0x0f,
    ANGRY: 0xff,
} as const;

type Status = (typeof Status)[keyof typeof Status];

const Duration = {
    TURN: 500,
    MOVE: 250,
    JUMP: 100,
} as const;

const Direction = {
    STUDENTS: 1,
    BLACKBOARD: -1,
} as const;

export class Teacher extends Character {

    private static readonly MAX_LEVEL = 6;
    private static readonly FEINT_RATE = 0.04;

    /** 教師の監視中は毎フレーム通知される。 */
    onMonitoring: g.Trigger<Teacher> = new g.Trigger();
    /** 教師が怒り状態から落ち着き状態に移行したときに通知される。 */
    onCalm: g.Trigger<Teacher> = new g.Trigger();
    /** フェイント時に通知される。 */
    onFeint: g.Trigger<Teacher> = new g.Trigger();

    private timeline: tl.Timeline;
    private tween: tl.Tween;

    private status: Status = Status.WAITING;
    private _level: number = 1;

    constructor(scene: CommonScene, private random: g.RandomGenerator, private _aura: g.FrameSprite = undefined) {
        super(scene, scene.asset.getImageById("img_teacher"));

        this.timeline = new tl.Timeline(scene);
        if (_aura) {
            _aura.x = this.width * .5;
            _aura.y = this.height * .45;
            _aura.hide();
            this.append(_aura);
        }

        this.normalAnimation();
        this.onFinish.add(() => {
            this.normalAnimation();
            if (this.random.generate() < this._level / g.game.fps) {
                this.status = Status.NORMAL;
            } else {
                this.status = Status.WAITING;
                this.turnToStudents();
            }
        });
        this.onUpdate.add(this.updateHandler);
    }

    private normalAnimation = (): void => {
        this.scaleX = Direction.BLACKBOARD;
        this.frames = [0, 1];
        this.frameNumber = 0;
        this.interval = Math.round((1000 / 30) * 3);
        this.loop = true;
        this.modified();
        this.start();
    };

    private slippingGlassesAnimation = (): void => {
        this.frames = [2, 3];
        this.frameNumber = 0;
        this.interval = Math.round((1000 / 30) * 5);
        this.loop = false;
        this.modified();
        this.start();
    };

    private getTurnDuration = () => Duration.TURN - (this._level - 1) * 100;

    private turnToStudents = (): void => {
        this.tween = this.timeline
            .create(this)
            .to({ scaleX: Direction.STUDENTS }, this.getTurnDuration(), tl.Easing.easeInSine)
            .call(() => this.status = Status.MONITORING);
    };

    private turnToBlackboard = (): void => {
        const turnDuration = this.getTurnDuration();
        this.tween = this.timeline
            .create(this)
            .to({ scaleX: Direction.BLACKBOARD }, turnDuration, tl.Easing.easeInSine);

        const isFeint = this.random.generate() < this._level * Teacher.FEINT_RATE;
        if (isFeint) {
            this.scene.setTimeout(() => {
                this.onFeint.fire(this);
                this.turnToStudents();
            }, turnDuration * 0.4);
        } else {
            this.tween.call(() => this.status = Status.NORMAL);
        }
    };

    private updateHandler = (): void | boolean => {
        switch (this.status) {
            case Status.WAITING:
                break;
            case Status.NORMAL:
                if (this.random.generate() < this._level / (g.game.fps * 2)) {
                    this.status = Status.WAITING;
                    this.slippingGlassesAnimation();
                }
                break;
            case Status.MONITORING:
                this.onMonitoring.fire(this);
                if (!this.isAngry() && this.random.generate() < this._level / g.game.fps) {
                    this.status = Status.WAITING;
                    this.turnToBlackboard();
                }
                break;
            case Status.ANGRY:
                if (g.game.age % Math.floor(g.game.fps * .2) === 0) {
                    new Heat(this.scene, this)
                }
                break;
        }
    };

    private isAngry = () => Status.ANGRY === this.status;

    /**
     * 授業開始。教師が振り向き行動を開始する。ゲーム開始時に必ず呼び出すこと。
     */
    startClass = () => { this.status = Status.NORMAL; };

    startAngryAnimation = () => {
        this.status = Status.ANGRY;

        this.scaleX = Direction.STUDENTS;
        this.frames = [4, 5];
        this.interval = Math.round((1000 / 30) * 2 + 0.5);
        this.modified();
        this.start();
    }

    angry = (player: g.E): void => {
        this.startAngryAnimation();

        this.tween?.cancel();
        const tempY = this.y;
        this.tween = this.timeline
            .create(this)
            .moveY(tempY - this.height, Duration.JUMP, tl.Easing.easeOutQuart)
            .moveY(tempY, Duration.JUMP, tl.Easing.easeInCubic)
            .moveX(player.x - this.width, Duration.MOVE, tl.Easing.easeInSine)
            .moveY(tempY - this.height, Duration.JUMP, tl.Easing.easeOutQuart)
            .moveY(tempY, Duration.JUMP, tl.Easing.easeInCubic)
            .moveY(tempY - this.height, Duration.JUMP, tl.Easing.easeOutSine)
            .moveY(tempY, Duration.JUMP, tl.Easing.easeInCubic)
            .moveY(tempY - this.height, Duration.JUMP, tl.Easing.easeOutQuart)
            .moveY(tempY, Duration.JUMP, tl.Easing.easeInCubic)
            .wait(3000)
            .call(() => {
                this.timeline
                    .create(this)
                    .to({ scaleX: Direction.BLACKBOARD }, this.getTurnDuration(), tl.Easing.easeInSine)
                    .call(this.normalAnimation)
                    .moveX(this.width * 2, Duration.MOVE, tl.Easing.easeInSine)
                    .con()
                    .call(() => {
                        this.status = Status.NORMAL;
                        this.onCalm.fire(this)
                    })

            });
    };

    get level(): number { return this._level; }

    levelUp = (): boolean => {
        if (this._level < Teacher.MAX_LEVEL) {
            this._level++;
            if (this._aura && !this._aura.visible()) {
                this._aura.show();
                this._aura.start();
            }
            return true;
        };
        return false;
    }

    stopTween = (): void => { this.tween?.pause(); };
}