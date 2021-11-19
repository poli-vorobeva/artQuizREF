import {IChooseCategoryData, IServerResponseMessage, IUser} from "./interface";
import {observer} from "./common/observer";
import {App, IGameSettings, IUsernameList} from "./app";
import {IStartGame} from "../server/src/serverInterfaces";
import Signal from "./common/singal";

export class ClientSocketModel {
  private websocket: WebSocket;
  private userConnectionName: string;
  private app: App;

  constructor(app: App,setSettingsData:(category:string[],_number:number)=>void,
              onOnlineSettings:Signal<IGameSettings>,
              onGetUserList:Signal<IUsernameList>,onStartGame:Signal<null>) {
    this.app = app
    this.websocket = new WebSocket('ws://localhost:3000/')
    this.websocket.onopen = () => {

    }
    this.websocket.onmessage = (message) => {
      const response: IServerResponseMessage = JSON.parse(message.data)
      if (response.type === 'message') {
      }
      if (response.type === 'getOpenUsers') {
        const responseP = JSON.parse(response.content).filter((e: string) => e !== this.userConnectionName)
        console.log('OPENUS', responseP)
        app.users = responseP
       // observer.dispatch('getUserList')
      }
      if (response.type === 'getPlayersUser') {
        console.log('PLAYERS', response.content)
      }
      if (response.type === 'getUserList' && response.content) {
        onGetUserList.emit(JSON.parse(response.content))
      }
      if (response.type === 'startGame') {
        console.log('Response',response.content, typeof response.content)
        const responseObj = JSON.parse(response.content)
       //setSettingsData(responseObj.category,responseObj.randomNumber)
        onOnlineSettings.emit({number:responseObj.randomNumber,categories:responseObj.categories})

        onStartGame.emit(null)
        // app.currentRoom=responseObj
      //  observer.dispatch('startGame')
      }
      // if (response.type === 'isActivePlayer') {
      //   const responseObj = JSON.parse(response.content)
      //   console.log("Respnse", responseObj)
      //   app.isActivePlayer = responseObj
      // }
    }
    this.websocket.onerror = () => {

    }
    //websocket.close()
  }

  getOnlineUsers(name: string) {
    this.userConnectionName = name
    console.log("socket",name)
    const request = {
      type: 'getUserList',
      content: name,
    }
    this.websocket.send(JSON.stringify(request))
  }

  chooseCategory(category:string) {
    const request = {
      type: 'chooseCategory',
      content: {category},
    }
    console.log("ChooseCat", request)
    this.websocket.send(JSON.stringify(request))

  }

  startGame(data: IStartGame) {
    const request = {
      type: 'startGame',
      content: JSON.stringify(data),
    }
    this.websocket.send(JSON.stringify(request))
  }

  getOpenUsers() {
    const requestOpen = {
      type: 'getOpenUsers',
      content: ''
    }
    this.websocket.send(JSON.stringify(requestOpen))
  }

  isActivePlayer(room: string) {
    console.log(room, 'Model')
    const request = {
      type: 'isActivePlayer',
      content: {room: room, name: this.userConnectionName},
    }
    this.websocket.send(JSON.stringify(request))
  }
}
