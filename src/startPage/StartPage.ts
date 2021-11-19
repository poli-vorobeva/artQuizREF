import Control from "../common/controll";
import {App} from "../app";
import './StrartPage.css'
import {GameMode} from "./GameMode";
import {ICategory} from "../interface";
import {OnlineGameSettings} from "./OnlineGameSettins";
import {observer} from "../common/observer";
import Signal from "../common/singal";

export class StartPage extends Control {
  public wrapper: Control<HTMLElement>;
  onStartClick: (firstUser: string, secondUser: string) => void;
  onChoosedCategory: (cat: ICategory) => void
  onChoosedMode: (mode: string) => void
  onChoosedSort: (sort: string) => void
  onShowOnlineUsers: (input: HTMLInputElement) => void
  onStartOnlineGame: (user: string) => void
  private gameMode: GameMode;
  private parent: App;
  private userUl: Control<HTMLElement>;
  public serverCategories: string[];
  public serverRandom: number;
public chooseCategoryToServer:(cat:string)=>void
  constructor(parentNode: HTMLElement, parentApp: App,onStartGame:Signal<null>) {
    super(parentNode);
    this.serverRandom=null
    this.serverCategories=[]
    this.parent = parentApp
    this.wrapper = new Control(this.node, 'div', 'start-page')
    this.gameMode = new GameMode(this.wrapper.node)
    this.userUl = new Control(this.wrapper.node, 'ul')
    this.gameMode.onShowOnlineUsers = (input) => {
      this.onShowOnlineUsers(input)
      this.gameMode.onlineLobby.destroy()
    }
    this.gameMode.onChoosedCategory = (cat) => {
      this.gameMode.destroy()
      this.onChoosedCategory(cat)
    }
    this.gameMode.onChoosedMode = (mode) => {
      this.onChoosedMode(mode)
    }
    this.gameMode.onChoosedSort = (sort) => {
      this.onChoosedSort(sort)
    }
    //*********
    onStartGame.add((params)=>{
      this.wrapper.destroy()
      const onlineSettings = new OnlineGameSettings(this.parent.node,this.serverCategories,this.serverRandom)
    onlineSettings.chooseCategoryToServer=(cat)=>{
        this.chooseCategoryToServer(cat)
    }
    })
  }

  drawOnlineUsers(users: string[]) {
    this.userUl.node.innerHTML = null
    users && users.forEach((user: string) => {
      if (user) {
        const lis = new Control(this.userUl.node, 'li')
        const button = new Control(lis.node, 'button', '', user)
        button.node.onclick = () =>  this.onStartOnlineGame(user)
      }
    })
  }

}
