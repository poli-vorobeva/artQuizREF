import Control from "./common/controll";
import {StartPage} from "./startPage/StartPage";
import {GameField} from "./gameField/GameField";
import {FinishScreen} from "./finishScreen/FinishScreen";
import {IAnswerObj, ICategory, IRoom, IStartGameData, IWorkItem} from "./interface";
import {ClientSocketModel} from "./clientSocketModel";
import {categoriesList} from "./images";
import Signal from "./common/singal";
import {OnlineGameField} from "./gameField/OnlineGameGield";
import {Header} from "./header/Header";
export interface IQuestions{
  correct:IWorkItem
  variants:IWorkItem[]
}
export interface ISmallCycle {
  player?: string,
  opponent?: string,
  prevCycleAnswersArray?: IAnswerObj[],
}

export class App extends Control {
  public categorySignal: Signal<string> = new Signal()
  public choosedMode: string;
  public questions: null | string;
  public choosedCategory: null | ICategory;
  public gameField: GameField;
  public users: string[];
  public addPlayer: string;
  public currentRoom: IRoom;
  public isActivePlayer: boolean;
  public randomNumber: number;
  public categories: string[];
  private currentUser: string;
  private clientSocketModel: ClientSocketModel;
  private startPage: StartPage;
  private serverQuestions: IQuestions[]
  private header: Header;
  private parentNode: HTMLElement;
  private finishScreen: FinishScreen;

  constructor(parentNode: HTMLElement) {
    super(parentNode);
    this.parentNode= parentNode;
    this.users = []
    this.randomNumber = 0
    this.addPlayer = ''
    this.currentUser = ''
    this.isActivePlayer = false
    this.categories = []
    this.currentRoom = null
    this.clientSocketModel = new ClientSocketModel(this.setSettingsData)

    this.categorySignal.add((category) => {
      this.clientSocketModel.chooseCategory(category)
    })
    this.clientSocketModel.onGetOpenUsers.add((users) => {
      this.users = users
    })

    this.questions = null
    this.choosedCategory = null
    this.header=new Header(this.node)
    this.gameCycle()
    this.header.onHomeButton.add((params=>{
      this.startPage && this.startPage.destroy()
      this.gameField && this.gameField.destroy()
      this.gameCycle()
    }))
  }

  getChoosedMode() {
    return this.choosedMode
  }

  gameCycle() {
    this.startPage = new StartPage(this.node, this.getChoosedMode)
    this.clientSocketModel.onGetUserList.add((params) => {
      this.users = params
      this.startPage.drawOnlineUsers(this.users)
      this.startPage.onStartOnlineGame = (user) => {
        this.clientSocketModel.startGame({
          users: `${this.currentUser}+V+${user}`,
          categories: this.getCategories()
        })
        //this.startPage.userUl.destroy()
        this.startPage.destroy()
      }
    })
    this.clientSocketModel.redrawCategories.add((params) => {
      this.startPage.redrawCategories(params)
    })
    this.clientSocketModel.oneChoosedCategory.add((category) => {
      const leftCategory = categoriesList.find(el => el.russian === category)
      this.choosedCategory = leftCategory
      this.startPage.onlineSettingsDestroy()
      this.clientSocketModel.sendGameParams(this.getQuestionsParams());
      // this.smallCycle()
    })
    this.clientSocketModel.onStartGame.add((params) => {
      this.startPage.userUl.destroy()
      this.startPage.onlineSettingsInit()
    })
    this.clientSocketModel.onGetServerQuestions.add((params) => {
      this.serverQuestions = params.questions

      this.smallCycle({
        player: params.players.player,
        opponent: params.players.opponent
      })
    })
    this.clientSocketModel.onNextQuestion.add((params) => {
      //прокидывать наверх окончание вопроса. и только потом
      this.gameField.onlineDrawNextQuestion()
    })
    this.clientSocketModel.onBothAnswer.add((params) => {
      this.gameField.onBothAnswer(params)
    })
    this.startPage.onChoosedMode = (mode) => {
      this.choosedMode = mode
    }
    this.startPage.onShowOnlineUsers = (input) => {
      if (input.value) {
        this.currentUser = input.value
        this.clientSocketModel.getOnlineUsers(this.currentUser)
        this.clientSocketModel.onOnlineSettings.add((params) => {
          this.randomNumber = params.randomNumber,
            this.categories = params.categories
          this.startPage.serverCategories = this.categories
          this.startPage.serverRandom = this.randomNumber
        })
      }
    }
    this.startPage.onExcludedCategory = (category: string) => {
      this.clientSocketModel.chooseCategory(category)
    }
    this.startPage.onStartClick = () => {
      this.startPage.destroy()
      this.smallCycle({})
    }
    this.startPage.onSort = (sort: string) => {
      console.log("SingleSort",sort)
      this.startPage.gameMode.destroy()
      this.questions = sort
    }
    this.startPage.onChoosedCategory = (cat) => {
      this.choosedCategory = cat
      this.smallCycle()
    }
  }

  setSettingsData(category: string[], _number: number): void {
    this.randomNumber = _number
    this.categories = category
  }

  smallCycle(params?: ISmallCycle) {

    if (this.choosedMode === 'single') {
      this.startPage.destroy()
      params ? this.smallCycleContent('single', params.prevCycleAnswersArray)
        : this.smallCycleContent('single')
    }
    else if (this.choosedMode === 'online') {
      const onlineGameField = new OnlineGameField(this.node, params.player, params.opponent)//ответ имя игрока и оппонента
      this.smallCycleContent('online')
    }
  }

  public getServerQuestions() {
    //console.log('get',this.serverQuestions)
    return this.serverQuestions
  }

  public getCategories() {
    const categoriesToServer: string[] = []
    categoriesList.forEach(cat => categoriesToServer.push(cat.russian))
    return categoriesToServer
    //  this.clientSocketModel.getCategories()
  }

  private smallCycleContent(gameMode: string, array?: IAnswerObj[]) {
    this.gameField = new GameField(
      this.node, this.getQuestionsParams(), this.serverQuestions, array)
    this.gameField.node.classList.add('gameField')
    this.gameField.onAnswer = (answer, index, author) => {
      this.clientSocketModel.answer(answer, index, author)
    }
    this.gameField.finishClick = (value) => {
      this.gameField.destroy()
      this.finishScreen= new FinishScreen(this.node)
      this.gameCycle()
      //TODO сделать кнопку домой
      //следать кнопку- выйти из комнаты- лобби с онлайн игрокамии
    }
  }

  getQuestionsParams() {
    return {
      mode: this.choosedMode,
      by: this.questions,
      category: this.choosedCategory
    }
  }
}
