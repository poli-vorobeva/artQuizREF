import Control from "../common/controll";
import {categoriesList} from "../images";
import {ICategory} from "../interface";

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
