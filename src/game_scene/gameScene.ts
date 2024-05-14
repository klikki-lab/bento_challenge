import { GameMainParameterObject } from "./../parameterObject";
import { CommonScene } from "../common/commonScene";
import { FontSize } from "../common/fontSize";
import { Player } from "./character/player";
import { Student } from "./character/student";
import { Teacher } from "./character/teacher";
import { CountdownTimer } from "./hud/countdownTimer";
import { Score } from "./hud/score";
import * as tl from "@akashic-extension/akashic-timeline";
import { Exclamation } from "./effect/exclamation";
import { EffectLine } from "./effect/effectLine";
import { Aura } from "./effect/aura";

export class GameScene extends CommonScene {

    private random: g.RandomGenerator;
    private camera: g.Camera2D;
    private timeline: tl.Timeline;
    private tween: tl.Tween;
    private player: Player;
    private teacher: Teacher;
    private effectLine: EffectLine;
    private effectLayer: g.E;
    private resultLayer: g.E;
    private font: g.DynamicFont;
    private score: Score;
    private timer: CountdownTimer;

    constructor(param: GameMainParameterObject, timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "img_bg", "img_player", "img_teacher", "img_student_male", "img_student_female",
                "img_surprise", "img_heat", "img_exclamation_mark", "img_effect_line",
                "se_kaminari", "bgm"
            ],
        }, timeLimit);

        this.random = param.random ?? g.game.random;
        this.onLoad.addOnce(this.loadHandler);
    }

    private loadHandler = () => {
        this.camera = new g.Camera2D({});
        g.game.focusingCamera = this.camera;
        g.game.modified();

        this.timeline = new tl.Timeline(this);

        this.font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            fontWeight: "bold",
            strokeWidth: FontSize.LARGE / 6,
            strokeColor: "#222",
            fontColor: "white",
            size: FontSize.LARGE
        });

        this.createBackground();
        this.createStudents();

        this.append(this.player = this.createPlayer());
        this.append(this.teacher = this.createTeacher());
        this.append(this.effectLayer = new g.E({ scene: this }));

        this.effectLine = new EffectLine(this);
        this.effectLine.x = g.game.width / 2 - this.teacher.width * .6;
        this.effectLine.y = g.game.height / 2;
        this.append(this.effectLine);

        this.resultLayer = new g.E({ scene: this, parent: this });
        this.append(this.createHudLayer());

        const rect = this.createBlackout(this);
        const label = this.createLabel(this, "スタート！");
        label.x = g.game.width / 2;
        label.y = g.game.height / 2;
        label.modified();

        const you = this.createLabel(this.player, "あなた", FontSize.SMALL);
        you.x = this.player.width / 2;
        you.y = -you.height;
        you.modified();

        this.onPointDownCapture.add(this.pointDownHandler);
        this.onPointUpCapture.add(this.pointUpHandler);
        this.setTimeout(() => {
            rect.destroy();
            label.destroy();

            this.teacher.startClass();
            this.onUpdate.add(this.updateHandler);

            this.timer.start();

            this.setTimeout(() => you.destroy(), 1000 * 2);
        }, 1000 * 2);

        this.asset.getAudioById("bgm").play();
    };

    private updateHandler = (): void | boolean => {
        if (this.player.isEating) {
            this.score.add();
        }
    };

    private pointDownHandler = (_ev: g.PointDownEvent): void => {
        if (!this.player.isScolded) {
            this.player.startEating();
        }
    }

    private pointUpHandler = (_ev: g.PointUpEvent): void => {
        if (this.player.isEating) {
            this.player.stopEating();

            const satietyLevel = Math.floor(this.score.getSatietyLevel(this.timeLimit)) + 1;
            if (satietyLevel > this.teacher.level) {
                this.teacher.levelUp();
            }
        }
    }

    private createBackground = (): void => {
        new g.FilledRect({
            scene: this,
            parent: this,
            width: g.game.width,
            height: g.game.height,
            cssColor: "rgb(206,160,96)",
        });
        new g.Sprite({
            scene: this,
            src: this.asset.getImageById("img_bg"),
            parent: this,
        });
    };

    private createStudents = (): void => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (i === 0 && j === 1) continue;

                const gender = this.random.generate() < 0.5 ? "img_student_male" : "img_student_female";
                const asset = this.asset.getImageById(gender);
                const student = new Student(this, asset);
                student.x = g.game.width / 2 + i * student.width * 2 - (j - 1) * student.width * .5;
                student.y = g.game.height / 2 + (j - 1) * student.height * 2;
                this.append(student);
            }
        }
    };

    private createPlayer = (): Player => {
        const player = new Player(this);
        player.x = g.game.width / 2;
        player.y = g.game.height / 2;
        return player;
    };

    private createTeacher = (): Teacher => {
        const teacher = new Teacher(this, this.random, new Aura(this));
        teacher.onMonitoring.add(teacher => {
            if (this.player.isEating) {
                teacher.angry(this.player);
                this.player.scolded();
                this.asset.getAudioById("se_kaminari").play();

                if (this.timer.isGameOver) return;

                const scaleRate = 0.4;
                const moveRate = (1 - scaleRate) / 2;
                this.tween = this.timeline.create(this.camera)
                    .wait(600)
                    .scaleTo(scaleRate, scaleRate, 200, tl.Easing.easeOutSine)
                    .con()
                    .moveTo((g.game.width - this.teacher.width * 2) * moveRate, g.game.height * moveRate, 200, tl.Easing.easeOutSine)
                    .call(() => this.effectLine.start())
                    .wait(3800)
                    .call(() => this.effectLine.stop())
                    .scaleTo(1, 1, 250, tl.Easing.easeInSine)
                    .con()
                    .moveTo(0, 0, 250, tl.Easing.easeInSine);
            }
        });
        teacher.onCalm.add(_teacher => {
            if (this.player.isScolded) {
                this.player.forgiven();
            }
        });
        teacher.onFeint.add(teacher => {
            new Exclamation(this, this.effectLayer, teacher);
        });
        teacher.x = teacher.width * 2;
        teacher.y = g.game.height / 2;
        return teacher;
    };

    private createHudLayer = (): g.E => {
        const layer = new g.E({ scene: this });

        this.timer = new CountdownTimer(this, this.font, this.timeLimit);
        this.timer.onFinish.addOnce(this.gameOver);
        layer.append(this.timer);

        this.score = new Score(this, this.font)
        layer.append(this.score);
        return layer;
    };

    private gameOver = (): void => {
        this.onUpdate.remove(this.updateHandler);

        if (this.tween && !this.tween.isFinished()) {
            if (this.effectLine.visible()) {
                this.effectLine.stop();
            }
            this.tween.cancel();
            this.timeline.create(this.camera)
                .scaleTo(1, 1, 250, tl.Easing.easeInSine)
                .con()
                .moveTo(0, 0, 250, tl.Easing.easeInSine);
        }

        this.showFinish();
        this.setTimeout(this.showResult, 1000 * 2);
    };

    private showFinish = (): void => {
        this.createBlackout(this.resultLayer);
        const label = this.createLabel(this.resultLayer, "おわり");
        label.x = g.game.width / 2;
        label.y = g.game.height / 2;
        label.modified();
    };

    private showResult = (): void => {
        const satietyLevel = this.score.getSatietyLevel(this.timeLimit);
        const label = this.createLabel(this.resultLayer, `満腹度 ${(satietyLevel * 100).toFixed(1)}%`);
        label.x = g.game.width / 2;
        label.y = g.game.height / 2 + FontSize.LARGE * 5;
        label.modified();
    };

    private createLabel = (parent: g.E | g.Scene, text: string, fontSize: number = FontSize.LARGE) => new g.Label({
        scene: this,
        parent: parent,
        text: text,
        font: this.font,
        fontSize: fontSize,
        anchorX: 0.5,
        anchorY: 0.5,
    });

    private createBlackout = (parent: g.E | g.Scene): g.FilledRect => new g.FilledRect({
        scene: this,
        parent: parent,
        width: g.game.width,
        height: g.game.height,
        cssColor: "black",
        opacity: .5,
    });
}