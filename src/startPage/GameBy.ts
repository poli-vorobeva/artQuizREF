import Control from "../common/controll";
import {categoriesList} from "../images";
import {ICategory} from "../interface";
import {observer} from "../common/observer";

export class GameBy extends Control {
  public painterQuestions: Control<HTMLElement>;
  public worksQuestions: Control<HTMLElement>;
  private questionsBy: Control<HTMLElement>;
  constructor(parentNode: HTMLElement) {
    super(parentNode);
    this.questionsBy = new Control(parentNode, 'div', 'guestionsBy')
    this.painterQuestions = new Control(this.questionsBy.node, 'div', 'painter-game', 'By painter')
    this.worksQuestions = new Control(this.questionsBy.node, 'div', 'works-game', 'By paints')
  }
}

export class ShowCategories extends Control {
  public category: Control<HTMLButtonElement>;
  public chooseCategory: (cat: string) => void
  private categories: Control<HTMLElement>;
  public chooseCategoryToServer:(cat:string)=> void;

public onChoosedCategory:(category:ICategory)=>void
  constructor(parentNode: HTMLElement, categories?: string[]) {

    super(parentNode);
    this.categories = new Control(parentNode, 'div', 'categories')
    let categList: string[] = []
    if (!categories) {
      categoriesList.forEach((cat) => {
        categList.push(cat.russian)
      })
    } else {
      categList = categories
    }
    categList.forEach(cat => {
      this.category = new Control(this.categories.node, 'div', 'category', cat)
      this.category.node.style.background = this.generateRandomColor()
      this.category.node.onclick = (e) => {
        console.log(cat)
        this.chooseCategoryToServer(cat)
        this.test(cat)
        // this.onChoosedCategory(category)
      }
    })
  }

test(c:string){
  return c
}
  generateRandomColor() {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    // return `rgba(${r},${g},${b},1)`
    return `linear-gradient(125deg,
         rgba(${r},${g},${b},1) 0%, rgba(${r},${g},${b},0.5) 38%, 
         rgba(${255 - r},${255 - g},${255 - b},1) 100%)`
  }
}
