import {IUtf8Message, request} from "websocket";
import {Server} from "http";
import {
  IConnection,
  IRoom,
  IRoomPlayer,
  IServerRequestMessage,
  IServerResponseMessage, IStartGameData,
  IUser
} from "./serverInterfaces";
import {QuestionsGenerator} from "./ServerQuestionsGenerotor";

const websocket = require('websocket')

export class ServerSocket {
  public clients: Array<IUser> = []
  public roomsId: Array<IRoom> = []
  public isNextQuestion = 0
  public connections: Array<IConnection> = []
  // public currentRoomId = ''
  userName: string
  public bothPlayersResponse = 0

  constructor(server: Server) {
    const wsServer = new websocket.server({
      httpServer: server,
    });

    wsServer.on('request', (request: request) => {
        const connection = request.accept(undefined, request.origin);
        connection.on('message', (_message) => {
          if (_message.type === 'utf8') {
            const message = _message as IUtf8Message
            const requestMessage: IServerRequestMessage = JSON.parse(
              message.utf8Data
            );
            if (requestMessage.type === 'message') {
              const responseStatus: IServerResponseMessage = {
                type: 'message-status',
                content: 'ok'
              }
              const responseMessage: IServerResponseMessage = {
                type: 'message',
                content: message.utf8Data
              }
              connection.sendUTF(JSON.stringify(responseStatus))
              this.connections.forEach(connect => {
                connect.connection.sendUTF(message.utf8Data)
              })
            }
            if (requestMessage.type === 'getUserList') {
              this.userName = JSON.parse(requestMessage.content)
              this.connections.push({name: this.userName, connection})
              this.clients.push({name: this.userName, status: 'wait', room: null})
               const otherUsers = this.usersWithoutCurrentUser(this.clients, this.userName)
              const responseMessage: IServerResponseMessage = {
                type: 'getUserList',
                content: JSON.stringify(otherUsers)
              }
              connection.sendUTF(JSON.stringify(responseMessage))

              this.connections.forEach(client => {
                const responseMessage: IServerResponseMessage = {
                  type: 'getUserList',
                  content: JSON.stringify(this.usersWithoutCurrentUser(this.clients, client.name))
                }
                client.connection.sendUTF(JSON.stringify(responseMessage))
              })
            }
            if (requestMessage.type === 'getOpenUsers') {
              //получаем все юзеров у которых статус игру не равен Гейм
              //всем им отправляем обновление
              const openPlayers = this.clients.map(client => {
                if (client.status != 'game') {
                  return client
                }
              })
              this.connections.forEach(connect => {
                const responseMessage: IServerResponseMessage = {
                  type: 'getOpenUsers',
                  content: JSON.stringify(this.usersWithoutCurrentUser(openPlayers, connect.name))
                }
                connect.connection.sendUTF(JSON.stringify(responseMessage))
              })
            }
            if (requestMessage.type === 'startGame') {
              const content = JSON.parse(requestMessage.content)
              const playersArray: Array<string> = content.users.split('+V+')
              const playerOne: IRoomPlayer = {playerName: playersArray[0], categoriesAnswer: {}}
              const playerTwo: IRoomPlayer = {playerName: playersArray[1], categoriesAnswer: {}}
              const roomId = (+new Date()).toString()
              const roomElement: IRoom = {
                id: roomId,
                data: {
                  players: [playerOne, playerTwo],
                  currentPlayer: 0
                },
                category: content.categories,
                currentQuestionData: {
                  bothPlayersClick: 0,
                  questionNumber: 0,
                  actions: [
                    {name: '', isCorrect: false, author: ''},
                    {name: '', isCorrect: false, author: ''}
                  ],
                  questions: []
                }
              }
              this.roomsId.push(roomElement)

              this.clients.forEach(client => {
                if (client.name === playersArray[0] || client.name === playersArray[1]) {
                  client.status = 'game'
                  client.room = roomId
                }
              })
              const openUsers = this.clients.map(client => {
                if (client.status !== 'game') {
                  return client.name
                }
              }).filter(client => client)
              openUsers.forEach(user => {
                const openConnection = this.connections.find(con => con.name === user)
                const responseMessage: IServerResponseMessage = {
                  type: 'getOpenUsers',
                  content: JSON.stringify(openUsers)
                }
                openConnection.connection.sendUTF(JSON.stringify(responseMessage))
              })

              const usersInGame = this.clients.map(client => {
                if (client.status === 'game' && client.room === roomId) {
                  return client.name
                }
              }).filter(cl => cl)
              const randomNumber = Math.floor(Math.random() * 10 + 1)
              const roomCategories = this.roomsId.find(room => room.id === roomId).category
              usersInGame.forEach(user => {
                if (!user) return
                const connectionInGame = this.connections.find(con => con.name === user)
                const startData: IStartGameData = {
                  usersInGame, randomNumber,
                  categories: roomCategories,
                  playerName: this.userName,
                  roomId: roomElement.id,
                  activePlayer: roomElement.data.players[roomElement.data.currentPlayer].playerName
                }
                const responseMessage: IServerResponseMessage = {
                  type: 'startGame',
                  content: JSON.stringify(startData)
                }
                connectionInGame.connection.sendUTF(JSON.stringify(responseMessage))
              })
            }
            if (requestMessage.type === 'chooseCategory') {
              const content = JSON.parse(requestMessage.content)
              const room = this.currentRoom(content.roomId)
             // const room = this.roomsId.filter(room => room.id === content.roomId)
              room.category = room.category.filter(categ => categ !== content.category)
              if (room.category.length === 1) {
                console.log("CAT",content.category)

                const responseMessage: IServerResponseMessage = {
                  type: 'oneCategoryLeft',
                  content: room.category[0]
                }
                this.sendResponseToRoomPlayers(room.id, responseMessage)
                // this.connections.forEach(connection => {
                //   if (connection.name === room[0].data.players[0].playerName
                //       || connection.name === room[0].data.players[1].playerName) {
                //     connection.connection.sendUTF(JSON.stringify(responseMessage))
                //   }
                // })
                return
              }
              if (room.data.currentPlayer === 0) {
                room.data.currentPlayer = 1
              }
              else {
                room.data.currentPlayer = 0
              }
              const responseMessage: IServerResponseMessage = {
                type: 'chooseCategory',
                content: JSON.stringify({
                  category: content.category,
                  activePlayer: room.data.players[room.data.currentPlayer].playerName
                })
              }
              this.sendResponseToRoomPlayers(room.id, responseMessage)
              // this.connections.forEach(connection => {
              //   if (connection.name === room[0].data.players[0].playerName
              //       || connection.name === room[0].data.players[1].playerName) {
              //     connection.connection.sendUTF(JSON.stringify(responseMessage))
              //   }
              // })
            }
            if (requestMessage.type === 'sendGameParams') {
               const content = JSON.parse(requestMessage.content)
              const room = this.currentRoom(content.roomId)
             // const currentRoom = this.roomsId.filter(room => room.id == content.roomId)

             room.currentQuestionData.questions = new QuestionsGenerator(content).questionsArray

              const question = this.getQuestion(content.roomId)
              const responseMessage = {
                type: 'playersFromServer',
                content: JSON.stringify({
                  players: room.data.players.map(player => player.playerName),
                  question: JSON.stringify(question)
                })
              }
              this.sendResponseToRoomPlayer(content.playerName, room.id, responseMessage)
             // this.sendResponseToRoomPlayer(content.playerName, content.roomId, responseMessage)
           }
            if (requestMessage.type === 'onAnswer') {

              // отпраляются запросы по два-и после одного меняется по одному игроку клик
              const content = JSON.parse(requestMessage.content)
              const room= this.currentRoom(content.roomId)
             // const room = this.roomsId.filter(room => room.id === content.roomId)[0]
              room.currentQuestionData.bothPlayersClick = room.currentQuestionData.bothPlayersClick + 1
             room.data.players.forEach(player => {
                const isCorrectAnswer = room.currentQuestionData.questions[room.currentQuestionData.questionNumber].correct.author === content.author
                if (player.playerName === content.name) {
                  if (!player.categoriesAnswer[room.category[0]]) {
                    player.categoriesAnswer[room.category[0]] = +isCorrectAnswer

                  }
                  else {
                    player.categoriesAnswer[room.category[0]] =
                      player.categoriesAnswer[room.category[0]] + +isCorrectAnswer
                  }
                }
                //проверка на правильность ответа
                if (room.currentQuestionData.bothPlayersClick == 1) {
                  this.writeAnswerData(room, content.name, isCorrectAnswer, content.author)
                  return
                }
                if (room.currentQuestionData.bothPlayersClick == 2) {
                  this.writeAnswerData(room, content.name, isCorrectAnswer, content.author)
                  room.currentQuestionData.bothPlayersClick = 0
                  const responseContent: IServerResponseMessage = {
                    type: 'onAnswer',
                    content: JSON.stringify({
                      players: room.currentQuestionData.actions,
                      correct: room.currentQuestionData.questions[room.currentQuestionData.questionNumber].correct.author
                    })
                  }
                  this.sendResponseToRoomPlayers(content.roomId, responseContent)
                  this.cleanAnswerData(room)
                }
              })
            }
            if (requestMessage.type === 'onGetNextQuestion') {

              const content = JSON.parse(requestMessage.content)
              this.roomsId.forEach(room => {
                if (room.id === content.roomId) {
                  room.currentQuestionData.questionNumber += 1
                  if (room.currentQuestionData.questionNumber == room.currentQuestionData.questions.length) {
                    const playersRoundResults = room.data.players.map(player => {
                      player.categoriesAnswer[room.category[0]]
                    })
                    const responseContent = {
                      type: 'onFinishRound',
                      content: JSON.stringify(JSON.stringify(playersRoundResults))
                    }
                    this.sendResponseToRoomPlayers(content.roomId, responseContent)
                  }
                  else {
                    room.data.players.forEach(player => {
                      const question = this.getQuestion(content.roomId)

                      const responseContent = {
                        type: 'onGetNextQuestion',
                        content: JSON.stringify(JSON.stringify(question))
                      }
                      this.sendResponseToRoomPlayers(content.roomId, responseContent)
                    })
                  }
                }
              })
            }
          }
          else {
            throw new Error('Not UTF8')
          }
        })
        connection.on('close', (reasonCode, description) => {
          // this.connections = this.connections.filter(client => client.connection !== connection)
          console.log("Disconnect")
        })
      }
    )
  }
currentRoom(roomId:string){
  return this.roomsId.filter(room => room.id === roomId)[0]
}
  writeAnswerData(room: IRoom, name: string, correct: boolean, author: string) {
    console.log("NAMEWRITE",name,author)
    if(!room.currentQuestionData.actions[0].name){
      room.currentQuestionData.actions[0].name = name
      room.currentQuestionData.actions[0].isCorrect = correct
      room.currentQuestionData.actions[0].author = author
    }else{
      room.currentQuestionData.actions[1].name = name
      room.currentQuestionData.actions[1].isCorrect = correct
      room.currentQuestionData.actions[1].author = author
    }

  }
  cleanAnswerData(room){
    room.currentQuestionData.actions.forEach(act=>{
      act.name=''
      act.isCorrect=false
      act.author=''
    })
  }
  usersWithoutCurrentUser(array: Array<IUser>, excludedUser: string) {
   // console.log(array,'&&&')
    const modifyedArray = array.map((user) => {
      if (!user) return
      if (user.name != excludedUser) {
        return user.name
      }
      else {
        return
      }
    })
    return modifyedArray
  }

  getQuestion(_room: string) {
    const currentRoom = this.roomsId.filter(room => room.id == _room)
    const questionElement = currentRoom[0].currentQuestionData.questions[currentRoom[0].currentQuestionData.questionNumber]
    return [questionElement.correct, ...questionElement.variants]
  }

  sendResponseToRoomPlayer(name: string, _room: string, responseMessage: IServerResponseMessage) {
    this.connections.forEach(connection => {
      if (connection.name === name || connection.name === name) {
        connection.connection.sendUTF(JSON.stringify(responseMessage))
      }
    })
  }

  sendResponseToRoomPlayers(_room: string, response: IServerResponseMessage) {
    const room = this.roomsId.find(room => room.id == _room)
    this.connections.forEach(connection => {
      if (connection.name === room.data.players[0].playerName
          || connection.name === room.data.players[1].playerName) {
        connection.connection.sendUTF(JSON.stringify(response))
      }
    })
  }

}

