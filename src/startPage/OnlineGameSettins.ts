import Control from "../common/controll";
import {GameBy, ShowCategories} from "./GameBy";

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
        this.categoriesEl.onExcludedCategory = (category) => {
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


// import Control from "../common/controll";
// import {GameBy, ShowCategories} from "./GameBy";
// import Signal from "../common/singal";
//
// export class OnlineGameSettings extends Control {
//   private gameBy: GameBy;
//   private randomChoice: Control<HTMLElement>;
//   private buttons: Control<HTMLElement>[];
//   private valueGameBy: string;
//   private wrapper: Control<HTMLElement>;
//   private categoriesEl: ShowCategories;
//   private parent: HTMLElement;
//   private categories: string[];
//  // private categorySignal: Signal<string>;
//  // private redrawSignal: Signal<string>;
//   private oneChoosedCategory: Signal<string>;
//   private wrapperCategories: Control<HTMLElement>;
//   private sortBy: (by: string) => void;
//   private drawOnlineGameField: Signal<null>;
//   //private gameBySignal: Signal<string>;
//   private sort: string;
//   public onSortSignal: Signal<string>= new Signal<string>();
//
//   constructor(parentNode: HTMLElement, categories: string[],
//               randomNumber: number,
//               //categorySignal: Signal<string>,
//              // redrawSignal: Signal<string>,
//               oneChoosedCategory:Signal<string>,
//              // sortBy:(by:string)=>void,
//               drawOnlineGameField:Signal<null>,
//              // gameBySignal:Signal<string>
//               )
//               {
//     super(parentNode);
//    // this.gameBySignal=gameBySignal
//     this.drawOnlineGameField=drawOnlineGameField
//    // this.sortBy=sortBy
//     this.oneChoosedCategory=oneChoosedCategory
//     //this.redrawSignal = redrawSignal
//     //this.categorySignal = categorySignal
//     this.parent = parentNode
//     this.categories = categories
//     this.wrapper = new Control(parentNode, 'div', 'onlineGameSettings')
//     this.randomChoice = new Control(this.wrapper.node, 'div', 'randomChoice')
//     this.gameBy = new GameBy(this.wrapper.node)
//     this.sort=''
//
//     this.buttons = [this.gameBy.painterQuestions, this.gameBy.worksQuestions]
//     this.valueGameBy = ''
//
//     for (let i = 0; i <= randomNumber; i++) {
//       this.timeout(i, randomNumber)
//     }
//   }
//   timeout(_i: number, randomNumber: number) {
//     setTimeout(() => {
//       this.randomChoice.node.textContent = (randomNumber - _i).toString()
//       if (_i % 2 == 0) {
//         this.buttons[1].node.classList.add('activeButton')
//         this.buttons[0].node.classList.contains('activeButton')
//         && this.buttons[0].node.classList.remove('activeButton')
//          this.sort= 'painter'
//       } else {
//         this.buttons[0].node.classList.add('activeButton')
//         this.buttons[1].node.classList.contains('activeButton')
//         && this.buttons[1].node.classList.remove('activeButton')
//         this.sort = 'work'
//       }
//       if (_i === randomNumber) {
//         this.wrapper.destroy()
//         this.wrapperCategories=new Control(this.parent,'div')
//         this.categoriesEl = new ShowCategories(this.wrapperCategories.node, this.categorySignal,
//           this.categories)
//         this.oneChoosedCategory.add((category)=>{
//           this.wrapperCategories.destroy()
//         })
//         this.redrawSignal.add((category) => {
//            this.categoriesEl.deleteOneCategory(category)
//           }
//         )
//      //   this.sortBy(this.valueGameBy)
//       //  this.gameBySignal.emit(this.sort)
//       //  console.log("ThisPre",this.questionsBy)
//        // this.drawOnlineGameField.emit(null)
//         this.onSortSignal.emit(this.sort)
//       }
//     }, _i * 300)
//   }
// }
