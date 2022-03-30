import Control from "../common/controll";
import {IAnswerObj} from "../interface";

export class FinishScreen extends Control{
    private finishWrapper: Control<HTMLElement>;
    private startPageButton: Control<HTMLButtonElement>;
    public toStartClick: ()=>void;
    public startSmallCycle:(array:IAnswerObj[])=>void
  private gameResults: Control<HTMLElement>;
    constructor(parentNode:HTMLElement) {
        super(parentNode,'div','finishScreen','FINISH');
        this.startPageButton=new Control(this.node,'button','startPage-button','to Lobby')
    //   const answers= answersArray.filter(e=>e.clickedAnswer===e.correct)
    //   this.gameResults  = new Control(this.finishWrapper.node,'div','',
    //     `Правильных ответов : ${answers.length}`)
     // const repeat= new Control(this.gameResults.node,'button','repeat-button','repeat this Game')
  //      repeat.node.onclick=()=>{this.startSmallCycle(answersArray)}
        this.startPageButton.node.onclick=()=>{
            this.toStartClick()
        }
    }
}
