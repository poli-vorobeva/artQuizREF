import {
  IAnswerObj,
  IChooseCategoryData, IParams, IPlayerAnswer, IPlayersResponse, IServerBothAnswer, IServerQuestions,
  IServerResponseMessage,
  IStartGame,
  IStartGameData,
  IUsernameList, IWorkItem
} from "./interface";
import {App} from "./app";
import Signal from "./common/singal";


export class ClientSocketModel {
  public onGetUserList: Signal<IUsernameList> = new Signal();
  public oneChoosedCategory: Signal<string> = new Signal();
  public onGetServerNextQuestion: Signal<IWorkItem[]> = new Signal<IWorkItem[]>();
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
  public onNextQuestion: Signal<null> = new Signal<null>()
  public onBothAnswer: Signal<IServerBothAnswer> = new Signal<IServerBothAnswer>()
  public onPlayersFromServer: Signal<IPlayersResponse> = new Signal<IPlayersResponse>()
  private types: Record<string, (data: any) => void>

  constructor(setSettingsData: (category: string[], _number: number) => void
  ) {
    this.types = {
      getUserList: (data) => this.onGetUserList.emit(data),
      getOpenUsers: (data) => {
        const response = data.filter((e: string) => e !== this.userConnectionName)
        this.onGetOpenUsers.emit(response)
      },
      oneCategoryLeft: (data) => {
        this.oneChoosedCategory.emit(data)
        return
      },
      chooseCategory: (data) => {
        const _response = JSON.parse(data)
        this.activePlayer = _response.activePlayer
        this.redrawCategories.emit(_response.category)
      },
      startGame: (data) => {
        const responseObj: IStartGameData = JSON.parse(data)
        this.players = responseObj.usersInGame
        responseObj.playerName = this.userConnectionName
        this.activePlayer = responseObj.activePlayer
        this.onOnlineSettings.emit(responseObj);
        this.roomId = responseObj.roomId;
        this.onStartGame.emit(null)
      },
      playersFromServer: (data) => {
        const _response = JSON.parse(data)
        this.onPlayersFromServer.emit({
          player: this.userConnectionName,
          opponent: _response.players.filter((e: string) => e != this.userConnectionName)[0],
          question: JSON.parse(_response.question)
        })
      },
      onAnswer: (data) => {
        const _response = JSON.parse(data)
        const player = _response.players.filter((player: IPlayerAnswer) => player.name === this.userConnectionName)[0]
        const opponent = _response.players.filter((player: IAnswerObj) => player.name !== this.userConnectionName)[0]
        this.onBothAnswer.emit({player, opponent, question: _response.question, correct: _response.correct})
      },
      onGetNextQuestion: (data) => {
        const _response = JSON.parse(data)
        this.onGetServerNextQuestion.emit(JSON.parse(_response))
      },
      onFinishRound: (data) => {
        console.log(JSON.parse(data))
      }
    }
    this.websocket = new WebSocket('ws://localhost:3000/');
    this.websocket.onopen = () => {

    }
    this.websocket.onmessage = (message) => {
      const response: IServerResponseMessage = JSON.parse(message.data)
      this.types[response.type](JSON.parse(response.content))
      if (response.type === 'message') {
      }
      // if (response.type === 'getOpenUsers') {
      //   const responseP = JSON.parse(response.content).filter((e: string) => e !== this.userConnectionName)
      //   this.onGetOpenUsers.emit(responseP)
      // }
      // if (response.type === 'getUserList' && response.content) {
      //    this.onGetUserList.emit(JSON.parse(response.content))
      // }
      // if (response.type === 'oneCategoryLeft') {
      //   this.oneChoosedCategory.emit(response.content)
      //   return
      // }
      // if (response.type === 'chooseCategory') {
      //   const _response = JSON.parse(response.content)
      //   this.activePlayer = _response.activePlayer
      //   this.redrawCategories.emit(_response.category)
      // }
      // if (response.type === 'startGame') {
      //   const responseObj: IStartGameData = JSON.parse(response.content)
      //   this.players = responseObj.usersInGame
      //   responseObj.playerName = this.userConnectionName
      //   this.activePlayer = responseObj.activePlayer
      //   this.onOnlineSettings.emit(responseObj);
      //   this.roomId = responseObj.roomId;
      //   this.onStartGame.emit(null)
      //
      // }
      // if (response.type === 'playersFromServer') {
      //   const _response = JSON.parse(response.content)
      //   this.onPlayersFromServer.emit({
      //     player: this.userConnectionName,
      //     opponent: _response.players.filter((e: string) => e != this.userConnectionName)[0],
      //     question: JSON.parse(_response.question)
      //   })
      // }
      // if (response.type === 'onAnswer') {
      //   const _response = JSON.parse(response.content)
      //   const player = _response.players.filter((player: IPlayerAnswer) => player.name === this.userConnectionName)[0]
      //   const opponent = _response.players.filter((player: IAnswerObj) => player.name !== this.userConnectionName)[0]
      //  this.onBothAnswer.emit({player, opponent, question: _response.question, correct: _response.correct})
      //
      // }
      // if (response.type === 'onGetNextQuestion') {
      //   const _response = JSON.parse(response.content)
      //   this.onGetServerNextQuestion.emit(JSON.parse(_response))
      // }
      // if (response.type === 'onFinishRound') {
      //   console.log(JSON.parse(response.content))
      // }
    }
    this.websocket.onerror = () => {

    }
    //websocket.close()
  }

