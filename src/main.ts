import { GameMainParameterObject } from "./parameterObject";
import { GameScene } from "./game_scene/gameScene";
import { TitleScene } from "./title_scene/titleScene";

export function main(param: GameMainParameterObject): void {
    g.game.audio.music.volume = 0.5;
    g.game.audio.sound.volume = 0.5;
    g.game.vars.gameState = {
        score: 0,
        playThreshold: 1,
        clearThreshold: undefined,
    };

    const titleScene = new TitleScene(7);
    titleScene.onFinish.add(() => {
        g.game.pushScene(new GameScene(param, 60));
    });
    g.game.pushScene(titleScene);
}
