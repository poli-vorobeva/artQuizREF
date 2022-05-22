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

const websocket = require('websocket')

//todo создавать сначала юзер, после начала игры пллер, затем комнату. и удаляем их из открытых игроков.
//комнату пихаем в активные сеансы, после окончания игры- комнату разрушаем
//данные из плеера переносим в Юзера, опять добавляем их в открытых игроков

export class ServerSocket {
//  public clients: Array<IUser> = []
	public roomsId: Array<IRoom> = []
	public isNextQuestion = 0
	// public connections: Array<IConnection> = []
	// public currentRoomId = ''
	userName: string
	public bothPlayersResponse = 0
	private connects: Connections;

	constructor(server: Server) {
		const wsServer = new websocket.server({
			httpServer: server,
		});
		this.connects = new Connections()
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
							connection.sendUTF(JSON.stringify(responseMessage))
							this.connects.sendUserList()
						}
						if (requestMessage.type === 'getOpenUsers') {
							this.connects.getOpenUsers()
						}
						if (requestMessage.type === 'startGame') {
							console.log("STARTGame")
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
							this.connects.changeClientStatus(playersArray[0], playersArray[1], roomId)

							const openUsers = this.connects.getOpenPlayers()
							console.log("%%%%%%%",openUsers)
								openUsers.map(e=>e && e.name).filter(client => client)
							openUsers.forEach(user => {
								if(!user) return
								const openConnection = this.connects.findConnection(user.name)
								const responseMessage: IServerResponseMessage = response('getOpenUsers', openUsers)
								openConnection.connection.sendUTF(JSON.stringify(responseMessage))
							})
							const usersInGame = this.connects.getUsersInGame(roomId)
							const randomNumber = Math.floor(Math.random() * 10 + 1)
							const roomCategories = this.roomsId.find(room => room.id === roomId).category
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
							const room = this.currentRoom(content.roomId)
							// const room = this.roomsId.filter(room => room.id === content.roomId)
							room.category = room.category.filter(categ => categ !== content.category)
							if (room.category.length === 1) {
								const responseMessage: IServerResponseMessage = response('oneCategoryLeft', room.category[0])
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
							} else {
								room.data.currentPlayer = 0
							}
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
							const content = JSON.parse(requestMessage.content)
							const room = this.currentRoom(content.roomId)
							// const currentRoom = this.roomsId.filter(room => room.id == content.roomId)

							room.currentQuestionData.questions = new QuestionsGenerator(content).questionsArray

							const question = this.getQuestion(content.roomId)
							const responseMessage = response('playersFromServer', {
								players: room.data.players.map(player => player.playerName),
								question: JSON.stringify(question)
							})

							this.sendResponseToRoomPlayer(content.playerName, room.id, responseMessage)
							// this.sendResponseToRoomPlayer(content.playerName, content.roomId, responseMessage)
						}
						if (requestMessage.type === 'onAnswer') {

							// отпраляются запросы по два-и после одного меняется по одному игроку клик
							const content = JSON.parse(requestMessage.content)
							const room = this.currentRoom(content.roomId)
							// const room = this.roomsId.filter(room => room.id === content.roomId)[0]
							room.currentQuestionData.bothPlayersClick = room.currentQuestionData.bothPlayersClick + 1
							room.data.players.forEach(player => {
								const _isCorrectAnswer = isCorrectAnswer(room, content)
								if (player.playerName === content.name) {
									if (!player.categoriesAnswer[room.category[0]]) {
										player.categoriesAnswer[room.category[0]] = +_isCorrectAnswer
									} else {
										player.categoriesAnswer[room.category[0]] =
											player.categoriesAnswer[room.category[0]] + +_isCorrectAnswer
									}
								}
								//проверка на правильность ответа
								if (room.currentQuestionData.bothPlayersClick == 1) {
									this.writeAnswerData(room, content.name, _isCorrectAnswer, content.author)
									return
								}
								if (room.currentQuestionData.bothPlayersClick == 2) {
									this.writeAnswerData(room, content.name, _isCorrectAnswer, content.author)
									room.currentQuestionData.bothPlayersClick = 0

									const responseContent: IServerResponseMessage = response('onAnswer', {
										players: room.currentQuestionData.actions,
										correct: room.currentQuestionData.questions[room.currentQuestionData.questionNumber].correct.author
									})

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
										const responseContent = response('onFinishRound', JSON.stringify(JSON.stringify(playersRoundResults)))
										this.sendResponseToRoomPlayers(content.roomId, responseContent)
									} else {
										room.data.players.forEach(player => {
											const question = this.getQuestion(content.roomId)
											const responseContent = response('onGetNextQuestion', JSON.stringify(JSON.stringify(question)))
											this.sendResponseToRoomPlayers(content.roomId, responseContent)
										})
									}
								}
							})
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

	currentRoom(roomId: string) {
		return this.roomsId.filter(room => room.id === roomId)[0]
	}

	writeAnswerData(room: IRoom, name: string, correct: boolean, author: string) {
		console.log("NAMEWRITE", name, author)
		if (!room.currentQuestionData.actions[0].name) {
			room.currentQuestionData.actions[0].name = name
			room.currentQuestionData.actions[0].isCorrect = correct
			room.currentQuestionData.actions[0].author = author
		} else {
			room.currentQuestionData.actions[1].name = name
			room.currentQuestionData.actions[1].isCorrect = correct
			room.currentQuestionData.actions[1].author = author
		}

	}

	cleanAnswerData(room) {
		room.currentQuestionData.actions.forEach(act => {
			act.name = ''
			act.isCorrect = false
			act.author = ''
		})
	}

	getQuestion(_room: string) {
		const currentRoom = this.roomsId.filter(room => room.id == _room)
		const questionElement = currentRoom[0].currentQuestionData.questions[currentRoom[0].currentQuestionData.questionNumber]
		return [questionElement.correct, ...questionElement.variants]
	}

	sendResponseToRoomPlayer(name: string, _room: string, responseMessage: IServerResponseMessage) {
	this.connects.sendToRoomPlayer(name,responseMessage,_room)
	}

	sendResponseToRoomPlayers(_room: string, response: IServerResponseMessage) {
		const room = this.roomsId.find(room => room.id == _room)
		this.connects.sendToRoomPlayers(room,response)
	}
}

function isCorrectAnswer(room: IRoom, content) {
	return room.currentQuestionData.questions[room.currentQuestionData.questionNumber].correct.author === content.author
}

function response(type: string, content: any) {
	return {
		type: type,
		content: JSON.stringify(content)
	}
}