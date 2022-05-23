import Control from "../common/controll";
import {App} from "../app";
import './StrartPage.css'
import {GameMode} from "./GameMode";
import {ICategory} from "../interface";
import {OnlineGameSettings} from "./OnlineGameSettins";

export class StartPage extends Control {
  public wrapper: Control<HTMLElement>;
  onStartClick: (firstUser: string, secondUser: string) => void;
  onChoosedCategory: (cat: ICategory) => void
  onChoosedMode: (mode: string) => void
  onChoosedSort: (sort: string) => void
  onShowOnlineUsers: (input: HTMLInputElement) => void
  onStartOnlineGame: (user: string) => void
  public gameMode: GameMode;
 // private parent: App;
  public userUl: Control<HTMLElement>;
  public serverCategories: string[];
  public serverRandom: number;
  private onlineSettings: OnlineGameSettings;
  public onlineSettingsDestroy: () => void;
  public onExcludedCategory: (category: string) => void
  public onSort: (sort: string) => void
  parent: HTMLElement;
  public gameModeWrapper: Control<HTMLElement>;
alert:Control<HTMLElement>
  constructor(parentNode: HTMLElement,getMode:()=>string) {
    super(parentNode);
    this.node.classList.add('startPage')
    this.parent=parentNode
    this.serverRandom = null
    this.serverCategories = []
    this.gameModeWrapper = new Control(this.node, 'div', 'gameModeWrapper')
    this.gameMode = new GameMode(this.gameModeWrapper.node,getMode)
    this.userUl = new Control(this.gameModeWrapper.node, 'ul')

    this.gameMode.onShowOnlineUsers = (input) => {
      this.onShowOnlineUsers(input)
      this.gameMode.onlineLobby.destroy()
    }
    this.gameMode.onChoosedCategory = (cat) => {
      this.gameMode.destroy()
      this.onChoosedCategory(cat)
    }
    this.gameMode.onChoosedMode = (mode) => {
      //this.gameModeWrapper.destroy()
      this.onChoosedMode(mode)
    }
    this.gameMode.onChoosedSort = (sort) => {
    //  this.onChoosedSort(sort)
     // this.gameMode.destroy()
      this.onSort(sort)
    }
  }

  onlineSettingsInit() {
    this.gameModeWrapper.destroy()
    this.onlineSettings = new OnlineGameSettings(
      this.parent, this.serverCategories, this.serverRandom)
    this.onlineSettingsDestroy = () => {
      this.onlineSettings.destroyWrapper()
    }
    this.onlineSettings.onExcludedCategory = (category: string) => {
      this.onExcludedCategory(category)
    }
    this.onlineSettings.onSort = (sort: string) => {
      this.onSort(sort)
    }
  }

  redrawCategories(category: string) {
    this.onlineSettings.redrawCategories(category)
  }

  drawOnlineUsers(users: string[]) {
    this.userUl.node.innerHTML = null
    const usrs=users.filter(e=>e)
    usrs.length>0 ? users.forEach((user: string) => {
      if (user) {
        const lis = new Control(this.userUl.node, 'li')
        const button = new Control(lis.node, 'button', '', user)
        button.node.onclick = () => this.onStartOnlineGame(user)
      }
    })
      :new Control(this.userUl.node,'h4','','There is no players yet')
  }

}