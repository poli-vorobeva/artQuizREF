import {IUtf8Message, request} from "websocket";
import {Server} from "http";
import {
  IConnection,
  IRoom,
  IRoomPlayer,
  IServerRequestMessage,
  IServerResponseMessage,
  IUser
} from "./serverInterfaces";

const websocket = require('websocket')

export class ServerSocket {
  public clients: Array<IUser> = []
  public roomsId: Array<IRoom> = []
  public connections: Array<IConnection> = []
  public currentRoomId = ''
  userName: string

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
              console.log(requestMessage.content)
              const content = JSON.parse(requestMessage.content)
              const playersArray: Array<string> = content.users.split('+V+')
              const playerOne: IRoomPlayer = {playerName: playersArray[0], categoriesAnswer: {}}
              const playerTwo: IRoomPlayer = {playerName: playersArray[1], categoriesAnswer: {}}
              const roomId = (+new Date()).toString()
              this.currentRoomId = roomId
              console.log("SERVER CATEGORIES",content.categories)
              const roomElement: IRoom = {
                id: roomId,
                data: {
                  players: [playerOne, playerTwo],
                  currentPlayer: 0
                },
                category: content.categories
              }
              this.roomsId.push(roomElement)

              this.clients.forEach(client => {
                if (client.name === playersArray[0] || client.name === playersArray[1]) {
                  client.status = 'game'
                  client.room = roomId
                }
              })

              //перебираем коннекшнс= найди всех клиентов в которых статус не равен Гейм. и им отправь
              //имена всех свободных клиентов
              //и найди всех которые Гейм- если у них комната равна текущей комнате
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
              const roomCategories= this.roomsId.find(room=> room.id===roomId).category
              usersInGame.forEach(user => {
                if (!user) return
                const connectionInGame = this.connections.find(con => con.name === user)
                const responseMessage: IServerResponseMessage = {
                  type: 'startGame',
                  content: JSON.stringify({usersInGame, randomNumber,categories:roomCategories})
                }
                connectionInGame.connection.sendUTF(JSON.stringify(responseMessage))
              })
            }
            if (requestMessage.type === 'chooseCategory') {
              const content = JSON.parse(requestMessage.content)
              const room = this.roomsId.filter(room => room.id === this.currentRoomId)
              if (content.user === room[0].data.players[room[0].data.currentPlayer].playerName) {
                room[0].category = room[0].category.filter(categ => categ !== content.category)
                room[0].data.currentPlayer = 0 ? 1 : 0
                const responseMessage: IServerResponseMessage = {
                        type: 'chooseCategory',
                        content: JSON.stringify(room[0].category)
                      }
                      this.connections.forEach(connection=>{
                        if(connection.name===room[0].data.players[0].playerName
                          || connection.name===room[0].data.players[1].playerName ){
                          connection.connection.sendUTF(JSON.stringify(responseMessage))
                        }
                      })
              } else {
                return
              }
              //если приходит просто массив, то добавь его в комнату категории.
              //если есть клик по элементу то и элемент удалаем из списка элементов- меняем текущего игрока и ..

            }
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



