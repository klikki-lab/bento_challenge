import { GameMainParameterObject } from "./parameterObject";
import { GameScene } from "./game_scene/gameScene";
import { TitleScene } from "./title_scene/titleScene";

export function main(param: GameMainParameterObject): void {
    g.game.vars.version = "0.0.1";//バージョン更新忘れずに!!

    g.game.audio.music.volume = 0.15;
    g.game.audio.sound.volume = 0.3;
    g.game.vars.gameState = {
        score: 0,
        playThreshold: 1,
        clearThreshold: undefined,
    };

    //const totalTimeLimit = param.sessionParameter.totalTimeLimit ?? 75;
    
    const titleScene = new TitleScene(7);
    titleScene.onFinish.add(() => {
        g.game.pushScene(new GameScene(param, 60));
    });
    g.game.pushScene(titleScene);
}