  getOnlineUsers(name: string) {
    this.userConnectionName = name
    this.sendRequest('getUserList', name)
  }

  chooseCategory(category: string) {
    if (this.activePlayer !== this.userConnectionName) return
    else {
      this.sendRequest('chooseCategory', {category, roomId: this.roomId})
    }
  }

  // startGame(data: IStartGame) {
  //   this.sendRequest('startGame',data)
  //   }

  sendGameParams(params: IParams) {
    this.sendRequest("sendGameParams", {...params, roomId: this.roomId, playerName: this.userConnectionName})
  }

  // getOpenUsers() {
  //   this.sendRequest('getOpenUsers',{})
  // }

  onAnswer(author: string) {
    this.sendRequest('onAnswer', {
      name: this.userConnectionName,
      roomId: this.roomId,
      author
    })
  }

  getPlayersName() {
    return {
      player: this.userConnectionName,
      opponent: this.players.filter(e => e !== this.userConnectionName)[0],
      activePlayer: this.activePlayer
    }
  }

  nextQuestionFromServer() {
    this.sendRequest('onGetNextQuestion', {
      roomId: this.roomId,
    })
  }

  sendRequest(type: string, data: string | Record<string, string | { [key: string]: string | string[] }> | IStartGame) {
    const requestMessage = {
      type: type,
      content: JSON.stringify(data)
    }
    this.websocket.send(JSON.stringify(requestMessage))
  }


}


// public getQuestion(){
//      const requestMessage = {
//          type: 'getQuestion',
//          content: this.roomId
//      }
//      this.websocket.send(JSON.stringify(requestMessage))
//  }

// if (response.type === 'questionFromServer') {
//   console.log("getModel")
//   this.onGetQuestion.emit(JSON.parse(response.content))
// }
// if (response.type === 'questionParamsResponse') {
//      const _response: IWorkItem[][] = JSON.parse(response.content)
//      this.onGetServerQuestions.emit({
//          questions: _response,
//          players: {
//              player: this.userConnectionName,
//              opponent: this.players.filter(pl => pl !== this.userConnectionName)[0]
//          }
//      })
//
//  }
// this.onGetServerQuestions.emit({
//     questions: _response,
//     players: {
//         player: this.userConnectionName,
//         opponent: this.players.filter(pl => pl !== this.userConnectionName)[0]
//     }
// })
// if (response.type === 'getPlayersUser') {
//     console.log('PLAYERS', response.content)
// }