import {IWorkItem} from "../interface";

export class QuizItemController{
    //получаем элемент-

    constructor(){

    }
    public isCorrect(currentAnswer:IWorkItem,correctAnswrer:IWorkItem):boolean{
        if(currentAnswer.author===currentAnswer.author && currentAnswer.name===correctAnswrer.name){
            return true
        }
        return false
    }
}