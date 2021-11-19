import Control from "../common/controll";
import {IWorkItem} from "../interface";
import {GameController} from "./GameController";
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
  public nextQuestion: () => void
  private element: Control<HTMLElement>;
  private correctAnswer: IWorkItem;
  private shuffledArray: IWorkItem[];
  private title: Control<HTMLElement>;
  private controller: GameController;
  private correctAnswerHTMLElement: HTMLElement|null;

  constructor(parentNode: HTMLElement,controller:GameController,
              index: number, array: IWorkItem[], by: string) {
    super(parentNode);
    this.correctAnswer = array[0]
    this.correctAnswerHTMLElement=null
    this.shuffledArray = shuffle(array)
    this.controller = controller
    this.element = new Control(this.node, 'div', 'questionItem')
    console.log(by,'))')
    if (by === 'works') {
      this.title = new Control(this.element.node, 'h5', 'questionItem-title',
        `какую из этих картин написал ${this.correctAnswer.author} ?`)
      this.shuffledArray.forEach(p => {
        if(p.author===this.correctAnswer.author){ this.correctAnswer=p }
        const but = new Control(this.element.node, 'div', 'questionItem-variant-work')
        but.node.style.backgroundImage = `url(./public/assets/img/${p.imageNum}.jpg)`
        const insideDiv = new Control(but.node, 'div', 'item-isCorrect-color')
        if(this.correctAnswer.author===p.author){
          this.correctAnswerHTMLElement=insideDiv.node
        }
        but.node.addEventListener('click', () => this.isCorrectStyles(insideDiv,p))
      })
    } else if (by === 'painter') {
      //какой художник нарисовал эту картину- выводим 4 художника
      this.title = new Control(this.element.node, 'h5', 'questionItem-title',
        `Какой художник написал эту картину ?`)
      const imgWrapper = new Control(this.element.node, 'div', 'questionItem-img')
      imgWrapper.node.style.backgroundImage = `url(./public/assets/full/${this.correctAnswer.imageNum}full.jpg)`

      this.shuffledArray.forEach(p => {
        const but = new Control(this.element.node, 'div', 'questionItem-variant-painter', p.author)
        const insideDiv = new Control(but.node, 'div', 'item-isCorrect-color')
        if(this.correctAnswer.author===p.author){
          this.correctAnswerHTMLElement=insideDiv.node
        }
        but.node.addEventListener('click', (e) => this.isCorrectStyles(insideDiv,p))
      })
    }
    console.log(this.element.node)
  }
  isCorrectStyles(insideDiv:Control,p:IWorkItem){
    const isCorrect = this.controller.answer({itemArray:this.shuffledArray,correct:this.correctAnswer,clickedAnswer:p})
    if(isCorrect){
      insideDiv.node.style.backgroundColor='green'
    }else{
      insideDiv.node.style.backgroundColor='red'
      this.correctAnswerHTMLElement.style.backgroundColor='green'
    }
    setTimeout(()=>{
      this.nextQuestion()
    },500)
  }
}
