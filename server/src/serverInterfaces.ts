import {connection} from "websocket";

export interface IServerResponseMessage {
  type: string;
  content: string;
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
export interface IStartGame{
  users: string,
  categories:string[]
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
    currentPlayer: number
  }
  category: string[]
}
