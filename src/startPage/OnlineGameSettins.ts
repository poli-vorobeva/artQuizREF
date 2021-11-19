import Control from "../common/controll";
import {GameBy, ShowCategories} from "./GameBy";
import {observer} from "../common/observer";

export class OnlineGameSettings extends Control {

  public chooseCategoryToServer:(cat:string)=>void;
  private gameBy: GameBy;
  constructor(parentNode:HTMLElement,categories:string[],randomNumber:number) {
    super(parentNode);
    const wrapper = new Control(parentNode, 'div', 'onlineGameSettings')
    const randomChoice = new Control(wrapper.node, 'div', 'randomChoice')
    this.gameBy = new GameBy(wrapper.node)

    const buttons = [this.gameBy.painterQuestions, this.gameBy.worksQuestions]
    let valueGameBy = ''
    const categors =()=> new ShowCategories(parentNode,categories)
    this.chooseCategoryToServer=(cat)=>{
      console.log("RTR")
      categors().chooseCategoryToServer(cat)
    }
    for (let i = 0; i <=randomNumber ; i++) {
      setTimeout(function (i_local) {
        return function () {
          randomChoice.node.textContent = (randomNumber- i_local).toString()
          if (i_local % 2 == 0) {
            buttons[1].node.classList.add('activeButton')
            buttons[0].node.classList.contains('activeButton') && buttons[0].node.classList.remove('activeButton')
            valueGameBy = 'painter'
          } else {
            buttons[0].node.classList.add('activeButton')
            buttons[1].node.classList.contains('activeButton') && buttons[1].node.classList.remove('activeButton')
            valueGameBy = 'work'
          }
          if (i === randomNumber) {
            wrapper.destroy()
            categors()
          }
        }
      }(i), i * 500);

    }

  }

}
