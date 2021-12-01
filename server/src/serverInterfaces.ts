import {connection} from "websocket";

export interface IServerResponseMessage {
  type: string;
  content: string;
}
export interface IStartGameData {
  usersInGame: string[],
  randomNumber: number,
  categories: string[],
  roomId:string,
  playerName: string,
  activePlayer: string
}
export interface IServerRequestMessage {
  type: string;
  content: string;
}

export interface IUser {
  name: string,
  status: string,
  room: string
}

export interface IConnection {
  name: string,
  connection: connection
}

export interface IRoomPlayer {
  playerName: string,
  categoriesAnswer: {
    [key: string]: number
  }
}

export interface IRoom {
  id: string,
  data: {
    players: [IRoomPlayer, IRoomPlayer],
    currentPlayer: number,
    oponentAnswer?:number
  }
  category: string[],
  currentQuestionData:{
    bothPlayersClick:number,
    actions:[{firstName:string,value:number,author:string},{secondName:string,value:number,author:string}]
  }

}
