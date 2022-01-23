import Control from "../common/controll";
import {GameBy} from "./GameBy";
import {ShowCategories} from "./ShowCategories";

export class OnlineGameSettings extends Control {
  public onExcludedCategory: (category: string) => void;
  public onSort: (sort: string) => void
  private gameBy: GameBy;
  private randomChoice: Control<HTMLElement>;
  private buttons: Control<HTMLElement>[];
  private valueGameBy: string;
  private wrapper: Control<HTMLElement>;
  private categoriesEl: ShowCategories;
  private parent: HTMLElement;
  private categories: string[];
  private wrapperCategories: Control<HTMLElement>;
  private sort: string;

  constructor(parentNode: HTMLElement, categories: string[],
              randomNumber: number
  ) {
    super(parentNode);
    this.parent = parentNode
    this.categories = categories
    this.wrapper = new Control(parentNode, 'div', 'onlineGameSettings')
    this.randomChoice = new Control(this.wrapper.node, 'div', 'randomChoice')
    this.gameBy = new GameBy(this.wrapper.node)
    this.sort = ''
    this.buttons = [this.gameBy.painterQuestions, this.gameBy.worksQuestions]
    this.valueGameBy = ''

    for (let i = 0; i <= randomNumber; i++) {
      this.timeout(i, randomNumber)
    }
  }

  timeout(_i: number, randomNumber: number) {
    setTimeout(() => {
      this.randomChoice.node.textContent = (randomNumber - _i).toString()
      if (_i % 2 == 0) {
        this.buttons[1].node.classList.add('activeButton')
        this.buttons[0].node.classList.contains('activeButton')
        && this.buttons[0].node.classList.remove('activeButton')
        //****************
        this.sort = 'painter'
      } else {
        this.buttons[0].node.classList.add('activeButton')
        this.buttons[1].node.classList.contains('activeButton')
        && this.buttons[1].node.classList.remove('activeButton')
        this.sort = 'work'
      }
      if (_i === randomNumber) {
        this.wrapper.destroy()
        this.wrapperCategories = new Control(this.parent, 'div')
        this.categoriesEl = new ShowCategories(this.wrapperCategories.node, this.categories)
        this.categoriesEl.onExcludedCategory = (category:string) => {
          console.log(category)
          this.onExcludedCategory(category)
        }
        this.onSort(this.sort)
      }
    }, _i * 300)
  }

  destroyWrapper() {
    this.wrapperCategories.destroy()
  }

  redrawCategories(category: string) {
    this.categoriesEl.deleteOneCategory(category)
  }
}
