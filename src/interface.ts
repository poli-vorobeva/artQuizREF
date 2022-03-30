export interface IWorkItem {
  author: string;
  name: string;
  year: string;
  imageNum: string;
  imageElement?:HTMLImageElement
}

export interface IAnswerObj
{
  name:string,
  isCorrect:boolean,
  author:string}


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
export interface IPlayersResponse {
  player: string,
  opponent: string,
  question: IWorkItem[]
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
export interface IPlayerAnswer {
  name: string,
  isCorrect:boolean,
  author: string
}
export interface IServerBothAnswer {
  player: IPlayerAnswer,
  opponent: IPlayerAnswer,
  question: IWorkItem[],
  correct:string
}

export interface IServerQuestions {
  questions: IWorkItem[][],
  players: {
    player: string, opponent: string
  }
}

export interface IChooseCategoryData {
  name: string,
  category: string
}
