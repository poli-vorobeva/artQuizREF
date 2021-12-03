import Control from "../common/controll";
import {QuestionsGenerator} from "../QuestionsGenerator/QuestionsGenerator";
import './GameField.css'
import {GameController} from "./GameController";
import {IAnswerObj, IParams, IWorkItem} from "../interface";
import {QuestionItems} from "./QuizItems";
import {IServerBothAnswer} from "../clientSocketModel";
import {IQuestions} from "../app";


export class GameField extends Control {
  private gameFieldWrapper: Control<HTMLElement>;
  private questionItems: QuestionItems;
  private controller: GameController;
  public onAnswer: (answer: boolean, index: number, author: string) => void
  public onlineDrawNextQuestion: () => void = () => {
    this.questionItems.onlineDrawNextQuestion()
  }
  public finishClick:(value:boolean)=>void
public onBothAnswer:(params:IServerBothAnswer)=>void = (params)=>{
    this.questionItems.bothAnswer(params)
}
  constructor(parentNode: HTMLElement,
              params: IParams,
              serverQuestions: IQuestions[],
              answerArray?: IAnswerObj[]) {
    super(parentNode);
    console.log('$$$', serverQuestions)
    this.controller = new GameController()
    //this.gameFieldWrapper = new Control(this.node, 'div', 'gameField-wrapper')
    this.questionItems = new QuestionItems(this.node, params, this, serverQuestions)
    this.questionItems.onAnswer = (answer, index, author) => {
      //console.log("THisss")
      this.onAnswer(answer, index, author)
    }
    this.questionItems.finishGame=(value)=>{
      this.finishClick(value)
    }
  }
}
