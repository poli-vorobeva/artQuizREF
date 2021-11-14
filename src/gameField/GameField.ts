import Control from "../common/controll";
import {QuestionsGenerator} from "../QuestionsGenerator/QuestionsGenerator";
import './GameField.css'
import {GameController} from "./GameController";
import {IAnswerObj, IWorkItem} from "../interface";

export interface IParams {
  mode: string,
  by: string,
  category: string
}

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

  constructor(parentNode: HTMLElement,controller:GameController, index: number, array: IWorkItem[], by: string) {
    super(parentNode);
    this.correctAnswer = array[0]
    this.correctAnswerHTMLElement=null
    this.shuffledArray = shuffle(array)
    this.controller = controller
    this.element = new Control(this.node, 'div', 'questionItem')
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
      //правильный ответ запихивать перевым. потом остальные три
      if (this.currentQuestion < this.questionsGenerator.length) {
        this.questionItem = new QuestionItem(this.node,this.controller, this.currentQuestion,
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


export class GameField extends Control {
  public finishClick: (array:IAnswerObj[]) => void;
  public finish: (array:IAnswerObj[]) => void;
  private gameFieldWrapper: Control<HTMLElement>;
  private questionItems: QuestionItems;

  constructor(parentNode: HTMLElement, params: IParams,answerArray?:IAnswerObj[]) {
    super(parentNode);
    this.gameFieldWrapper = new Control(this.node, 'div', 'gameField-wrapper')
    this.questionItems = new QuestionItems(this.gameFieldWrapper.node, params, this,answerArray)
    this.finish = (array) => this.finishClick(array)
  }
}
