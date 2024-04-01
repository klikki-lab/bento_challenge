import { CommonScene } from "../common/commonScene";
import { FontSize } from "../common/fontSize";
import { Player } from "../game_scene/character/player";
import { Teacher } from "../game_scene/character/teacher";
import { StartTimer } from "./startTimer";

export class TitleScene extends CommonScene {

    onFinish: g.Trigger<void> = new g.Trigger();

    private font: g.DynamicFont;

    constructor(timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "img_bg", "img_player", "img_teacher", "img_surprise", "img_heat",
            ]
        }, timeLimit);

        this.onLoad.addOnce(this.loadHandler);
    }

    private loadHandler = (): void => {
        this.font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            fontWeight: "bold",
            strokeWidth: (FontSize.LARGE / 6) * 2,
            strokeColor: "#222",
            fontColor: "white",
            size: FontSize.LARGE * 2
        });

        this.createBackground();
        this.createTitle();
        this.createCopyright();
        const player = this.createPlayer();
        const label = this.createPlayerSummary(player);

        const timer = new StartTimer(this, this.font, this.timeLimit);
        timer.onTick.add(sec => {
            if (sec === 3) {
                this.createScoldedSummary();
            }
        });
        timer.onFinish.addOnce(() => this.onFinish.fire());
        timer.start();
        this.append(timer);

        this.onPointDownCapture.add(_ => {
            player.startEating();
            label.text = "クリック中は食べまくる！";
            label.invalidate();
        });
        this.onPointUpCapture.add(_ => {
            player.stopEating();
            label.text = "画面をクリック！";
            label.invalidate();
        });
    };

    private createBackground = (): void => {
        new g.FilledRect({
            scene: this,
            parent: this,
            width: g.game.width,
            height: g.game.height,
            cssColor: "rgb(192,176,160)",
        });
    };

    private createTitle = (): void => {
        new g.Label({
            scene: this,
            parent: this,
            text: "早弁チャレンジ",
            font: this.font,
            fontSize: FontSize.LARGE * 2,
            x: g.game.width / 2,
            y: FontSize.LARGE * 2,
            anchorX: 0.5,
            anchorY: 0.5,
        });
    };

    private createPlayer = (): Player => {
        const player = new Player(this);
        player.x = g.game.width / 2 - player.width * 2;
        player.y = (g.game.height + player.height) / 2;
        this.append(player);
        return player;
    };

    private createPlayerSummary = (player: Player): g.Label =>
        new g.Label({
            scene: this,
            parent: player,
            text: "画面をクリック！",
            font: this.font,
            fontSize: FontSize.MEDIUM,
            x: player.width / 2,
            y: -player.height / 4,
            anchorX: 0.5,
            anchorY: 0.5,
        });

    private createScoldedSummary = (): void => {
        const player = new Player(this);
        player.x = g.game.width / 2 + player.width * 2;
        player.y = (g.game.height + player.height) / 2;
        player.scolded();
        this.append(player);

        const teacher = new Teacher(this, g.game.random);
        teacher.x = player.x - teacher.width;
        teacher.y = player.y;
        teacher.startAngryAnimation();
        this.append(teacher);

        new g.Label({
            scene: this,
            parent: player,
            text: "教師に見つかるとタイムロスだ！",
            font: this.font,
            fontSize: FontSize.MEDIUM,
            x: player.width / 2,
            y: -player.height / 4,
            anchorX: 0.5,
            anchorY: 0.5,
        });
    };

    private createCopyright = (): void => {
        const font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            fontWeight: "bold",
            strokeWidth: (FontSize.TINY / 4),
            strokeColor: "#222",
            fontColor: "white",
            size: FontSize.TINY
        });
        new g.Label({
            scene: this,
            parent: this,
            text: "音楽 (C)PANICPUMPKIN",
            font: font,
            fontSize: FontSize.TINY,
            x: g.game.width / 2,
            y: g.game.height - FontSize.TINY,
            anchorX: 0.5,
            anchorY: 0.5,
        });
    };
}