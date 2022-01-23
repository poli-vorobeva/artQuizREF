import Control from "../common/controll";
import {IAnswerObj, IParams, IServerBothAnswer, IWorkItem} from "../interface";
import {GameController} from "./GameController";
import {QuestionsGenerator} from "../QuestionsGenerator/QuestionsGenerator";
import {GameField} from "./GameField";
import {QuestionItem} from "./QuizItem";
import {IQuestions} from "../app";
import Signal from "../common/singal";
import {observer} from "../common/observer";

export class QuestionItems extends Control {
  //private currentQuestion: number;
  public questionItem: QuestionItem;
  private questionsGenerator: IQuestions[];
  private controller: GameController;
  public generateQuestion: (bool: boolean) => void
  public onAnswer: (author: string) => void
  private createItem: () => void;
  private questionItemWrapper: Control<HTMLElement>;
  public bothAnswer: (params: IServerBothAnswer) => void;
  public finishGame: (value: boolean) => void
  // public getQuestionFromServer: (params: IWorkItem[], by: string, mode: string) => void;
  public nextQuestionFromServer: () => void;
  private nextQuestionData: IWorkItem
  public drawQuestionFromServer: (question: IWorkItem[]) => void;

  constructor(parentNode: HTMLElement, params: IParams,
              answersArray?: IAnswerObj[], question?: IWorkItem[]) {
    super(parentNode);
    //this.currentQuestion = 0
    //this.sendNewQuestions = []
    //  this.onGetQuestion(true)
console.log(question)
    this.drawQuestionFromServer = (question: IWorkItem[]) => {
      this.questionItem.destroy()
      this.createQuestionItem(question, params.mode, params.by)
    }

    this.questionItemWrapper = new Control(this.node, 'div', 'itemWrapper')
    this.createQuestionItem(question, params.mode, params.by)

    this.bothAnswer = (params: IServerBothAnswer) => {
      //  this.questionItem.bothAnswer(params)
    }
    answersArray && answersArray.forEach(answer => {
      //   const subArray = []
      //   subArray.push(answer.correct)
      //    answer.itemArray.forEach(e => {
      //      if (e.author !== answer.correct.author) {
      //        subArray.push(e)
      //      }
      //    })
      //  this.sendNewQuestions.push(subArray)
    })
    this.questionsGenerator = null
    if (params.mode === 'online') {
      // this.questionsGenerator = serverQuestions
    //  this.onlineController = new OnlineGameController()
    } else {
      // this.questionsGenerator = !answersArray ? new QuestionsGenerator(params).questionsArray
      //   : this.sendNewQuestions
      // this.controller = new GameController()
    }

  }

  styleHideOutQuestion() {
    return new Promise((res, rej) => {
      console.log("Frompo hide")
      this.questionItem.node.style.transform = `translateX(200px)`
      this.questionItem.node.style.opacity = `0`
      this.questionItem.node.ontransitionend = () => {
        res(null)
      }
    })


  }

  createQuestionItem(question: IWorkItem[], mode: string, by: string) {
    this.questionItem = new QuestionItem(this.questionItemWrapper.node, question, mode, by)
    this.questionItem.node.classList.add('questionItem')
    this.questionItem.onAnswer = (author) => {
      if (mode === 'online') {
        this.onAnswer(author)
      } else {
        //логика для одиночного ответа
      }
    }
    this.questionItem.onSingleAnswer = (answer) => {
      //  this.controller.singleQuestionAnswer(answer)
      this.questionItemWrapper.node.classList.add('itemWrapper-hiddenOut')
      //      setTimeout(()=>{
      this.nextQuestion()
      //   },1000)
    }
    this.questionItem.hideOutItemStyle = () => {
      this.hideOutQuestion().then(()=>{
        this.nextQuestionFromServer()
      })

    }
  }

    nextQuestion() {
      console.log("NEXTfunc")
      //  this.currentQuestion++
      this.questionItemWrapper.destroy()
      this.createItem()
      // this.questionItem.nextQuestion = function () {
      //   this.createItem()
      //   this.destroy()
      // }
    }


  hideOutQuestion() {
    return new Promise((res, rej) => {
      this.styleHideOutQuestion()
      res(null)
    })
  }
}
