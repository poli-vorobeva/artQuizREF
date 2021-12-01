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
  public isNextQuestion=0
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
            console.log(requestMessage.type, '###')
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
              console.log("**")
              this.userName = requestMessage.content
              this.connections.push({name: requestMessage.content, connection})
              this.clients.push({name: requestMessage.content, status: 'wait', room: null})
              const otherUsers = this.userWithoutAction(this.clients, requestMessage.content)
              const responseMessage: IServerResponseMessage = {
                type: 'getUserList',
                content: JSON.stringify(otherUsers)
              }
              connection.sendUTF(JSON.stringify(responseMessage))

              this.connections.forEach(client => {
                const responseMessage: IServerResponseMessage = {
                  type: 'getUserList',
                  content: JSON.stringify(this.userWithoutAction(this.clients, client.name))
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
                  content: JSON.stringify(this.userWithoutAction(openPlayers, connect.name))
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
                  actions: [
                    {firstName: playerOne.playerName, value: 0,author:''},
                    {secondName: playerTwo.playerName, value: 0,author:''}
                  ]
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
                  //content: JSON.stringify(roomElement)
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
              const room = this.roomsId.filter(room => room.id === content.roomId)
              room[0].category = room[0].category.filter(categ => categ !== content.category)
              console.log('!___', room[0].category)
              if (room[0].category.length === 1) {
                //oneCategoryLeft
                const responseMessage: IServerResponseMessage = {
                  type: 'oneCategoryLeft',
                  content: room[0].category[0]
                }
                this.connections.forEach(connection => {
                  if (connection.name === room[0].data.players[0].playerName
                    || connection.name === room[0].data.players[1].playerName) {
                   connection.connection.sendUTF(JSON.stringify(responseMessage))
                  }
                })
                return
              }
              if (room[0].data.currentPlayer === 0) {
                room[0].data.currentPlayer = 1
              } else {
                room[0].data.currentPlayer = 0
              }
              const responseMessage: IServerResponseMessage = {
                type: 'chooseCategory',
                content: JSON.stringify({
                  category: content.category,
                  activePlayer: room[0].data.players[room[0].data.currentPlayer].playerName
                })
              }
              this.connections.forEach(connection => {
                if (connection.name === room[0].data.players[0].playerName
                  || connection.name === room[0].data.players[1].playerName) {
                  connection.connection.sendUTF(JSON.stringify(responseMessage))
                }
              })

              //если приходит просто массив, то добавь его в комнату категории.
              //если есть клик по элементу то и элемент удалаем из списка элементов- меняем текущего игрока и ..

            }
            if (requestMessage.type === 'sendGameParams') {
              this.bothPlayersResponse += 1
               const content = JSON.parse(requestMessage.content)

              ///
              if (this.bothPlayersResponse === 2) {
                const questionsGenerator = new QuestionsGenerator(content)

                const responseMessage = {
                  type: 'questionParamsResponse',
                  content: JSON.stringify(questionsGenerator.questionsArray)///////////
                }
                this.connections.forEach(connection => {
                  const room = this.roomsId.find(room => room.id === content.roomId)
                  if (connection.name === room.data.players[0].playerName
                    || connection.name === room.data.players[1].playerName) {
                    connection.connection.sendUTF(JSON.stringify(responseMessage))
                  }
                })
                this.bothPlayersResponse = 0
              }

            }
            if (requestMessage.type === 'onAnswer') {

              const content = JSON.parse(requestMessage.content)
                console.log('SERVERANSWER',content)
              this.roomsId.forEach(room => {
                if (room.id === content.roomId) {
                    room.currentQuestionData.bothPlayersClick = room.currentQuestionData.bothPlayersClick+1
                  room.data.players.forEach(player => {
                    if (player.playerName === content.name) {
                      if (!player.categoriesAnswer[room.category[0]]) {
                        player.categoriesAnswer[room.category[0]] = +content.answer

                      } else {
                        player.categoriesAnswer[room.category[0]] =
                          player.categoriesAnswer[room.category[0]] + +content.answer
                      }
                    }
                    if (room.currentQuestionData.bothPlayersClick==1) {
                      room.currentQuestionData.actions[0].firstName = content.name
                      room.currentQuestionData.actions[0].value = content.answer
                      room.currentQuestionData.actions[0].author=content.author
                        return
                    }
                    if(room.currentQuestionData.bothPlayersClick==2){
                      room.currentQuestionData.actions[1].secondName = content.name
                      room.currentQuestionData.actions[1].value = content.answer
                      room.currentQuestionData.actions[1].author=content.author
                      //serd response
                      let playerName
                      let oponentName
                      let playerValue
                      let opponentValue
                      let oponentAnswer
                      let playerAnswer
                      if (room.currentQuestionData.actions[0].firstName === content.name) {
                        playerName = room.currentQuestionData.actions[0].firstName
                        playerValue = room.currentQuestionData.actions[0].value
                        playerAnswer=room.currentQuestionData.actions[0].author
                        oponentName = room.currentQuestionData.actions[1].secondName
                        opponentValue = room.currentQuestionData.actions[1].value
                        oponentAnswer=room.currentQuestionData.actions[1].author
                      } else {
                        playerName = room.currentQuestionData.actions[1].secondName
                        playerValue = room.currentQuestionData.actions[1].value
                        playerAnswer=room.currentQuestionData.actions[1].author
                        oponentName = room.currentQuestionData.actions[0].firstName
                        opponentValue = room.currentQuestionData.actions[0].value
                        oponentAnswer = room.currentQuestionData.actions[0].author
                      }

                      const responseContent = {
                        type: 'onAnswer',
                        content: JSON.stringify({
                          player: {name: playerName,value: +playerValue,answerAuthor:playerAnswer},
                          opponent: {name: oponentName, answerAuthor: oponentAnswer, value: +opponentValue}
                        })
                      }
                      console.log('answerResponse',responseContent)
                      //const responseMessage = JSON.stringify(responseContent)
                      this.connections.forEach(connection => {

                        const room = this.roomsId.find(room => room.id === content.roomId)
                       if (connection.name === room.data.players[0].playerName
                          || connection.name === room.data.players[1].playerName) {
                          connection.connection.sendUTF(JSON.stringify(responseContent))
                        }
                      })
                      room.currentQuestionData.bothPlayersClick = 0
                      room.currentQuestionData.actions[1].secondName = ''
                      room.currentQuestionData.actions[0].firstName = ''
                    }
                  })
                  console.log(room.data.players)
                }
              })

            }
            // if (requestMessage.type === 'nextQuestion'){
            //   this.isNextQuestion+=1
            //   if(this.isNextQuestion===2){
            //     this.roomsId.find(room=>room)
            //   }
            // }
          } else {
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

  userWithoutAction(array
                      :
                      Array<IUser>, excludedUser
                      :
                      string
  ) {
    const modifyedArray = array.map((user) => {
      if (!user) return
      if (user.name != excludedUser) {
        return user.name
      } else {
        return
      }
    })
    return modifyedArray
  }
}



