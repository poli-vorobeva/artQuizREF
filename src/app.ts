import Control from "./common/controll";
import {categories, categoriesList} from "./images";
import {StartPage} from "./startPage/StartPage";
import {GameField} from "./gameField/GameField";
import {FinishScreen} from "./finishScreen/FinishScreen";
import {IAnswerObj} from "./interface";

//import {canvasAnimate} from "./canvasAnimate";

export class App extends Control {
  public choosedMode: null | string;
  public questions: null | string;
  public choosedCategory: null | string;
  public gameField: GameField;
  private canvas: Control<HTMLCanvasElement>;

//сохранять режим и сортировку.
  constructor(parentNode: HTMLElement) {
    super(parentNode);
    this.canvas = new Control(parentNode, 'canvas')
    //new canvasAnimate(this.canvas.node)
    this.choosedMode = null
    this.questions = null
    this.choosedCategory = null
    this.gameCycle()
  }

  gameCycle() {
    const startPage = new StartPage(this.node, this)
    startPage.onStartClick = () => {
      startPage.destroy()
      this.smallCycle()
    }
  }

  smallCycle(array?:IAnswerObj[]) {
    console.log('*',array)

    this.gameField = new GameField(this.node, {
      mode: this.choosedMode, by: this.questions,
      category: this.choosedCategory
    },array)
    this.gameField.finishClick = (questionsArray: IAnswerObj[]) => {
      console.log("From App", questionsArray)
      this.gameField.destroy()
      const resultScreen = new FinishScreen(this.node, questionsArray, this)
      resultScreen.startSmallCycle=(array:IAnswerObj[])=>{
        resultScreen.destroy()
        this.smallCycle(array)
      }
      resultScreen.toStartClick = () => {
        resultScreen.destroy()
        this.gameCycle()
      }

    }
  }
}
