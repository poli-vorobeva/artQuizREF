export interface IWorkItem {
  author: string;
  name: string;
  year: string;
  imageNum: string;
}

export interface IAnswerObj {
  itemArray: IWorkItem[],
  correct: IWorkItem,
  clickedAnswer: IWorkItem
}

export interface IServerResponseMessage {
  type: string;
  content: string;
}

export interface IServerRequestMessage {
  type: string;
  content: string;
}

export interface IGameSettings {
  number: number,
  categories: string[]
}

export type IUsernameList = string[]

export interface IStartGame{
  users: string,
  categories:string[]
}
export interface IClientUser {
  name: string,
  status: string,
  room: string
}

export interface ICategory {
  russian: string;
  english: string;
  painters: string[]
}
export interface IStartGameData {
  usersInGame: string[],
  randomNumber: number,
  categories: string[],
  roomId:string,
  playerName: string,
  activePlayer: string
}
export interface IParams {
  mode: string,
  by: string,
  category: { russian: string, english: string, painters: string[] }
}

export interface IUser {
  name: string,
  status: string,
  room: string
}

export interface IRoomPlayer {
  playerName: string
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

}

export interface IChooseCategoryData {
  name: string,
  category: string
}
