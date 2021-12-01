import {IAnswerObj, IWorkItem} from "../interface";

export class GameController {
  private questions: IAnswerObj[];
  singleAnswers:number
  constructor() {
    this.questions = []
    this.singleAnswers=0
  }

  setLocalResults() {

  }
  answer(answerObj:IAnswerObj){
    this.questions.push(answerObj)
    if(answerObj.correct.author===answerObj.clickedAnswer.author){
     if(this.isCorrect(answerObj)){
       return true
     }else{
       return false
     }
    }
  }
  isCorrect(answer:IAnswerObj) {
    if(answer.correct.author===answer.clickedAnswer.author){
      return true
    }
    return false
  }
  finishedCycle(){
    return this.questions

  }
  singleQuestionAnswer(answer:boolean){
    this.singleAnswers+= +answer
  }
  getSingleResult(){
    return this.singleAnswers
  }
}
