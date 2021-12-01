import Control from "../common/controll";
import {IAnswerObj, IParams, IWorkItem} from "../interface";
import {GameController} from "./GameController";
import {QuestionsGenerator} from "../QuestionsGenerator/QuestionsGenerator";
import {GameField} from "./GameField";
import {QuestionItem} from "./QuizItem";
import {OnlineGameController} from "./OnlineGameController";
import {IServerBothAnswer} from "../clientSocketModel";

export class QuestionItems extends Control {
  private currentQuestion: number;
  private questionItem: QuestionItem;
  private questionsGenerator: IWorkItem[][];
  private controller: GameController;
  private sendNewQuestions: any[];
  private onlineController: OnlineGameController;
  public onAnswer: (answer: boolean, index: number,author:string) => void
  public onlineDrawNextQuestion: () => void = () => {
   this.nextQuestion()
  }
  private createItem: () => void;
  private questionItemWrapper: Control<HTMLElement>;
  public bothAnswer: (params: IServerBothAnswer) => void;
public finishGame:(value:boolean)=>void

  constructor(parentNode: HTMLElement, params: IParams,
              gameField: GameField, serverQuestions: IWorkItem[][], answersArray?: IAnswerObj[]) {
    super(parentNode);
    this.currentQuestion = 0
    this.sendNewQuestions = []
    this.bothAnswer=(params:IServerBothAnswer)=>{
      this.questionItem.bothAnswer(params)
    }
    answersArray && answersArray.forEach(answer => {
      const subArray = []
      subArray.push(answer.correct)
      answer.itemArray.forEach(e => {
        if (e.author !== answer.correct.author) {
          subArray.push(e)
        }
      })
      this.sendNewQuestions.push(subArray)
    })
    this.questionsGenerator = null
    if (params.mode === 'online') {
      this.questionsGenerator = serverQuestions
      this.onlineController = new OnlineGameController()
    } else {
      this.questionsGenerator = !answersArray ? new QuestionsGenerator(params).questionsArray
        : this.sendNewQuestions
      this.controller = new GameController()
    }

    this.createItem = () => {
       this.questionItemWrapper= new Control(this.node,'div','itemWrapper .itemWrapper-hiddenIn')

      setTimeout(()=>{
        this.questionItemWrapper.node.classList.remove('itemWrapper-hiddenIn')
      },200)
      //правильный ответ запихивать перевым. потом остальные три
      if (this.currentQuestion < this.questionsGenerator.length) {
        this.questionItem = new QuestionItem(this.questionItemWrapper.node, this.currentQuestion,
          this.questionsGenerator[this.currentQuestion], params.mode, params.by)
        this.questionItem.onAnswer = (answer, index,author) => {
         // console.log(answer,index)
          this.onAnswer(answer, index,author)
        }
        this.questionItem.nextQuestion=(value)=>{

            this.questionItemWrapper.node.classList.add('itemWrapper-hiddenOut')
          setTimeout(()=>{
            value && this.nextQuestion()
          },1000)

        }
        this.questionItem.onSingleAnswer=(answer)=>{
          this.controller.singleQuestionAnswer(answer)
          this.questionItemWrapper.node.classList.add('itemWrapper-hiddenOut')
          setTimeout(()=>{
            this.nextQuestion()
          },1000)
        }
//если игра онлайн то дожидаемся ответа от сервера если нет то просто следующий вопрос
        //применяем функцию со стилями
       // this.nextQuestion()

      } else {
        //наверх прокинуть
        // console.log(this.controller.finishedCycle())
        this.finishGame(true)
       // gameField.finishClick(this.controller.finishedCycle())
       console.log( "Result",this.controller.getSingleResult())
      }
    }
    this.createItem()
  }
animateIn(){

}
  nextQuestion() {
    console.log("NEXTfunc")
    this.currentQuestion++
    this.questionItemWrapper.destroy()
    this.createItem()
    // this.questionItem.nextQuestion = function () {
    //   this.createItem()
    //   this.destroy()
    // }
  }
}
