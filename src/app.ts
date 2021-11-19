import Control from "./common/controll";
import {StartPage} from "./startPage/StartPage";
import {GameField} from "./gameField/GameField";
import {FinishScreen} from "./finishScreen/FinishScreen";
import {IAnswerObj, IRoom, IServerResponseMessage, IUser} from "./interface";

import {ClientSocketModel} from "./clientSocketModel";
import {categories, categoriesList} from "./images";
import Signal from "./common/singal";

export interface IGameSettings {
  number: number,
  categories: string[]
}

export type IUsernameList = string[]

export class App extends Control {
  public choosedMode: null | string;
  public questions: null | string;
  public choosedCategory: null | { russian: string, english: string, painters: string[] };
  public gameField: GameField;
  public users: string[];
  public addPlayer: string;
  public currentRoom: IRoom;
  public isActivePlayer: boolean;
  public randomNumber: number;
  public categories: string[];
  private currentUser: string;
  private clientSocketModel: ClientSocketModel;
  private onOnlineSettings: Signal<IGameSettings> = new Signal();
  private onGetUserList: Signal<IUsernameList> = new Signal();
  private onStartGame: Signal<null> = new Signal<null>()
  private chooseCategoryToServer:(cat:string)=>void
  private dataSettings: () => () => (number | string[])[];

  constructor(parentNode: HTMLElement) {
    super(parentNode);

    this.users = []
    this.randomNumber = 0
    this.addPlayer = ''
    this.currentUser = ''
    this.isActivePlayer = false
    this.categories = []
    this.currentRoom = null
    this.clientSocketModel = new ClientSocketModel(this, this.setSettingsData,
      this.onOnlineSettings,
      this.onGetUserList, this.onStartGame)

    this.choosedMode = null
    this.questions = null
    this.choosedCategory = null
    this.gameCycle()
  }

  gameCycle() {
    const startPage = new StartPage(this.node, this, this.onStartGame)
    startPage.chooseCategoryToServer=(cat)=>{
      this.sendChoosedCategory(cat)
    }
    startPage.onChoosedCategory = (cat) => {
      this.choosedCategory = cat
      startPage.destroy()
      this.smallCycle()
    }
    startPage.onChoosedMode = (mode) => {
      this.choosedMode = mode
    }
    startPage.onShowOnlineUsers = (input) => {
      if (input.value) {
        this.currentUser = input.value
        this.clientSocketModel.getOnlineUsers(this.currentUser)
        //*******
        this.onOnlineSettings.add((params) => {
          this.randomNumber = params.number
          this.categories = params.categories
        console.log(this.randomNumber,this.categories)
          startPage.serverCategories=this.categories
          startPage.serverRandom=this.randomNumber
        })
        //*******
        this.onGetUserList.add((params) => {
          this.users = params
          startPage.drawOnlineUsers(this.users)
          startPage.onStartOnlineGame = (user) => {
            this.clientSocketModel.startGame({
              users: `${this.currentUser}+V+${user}`,
              categories: this.getCategories()
            })

            //this.clientSocketModel.getOpenUsers()
            startPage.destroy()
            this.smallCycle()
          }
        })

      }
    }
    startPage.onChoosedSort = (sort) => {
      this.questions = sort
    }
    startPage.onStartClick = () => {
      startPage.destroy()
      this.smallCycle()
    }

  }

  setSettingsData(category: string[], _number: number): void {
    this.randomNumber = _number
    this.categories = category
  }

  smallCycle(array?: IAnswerObj[]) {
    if (this.choosedMode === 'single') {
      this.gameField = new GameField(this.node, {
        mode: this.choosedMode, by: this.questions,
        category: this.choosedCategory
      }, array)
      this.gameField.finishClick = (questionsArray: IAnswerObj[]) => {
        this.gameField.destroy()
        const resultScreen = new FinishScreen(this.node, questionsArray, this)
        resultScreen.startSmallCycle = (array: IAnswerObj[]) => {
          resultScreen.destroy()
          this.smallCycle(array)
        }
        resultScreen.toStartClick = () => {
          resultScreen.destroy()
          this.gameCycle()
        }

      }
    } else if (this.choosedMode === 'online') {
      //   this.gameField = new GameField(this.node, {
      //     mode: this.choosedMode, by: this.questions,
      //     category: this.choosedCategory
      //   }, array)
      //   this.gameField.finishClick = (questionsArray: IAnswerObj[]) => {
      //     this.gameField.destroy()
      //     const resultScreen = new FinishScreen(this.node, questionsArray, this)
      //     resultScreen.startSmallCycle = (array: IAnswerObj[]) => {
      //       resultScreen.destroy()
      //       this.smallCycle(array)
      //     }
      //     resultScreen.toStartClick = () => {
      //       resultScreen.destroy()
      //       this.gameCycle()
      //     }
      //
      //   }
    }
  }
  public getCategories() {
    const categoriesToServer: string[] = []
    categoriesList.forEach(cat => categoriesToServer.push(cat.russian))
    return categoriesToServer
    //  this.clientSocketModel.getCategories()
  }
  sendChoosedCategory(cat:string){
    this.clientSocketModel.chooseCategory(cat)
  }
}
