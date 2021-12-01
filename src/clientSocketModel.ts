import {
  IChooseCategoryData, IParams,
  IServerResponseMessage,
  IStartGame,
  IStartGameData,
  IUsernameList, IWorkItem
} from "./interface";
import {App} from "./app";
import Signal from "./common/singal";

export interface IServerBothAnswer {
  "player": {
    "name": string,
    "value": number,
    "answerAuthor": string
  },
  "opponent": {
    "name": string,
    "answerAuthor": string,
    "value": number
  }
}

export interface IServerQuestions {
  questions: IWorkItem[][],
  players: {
    player: string, opponent: string
  }
}

export class ClientSocketModel {
  public onGetUserList: Signal<IUsernameList> = new Signal();
  public oneChoosedCategory: Signal<string> = new Signal();
  public redrawCategories: Signal<string> = new Signal<string>();
  public onOnlineSettings: Signal<IStartGameData> = new Signal<IStartGameData>();
  public onStartGame: Signal<null> = new Signal<null>();
  public onGetServerQuestions: Signal<IServerQuestions> = new Signal<IServerQuestions>();
  private websocket: WebSocket;
  private userConnectionName: string;
  private app: App;
  private activePlayer: string;
  private players: string[];
  private roomId: string
  public onGetOpenUsers: Signal<string[]> = new Signal<string[]>()
  private questionIndex: number
  public onNextQuestion: Signal<null> = new Signal<null>()
  public onBothAnswer: Signal<IServerBothAnswer> = new Signal<IServerBothAnswer>()

  constructor(setSettingsData: (category: string[], _number: number) => void
  ) {

    this.websocket = new WebSocket('ws://localhost:3000/');
    this.websocket.onopen = () => {

    }
    this.websocket.onmessage = (message) => {
      const response: IServerResponseMessage = JSON.parse(message.data)
      if (response.type === 'message') {
      }
      if (response.type === 'getOpenUsers') {
        const responseP = JSON.parse(response.content).filter((e: string) => e !== this.userConnectionName)
        this.onGetOpenUsers.emit(responseP)
        // app.users = responseP
        //   this.onGetOpenUsers(res)
      }
      // if (response.type === 'getPlayersUser') {
      //     console.log('PLAYERS', response.content)
      // }
      if (response.type === 'getUserList' && response.content) {
        this.onGetUserList.emit(JSON.parse(response.content))
      }
      if (response.type === 'oneCategoryLeft') {
        this.oneChoosedCategory.emit(response.content)
        return
      }
      if (response.type === 'chooseCategory') {

        const _response = JSON.parse(response.content)


        this.activePlayer = _response.activePlayer
        this.redrawCategories.emit(_response.category)
      }
      if (response.type === 'startGame') {
        const responseObj: IStartGameData = JSON.parse(response.content)
        this.players = responseObj.usersInGame
        responseObj.playerName = this.userConnectionName
        this.activePlayer = responseObj.activePlayer
        this.onOnlineSettings.emit(responseObj);
        this.roomId = responseObj.roomId;
        this.onStartGame.emit(null)

      }
      if (response.type === 'questionParamsResponse') {
        const _response: IWorkItem[][] = JSON.parse(response.content)
        this.onGetServerQuestions.emit({
          questions: _response,
          players: {
            player: this.userConnectionName,
            opponent: this.players.filter(pl => pl !== this.userConnectionName)[0]
          }
        })

      }
      if (response.type === 'onAnswer') {
       const _response = JSON.parse(response.content)
          const correctResponse: IServerBothAnswer=null
          if(_response.player.name===this.userConnectionName){
              this.onBothAnswer.emit(_response)
          }else{
              this.onBothAnswer.emit({
                  "player": _response.opponent,
                  "opponent":_response.player})
          }

        //---- this.onNextQuestion.emit(null)
      }
    }
    this.websocket.onerror = () => {

    }
    //websocket.close()
  }

  getOnlineUsers(name: string) {
    this.userConnectionName = name
    const request = {
      type: 'getUserList',
      content: name,
    }
    this.websocket.send(JSON.stringify(request))
  }

  chooseCategory(category: string) {
    if (this.activePlayer !== this.userConnectionName) {
      console.log('you are not active player')
      return
    } else {
      const request = {
        type: 'chooseCategory',
        content: JSON.stringify({category, roomId: this.roomId}),
      }
      this.websocket.send(JSON.stringify(request))
    }
  }

  startGame(data: IStartGame) {
    const request = {
      type: 'startGame',
      content: JSON.stringify(data),
    }
    this.websocket.send(JSON.stringify(request))
  }

  sendGameParams(params: IParams) {
    const requestOpen = {
      type: 'sendGameParams',
      content: JSON.stringify({...params, roomId: this.roomId})
    }
    this.websocket.send(JSON.stringify(requestOpen))
  }

  getOpenUsers() {
    const requestOpen = {
      type: 'getOpenUsers',
      content: ''
    }
    this.websocket.send(JSON.stringify(requestOpen))
  }

  getPlayersName() {
    return {
      player: this.userConnectionName,
      opponent: this.players.filter(e => e !== this.userConnectionName)[0],
      activePlayer: this.activePlayer
    }
  }

  onAnswer(answer: boolean, index: number, author: string) {
    if (this.questionIndex === index) {
      return
    }
    this.questionIndex = index
    const requestMessage = {
      type: 'onAnswer',
      content: JSON.stringify({
        answer,
        name: this.userConnectionName,
        roomId: this.roomId,
        author
      })
    }
    this.websocket.send(JSON.stringify(requestMessage))
  }
}
