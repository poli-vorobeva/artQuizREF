import Control from "../common/controll";
import {QuestionsGenerator} from "../QuestionsGenerator/QuestionsGenerator";
import './GameField.css'
import {GameController} from "./GameController";
import {IAnswerObj, IParams, IWorkItem} from "../interface";
import {QuestionItems} from "./QuizItems";



export class GameField extends Control {
  public finishClick: (array:IAnswerObj[]) => void;
  public finish: (array:IAnswerObj[]) => void;
  private gameFieldWrapper: Control<HTMLElement>;
  private questionItems: QuestionItems;

  constructor(parentNode: HTMLElement, params: IParams,answerArray?:IAnswerObj[]) {
    console.log("&&")
    super(parentNode);
    this.gameFieldWrapper = new Control(this.node, 'div', 'gameField-wrapper')
    console.log(params, this,answerArray)
    this.questionItems = new QuestionItems(this.gameFieldWrapper.node, params, this,answerArray)
    this.finish = (array) => this.finishClick(array)
  }
}
