import { FontSize } from "../../common/fontSize";

export class Score extends g.Label {

    private static readonly ADD = 10;
    private static readonly TARGET_SCORE = 25 * Score.ADD * 20;

    constructor(scene: g.Scene, font: g.DynamicFont) {
        super({
            scene: scene,
            text: `スコア ${g.game.vars.gameState.score}`,
            font: font,
            fontSize: FontSize.LARGE,
            x: g.game.width / 2,
            y: FontSize.LARGE / 2,
            anchorX: 0.5,
        });
    }

    add = (score: number = Score.ADD) => {
        g.game.vars.gameState.score += Math.floor(score * (30 / g.game.fps));
        this.text = `スコア ${g.game.vars.gameState.score}`;
        this.invalidate();
    };

    getSatietyLevel = (): number => g.game.vars.gameState.score / Score.TARGET_SCORE;
}