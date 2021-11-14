import {IAnswerObj, IWorkItem} from "../interface";

export class GameController {
  private questions: IAnswerObj[];
  constructor() {
    this.questions = []
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
}
