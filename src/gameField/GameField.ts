import Control from "../common/controll";
import {QuestionsGenerator} from "../QuestionsGenerator/QuestionsGenerator";
import './GameField.css'
import {GameController} from "./GameController";
import {IAnswerObj, IParams, IPlayerAnswer, IServerBothAnswer, IWorkItem} from "../interface";
import {QuestionItems} from "./QuizItems";
//import {IServerBothAnswer} from "../clientSocketModel";
import {IQuestions} from "../app";
import Signal from "../common/singal";
import {QuestionItem} from "./QuizItem";
import {QuizItemController} from "./QuizItemController";


class QuizItem {
}

export class GameField extends Control {
  private gameFieldWrapper: Control<HTMLElement>;
  public questionItems: QuestionItems;
  private controller: GameController;
  public onAnswer: (author: string) => void
  public nextQuestionFromServer: () => void
  public finishClick: (value: boolean) => void
  public singleQuestions: IQuestions[]
  public questionItem: QuestionItem
  public onBothAnswer: (params: IServerBothAnswer) => void = (params) => {
    this.questionItems.bothAnswer(params)
  }
  public getQuestionFromServer: (params: IWorkItem[], by: string, mode: string) => void;
  private questionIndex: number;
  private by: string;
  private mode: string;
  onFinishClick:()=>void
  constructor(parentNode: HTMLElement,
              params: IParams,
              answerArray?: IAnswerObj[],
              question?: IWorkItem[]) {
    super(parentNode);
    this.questionIndex = 0

    this.controller = new QuizItemController()
    if (params.mode === 'single') {
      const questions = new QuestionsGenerator(params).getQuestions()
      this.renderSingleQuestion(questions, params)
    }
    else {
      //TODO Multi
      this.renderMultiQuestion(question, params)
    }
  }
renderMultiQuestion(question:IWorkItem[],params?:IParams){
  this.mode=params?.mode
  this.by=params?.by
  this.questionItem = new QuestionItem(this.node, question, this.mode, this.by)
  this.questionItem.node.classList.add('questionItem')
  this.questionItem.onAnswer = (author) => this.onAnswer(author)
}

  renderNextServerQuestion(params: IWorkItem[]){
    this.questionItem.destroy()
  this.renderMultiQuestion(params)
}
  renderSingleQuestion(questions: IWorkItem[][], params: IParams) {
    const questionItem = new QuestionItem(this.node, questions[this.questionIndex],
      params.mode, params.by)
    questionItem.onSingleAnswer = (isCorrectAnswer) => {
      questionItem.destroy()
      this.questionIndex++
      if (this.questionIndex < questions.length) {
        this.renderSingleQuestion(questions, params)
      }
      else {
        //TODO finishScreen
        this.finishClick(true)
      }
    }
  }

  getAnswer(player: IPlayerAnswer, opponent: IPlayerAnswer, correct: string) {
    this.questionItem.setOnlineAnswerStyles(player, opponent, correct)
    this.nextQuestionFromServer()
    //TODO render new Question
    //    res(null)
    // })

  }


}

// import Control from "../common/controll";
// import {QuestionsGenerator} from "../QuestionsGenerator/QuestionsGenerator";
// import './GameField.css'
// import {GameController} from "./GameController";
// import {IAnswerObj, IParams, IPlayerAnswer, IServerBothAnswer, IWorkItem} from "../interface";
// import {QuestionItems} from "./QuizItems";
// //import {IServerBothAnswer} from "../clientSocketModel";
// import {IQuestions} from "../app";
// import Signal from "../common/singal";
//
//
// export class GameField extends Control {
//   private gameFieldWrapper: Control<HTMLElement>;
//   public questionItems: QuestionItems;
//   private controller: GameController;
//   public onAnswer: (author: string) => void
//   public nextQuestionFromServer:()=>void
//   public finishClick: (value: boolean) => void
//   public singleQuestions:IQuestions[]
//   public onBothAnswer: (params: IServerBothAnswer) => void = (params) => {
//     this.questionItems.bothAnswer(params)
//   }
//   public getQuestionFromServer: (params: IWorkItem[], by: string, mode: string) => void;
//
//   constructor(parentNode: HTMLElement,
//               // appFunction: () => void,
//               params: IParams,
//               // serverQuestions: IQuestions[],
//               answerArray?: IAnswerObj[],
//               question?: IWorkItem[]) {
//     super(parentNode);
//
//     // this.controller = new GameController()
//     //this.gameFieldWrapper = new Control(this.node, 'div', 'gameField-wrapper')
//     if(params.mode==='single'){
//       const questions=new QuestionsGenerator(params).getQuestions()
//       this.questionItems = new QuestionItems(this.node, params, null,questions[0])
//       //TODO
//     }else{
//       this.questionItems = new QuestionItems(this.node, params, null, question)
//       this.questionItems.onAnswer = (author) => {
//         this.onAnswer(author)
//       }
//       this.questionItems.finishGame = (value) => {
//         this.finishClick(value)
//       }
//       this.questionItems.nextQuestionFromServer=()=>{
//         this.nextQuestionFromServer()
//       }
//     }
//   }
//
//   getAnswer(player: IPlayerAnswer, opponent: IPlayerAnswer, correct: string) {
//     // return new Promise((res, rej) => {
//     this.questionItems.questionItem.setOnlineAnswerStyles(player, opponent, correct)
//     //    res(null)
//     // })
//
//   }
// }
