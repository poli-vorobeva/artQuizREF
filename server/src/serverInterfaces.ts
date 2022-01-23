import {connection} from "websocket";
import {IQuestions} from "./ServerQuestionsGenerotor";
import {IPlayerAnswer} from "../../src/interface";

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
export interface IAnswerObj
{
  name:string,
  isCorrect:boolean,
  author:string}

export interface IRoom {
  id: string,
  data: {
    players: [IRoomPlayer, IRoomPlayer],
    currentPlayer: number,
    oponentAnswer?:number
  }
  category: string[],
  currentQuestionData:{
    questionNumber:0,
    bothPlayersClick:number,
    actions:IPlayerAnswer[]
    questions:IQuestions[]
  }

}
