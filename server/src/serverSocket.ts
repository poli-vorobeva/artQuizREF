import {client, IUtf8Message, request} from "websocket";
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
import Connections from "./Connections";
import Game from "./Game";
import Rooms from "./Rooms";

const websocket = require('websocket')

//todo создавать сначала юзер, после начала игры пллер, затем комнату. и удаляем их из открытых игроков.
//комнату пихаем в активные сеансы, после окончания игры- комнату разрушаем
//данные из плеера переносим в Юзера, опять добавляем их в открытых игроков

export class ServerSocket {
//  public clients: Array<IUser> = []
//	public roomsId: Array<IRoom> = []
	public isNextQuestion = 0
	// public connections: Array<IConnection> = []
	// public currentRoomId = ''
	userName: string
	public bothPlayersResponse = 0
	private connects: Connections;
	private game: Game;
	private rooms: Rooms;

	constructor(server: Server) {
		const wsServer = new websocket.server({
			httpServer: server,
		});
		this.connects = new Connections()
		this.game = new Game()
		this.rooms = new Rooms()
		this.rooms.onSendResponseMessage = (data) => {
			console.log('%%%',data)
			const responseMessage: IServerResponseMessage = response(data.responseType, data.category)
			this.sendResponseToRoomPlayers(data.roomId, responseMessage)
		}
		this.rooms.onAnswerResponse = (data) => {
			const responseContent: IServerResponseMessage = response(data.responseType, data.data)
			this.sendResponseToRoomPlayers(data.roomId, responseContent)
		}
		this.rooms.onGetNextQuestion = (data) => {
			const responseContent = response(data.responseType, data.data)
			this.sendResponseToRoomPlayers(data.roomId, responseContent)
		}

		wsServer.on('request', (request: request) => {
				const connection = request.accept(undefined, request.origin);
				connection.on('message', (_message) => {
					if (_message.type === 'utf8') {
						const message = _message as IUtf8Message
						const requestMessage: IServerRequestMessage = JSON.parse(
							message.utf8Data
						);
						if (requestMessage.type === 'message') {
							const responseStatus: IServerResponseMessage = response('message-status', 'ok')
							const responseMessage: IServerResponseMessage = response('message', message.utf8Data)
							connection.sendUTF(JSON.stringify(responseStatus))
							this.connects.toAllConnections(message)
						}
						if (requestMessage.type === 'getUserList') {
							this.userName = JSON.parse(requestMessage.content)
							this.connects.addConnection(this.userName, connection)
							this.connects.addClient(this.userName)
							const otherUsers = this.connects.usersWithoutCurrentUser(this.userName)
							const responseMessage: IServerResponseMessage = response('getUserList', otherUsers)
							//connection.sendUTF(JSON.stringify(responseMessage))
							this.connects.sendUserList()
						}
						if (requestMessage.type === 'getOpenUsers') {
							this.connects.getOpenUsers()
						}
						if (requestMessage.type === 'startGame') {
							console.log("STARTGame")
							const content = JSON.parse(requestMessage.content)
							const playersArray: Array<string> = content.users.split('+V+')
							const roomElement = this.rooms.createRoomData(playersArray, content.categories)
							this.rooms.addRoom(roomElement)
							this.connects.changeClientStatus(playersArray[0], playersArray[1], roomElement.id)

							const openUsers = this.connects.getOpenPlayers()

							//todo send list of openUsers only players wait
console.log(openUsers,'openusers$$$$')
							openUsers.map(e => e && e.name).filter(client => client)
							openUsers.forEach(user => {
								console.log(user,'^^^')
								if (!user || user.status=='game') return
							//	console.log(openUsers,'__________')
								//const openWithoutCurrent=this.connects.usersWithoutCurrentUser(user.name)
							//	console.log(openWithoutCurrent,'&&&&')
								const openConnection = this.connects.findConnection(user.name)
								const responseMessage: IServerResponseMessage = response('getOpenUsers', openUsers)
								openConnection.connection.sendUTF(JSON.stringify(responseMessage))
							})
							const usersInGame = this.connects.getUsersInGame(roomElement.id)
							const randomNumber = Math.floor(Math.random() * 10 + 1)
							const roomCategories = this.rooms.getRoomCategories(roomElement)
							usersInGame.forEach(user => {
								if (!user) return
								const connectionInGame = this.connects.findConnection(user)
								const startData: IStartGameData = {
									usersInGame, randomNumber,
									categories: roomCategories,
									playerName: this.userName,
									roomId: roomElement.id,
									activePlayer: roomElement.data.players[roomElement.data.currentPlayer].playerName
								}
								const responseMessage: IServerResponseMessage = response('startGame', startData)
								connectionInGame.connection.sendUTF(JSON.stringify(responseMessage))
							})
						}
						if (requestMessage.type === 'chooseCategory') {
							const content = JSON.parse(requestMessage.content)
							//const room = this.rooms.currentRoom(content.roomId)
							// const room = this.roomsId.filter(room => room.id === content.roomId)
							//room.category = room.category.filter(categ => categ !== content.category)
							const room = this.rooms.chooseCategory(content.roomId, content.category)

							const responseMessage: IServerResponseMessage = response('chooseCategory', {
								category: content.category,
								activePlayer: room.data.players[room.data.currentPlayer].playerName
							})
							this.sendResponseToRoomPlayers(room.id, responseMessage)
							// this.connections.forEach(connection => {
							//   if (connection.name === room[0].data.players[0].playerName
							//       || connection.name === room[0].data.players[1].playerName) {
							//     connection.connection.sendUTF(JSON.stringify(responseMessage))
							//   }
							// })
						}
						if (requestMessage.type === 'sendGameParams') {
							const content: {
								mode: string, by: string,
								category: { russian: string, english: string, painters: string[] }, roomId: string, playerName: string
							} = JSON.parse(requestMessage.content)

							const questionData = this.rooms.getRoomQuestions(content)

							const responseMessage = response('playersFromServer', {
								players: questionData.players,
								question: JSON.stringify(questionData.question)
							})

							this.sendResponseToRoomPlayer(content.playerName, questionData.roomId, responseMessage)
							// this.sendResponseToRoomPlayer(content.playerName, content.roomId, responseMessage)
						}
						if (requestMessage.type === 'onAnswer') {
							// отпраляются запросы по два-и после одного меняется по одному игроку клик
							const content: { name: string, roomId: string, author: string } = JSON.parse(requestMessage.content)
							this.rooms.onAnswer(content)
						}
						if (requestMessage.type === 'onGetNextQuestion') {
							const content: { roomId: string } = JSON.parse(requestMessage.content)
							this.rooms.getNextQuestion(content)
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



	sendResponseToRoomPlayer(name: string, _room: string, responseMessage: IServerResponseMessage) {
		this.connects.sendToRoomPlayer(name, responseMessage, _room)
	}

	sendResponseToRoomPlayers(_room: string, response: IServerResponseMessage) {
		const room = this.rooms.findRoom(_room)
		this.connects.sendToRoomPlayers(room, response)
	}
}

function response(type: string, content: any) {
	return {
		type: type,
		content: JSON.stringify(content)
	}
}