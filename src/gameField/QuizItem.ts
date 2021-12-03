import Control from "../common/controll";
import {IWorkItem} from "../interface";
import {GameController} from "./GameController";
import {QuizItemController} from "./QuizItemController";
import {IServerBothAnswer} from "../clientSocketModel";
import {IQuestions} from "../app";

function shuffle(array: IWorkItem[]) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export class QuestionItem extends Control {
  //public nextQuestion: () => void
  private element: Control<HTMLElement>;
  private correctAnswer: IWorkItem;
  private shuffledArray: IWorkItem[];
  private title: Control<HTMLElement>;
  private controller: QuizItemController;
  private correctAnswerHTMLElement: HTMLElement | null;
  public onAnswer: (answer: boolean, index: number,author:string) => void
  public onSingleAnswer: (answer: boolean) => void
  private gameMode: string;
  public bothAnswer: (params: IServerBothAnswer) => void;
  private variants:{[key:string]:HTMLElement};
  public  nextQuestion:(value:boolean)=>void;
  private allVariants: IWorkItem[];

  constructor(parentNode: HTMLElement,
              index: number, array: IQuestions, gameMode: string, by: string) {
    super(parentNode);
   // console.log("Y^Y^Y^&")
    this.gameMode = gameMode
    this.correctAnswer = array.correct
    this.variants = {}
    this.correctAnswerHTMLElement = null
    this.allVariants = []
    this.allVariants.push(array.correct)
    this.allVariants.push(...array.variants)
    this.shuffledArray = shuffle(this.allVariants)
    this.controller = new QuizItemController()
    this.bothAnswer = (params: IServerBothAnswer) => {

      Object.entries(this.variants).forEach(variant => {
        if (params.player.answerAuthor === variant[0]) {
          variant[1].querySelector('div').classList.add('playerAnswer')
           this.choiceStyle(variant[0],variant[1])
        }
        if (params.opponent.answerAuthor === variant[0]) {
          variant[1].querySelector('div').classList.add('opponentAnswer')
            this.choiceStyle(variant[0],variant[1])
        }

      })
      console.log("BY",by)
    }
      if (by === 'work') {
        console.log("RTTTTRRTRR")
        this.title = new Control(this.node, 'h5', 'questionItem-title',
            `какую из этих картин написал ${this.correctAnswer.author} ?`)
        const byWorkWrapper = new Control(this.node, 'div', 'byWorkWrapper')
        this.shuffledArray.forEach((p: IWorkItem) => {
          if (p.author === this.correctAnswer.author) {
            this.correctAnswer = p
          }
          const but = new Control(byWorkWrapper.node, 'div', 'questionItem-variant-work')
          but.node.style.backgroundImage = `url(./public/assets/img/${p.imageNum}.jpg)`
          this.variants[p.author] = but.node
          const insideDiv = new Control(but.node, 'div', 'item-isCorrect-color')
          if (this.correctAnswer.author === p.author) {
            this.correctAnswerHTMLElement = insideDiv.node
          }
          but.node.addEventListener('click', () => {
            this.onAnswer(this.controller.isCorrect(p, this.correctAnswer), index, p.author)
            // insideDiv.node.classList.add('playerAnswer')
          })

        })
      }
      if (by === 'painter') {
        console.log("RTTTTRRTRR")
        console.log('correct',this.correctAnswer )
        //какой художник нарисовал эту картину- выводим 4 художника
        const byPainterWrapper = new Control(this.node, 'div', 'byPainterWrapper')
        this.title = new Control(this.node, 'h5', 'questionItem-title',
            `Какой художник написал эту картину ?`)
        const imgWrapper = new Control(this.node, 'div', 'questionItem-img')

        imgWrapper.node.style.backgroundImage = `url(./public/assets/full/${this.correctAnswer.imageNum}full.jpg)`

        this.shuffledArray.forEach(p => {
          const but = new Control(byPainterWrapper.node, 'div', 'questionItem-variant-painter', p.author)
          const insideDiv = new Control(but.node, 'div', 'item-isCorrect-color')
          this.variants[p.author] = but.node
          if (this.correctAnswer.author === p.author) {
            this.correctAnswerHTMLElement = insideDiv.node
          }
          but.node.onclick=()=>{
            insideDiv.node.classList.add('playerAnswer')
            if (this.gameMode === 'single') {
              this.onSingleAnswer(this.controller.isCorrect(p, this.correctAnswer))
            } else {
              this.onAnswer(this.controller.isCorrect(p, this.correctAnswer), index, p.author)
            }

          }
        })
      }

  }
  choiceStyle(author:string, element:HTMLElement){
    element.querySelector('div').ontransitionend=()=>{
      if(author==this.correctAnswer.author){
     //  setTimeout(()=>{
          element.querySelector('div').classList.add('correctAnswer')
          element.ontransitionend=()=>{
            this.nextQuestion(true)
          }
    //    },1000)
      }else{
     //   setTimeout(()=>{
          element.querySelector('div').classList.add('mistakeAnswer')
          element.ontransitionend=()=>{
            this.nextQuestion(true)
          }
      //  },1000)
      }
    }
  }

}
