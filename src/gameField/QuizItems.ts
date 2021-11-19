import Control from "../common/controll";
import {IAnswerObj, IParams, IWorkItem} from "../interface";
import {GameController} from "./GameController";
import {QuestionsGenerator} from "../QuestionsGenerator/QuestionsGenerator";
import {GameField} from "./GameField";
import {QuestionItem} from "./QuizItem";

export class QuestionItems extends Control {
  private currentQuestion: number;
  private questionItem: QuestionItem;
  private questionsGenerator: IWorkItem[][];
  private controller: GameController;
  private sendNewQuestions: any[];

  constructor(parentNode: HTMLElement, params: IParams,
              gameField: GameField,answersArray?:IAnswerObj[]) {
    super(parentNode);
    this.currentQuestion = 0
    this.sendNewQuestions=[]

    answersArray && answersArray.forEach(answer=>{
      const subArray=[]
      subArray.push(answer.correct)
      answer.itemArray.forEach(e=>{
        if(e.author!==answer.correct.author){
          subArray.push(e)
        }
      })
      this.sendNewQuestions.push(subArray)
    })
    this.questionsGenerator = !answersArray ? new QuestionsGenerator(params).questionsArray
      :this.sendNewQuestions
    console.log(this.questionsGenerator)
    this.controller=new GameController()
    const createItem = () => {
      console.log('^',params)
      //правильный ответ запихивать перевым. потом остальные три
      if (this.currentQuestion < this.questionsGenerator.length) {
        this.questionItem = new QuestionItem(parentNode,this.controller, this.currentQuestion,
          this.questionsGenerator[this.currentQuestion], params.by)
        this.currentQuestion++
        this.questionItem.nextQuestion = function () {
          createItem()
          this.destroy()
        }
      } else {
        gameField.finishClick(this.controller.finishedCycle())
      }
    }
    createItem()
  }
}
