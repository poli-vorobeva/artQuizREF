import Control from "../common/controll";
import {OnlineLobby} from "./OnlineLobby";
import {observer} from "../common/observer";
import {ICategory} from "../interface";
import {GameBy, ShowCategories} from "./GameBy";

export class GameMode extends Control {
  public onChoosedCategory: (cat: ICategory) => void;
  public onChoosedMode: (mode: string) => void;
  public onChoosedSort: (sort: string) => void;
  public onShowOnlineUsers: (input: HTMLInputElement) => void;
  public onlineLobby: OnlineLobby;
  public gameMode: Control<HTMLElement>;
  private singleGame: Control<HTMLElement>;
  private onlineGame: Control<HTMLElement>;
  private startPage: HTMLElement;
  private gameBy: GameBy;
  private showCategories: ShowCategories;
  private byWrapper: Control<HTMLElement>;
  private choosedMode: string;
  private getMode: () => string;

  constructor(startPage: HTMLElement,getMode:()=>string) {
    super(startPage);
    this.startPage = startPage
    this.getMode=getMode
    this.node.classList.add('gameMode')
   // this.choosedMode=choosedMode
    this.gameMode = new Control(this.node, 'div', 'start-page-gameMode')
    this.singleGame = new Control(this.gameMode.node, 'div', 'single-game', 'Single Game')
    this.singleGame.node.addEventListener('click', (e) => {
      this.onChoosedMode('single')
      this.gameMode.destroy()
      this.byWrapper = new Control(this.node, 'div','game-by')
      this.gameBy = new GameBy(this.byWrapper.node)
      this.gameBy.painterQuestions.node.onclick = () => {
        this.byWrapper.destroy()
        this.onChoosedSort('painter')
        this.singleDrawCategories('painter')
      }
      this.gameBy.worksQuestions.node.onclick = () => {
        this.byWrapper.destroy()
        this.onChoosedSort('works')
        this.singleDrawCategories('works')
      }
    })
    this.onlineGame = new Control(this.gameMode.node, 'div', 'online-game', 'Online Game')
    this.onlineGame.node.onclick = (e: Event) => {
      this.onChoosedMode('online')
      this.gameMode.destroy()
      this.onlineLobby = new OnlineLobby(this.startPage)
      this.onlineLobby.onShowOnlineUsers = (input) => {
        this.onShowOnlineUsers(input)
      }
      observer.addListener('startGame', () => {
        this.onlineLobby.destroy()
      })
    }
  }

  singleDrawCategories(mode: string) {
    this.onChoosedSort(mode)
   console.log(this.getMode(),'&&&^&^&')
    this.showCategories = new ShowCategories(this.startPage,false,'single')
    this.showCategories.onChoosedCategory = (category) => {
      this.onChoosedCategory(category)
    }
  }
}
