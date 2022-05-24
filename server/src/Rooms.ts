import {IRoom, IRoomPlayer, IServerResponseMessage} from "./serverInterfaces";
import {QuestionsGenerator} from "./ServerQuestionsGenerotor";
import {IPlayerAnswer} from "../../src/interface";

export default class Rooms {
	public roomsId: Array<IRoom> = []
	onSendResponseMessage:(data:{responseType:string,category:string,roomId:string})=>void
	onAnswerResponse:(data:{responseType:string,data:{players:IPlayerAnswer[],correct: string},roomId:string})=>void
	onGetNextQuestion:(data:{responseType:string,data:string,roomId:string})=>void
	constructor() {

	}
	findRoom(_room:string){
		return this.roomsId.find(room => room.id == _room)
	}
	createRoomData(users:string[],categories:string[]):IRoom{
		const playerOne: IRoomPlayer = {playerName: users[0], categoriesAnswer: {}}
		const playerTwo: IRoomPlayer = {playerName: users[1], categoriesAnswer: {}}
		const roomId = (+new Date()).toString()
		return {
			id: roomId,
			data: {
				players: [playerOne, playerTwo],
				currentPlayer: 0
			},
			category: categories,
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
	}

	addRoom(roomElement: IRoom){
	this.roomsId.push(roomElement)
	}

	getRoomCategories(roomElement: IRoom){
		return this.roomsId.find(room => room.id === roomElement.id).category
	}
	chooseCategory(roomId: string,category:string){
		const room = this.currentRoom(roomId)
		console.log('category-----',category)
		room.category=room.category.filter(categ => categ !== category)
		console.log("RRROMcatag",room.category)
		//todo --done-- after choose your partner, partner should get an announcement
		//todo --done-- if two players starts the game, this players should hide from openPlayers list
		//todo--done-- after get the open players the form with input should be hidden
		//todo --done-- if no open players - write: there is no players yet
		//todo --done-- actual openPlayers on add new player
		if (room.category.length === 1) {
			console.log("ONEEEEEEEEEEEEEEEEEEE")
			this.onSendResponseMessage({responseType:'oneCategoryLeft',category:room.category[0],roomId:room.id})

			// this.connections.forEach(connection => {
			//   if (connection.name === room[0].data.players[0].playerName
			//       || connection.name === room[0].data.players[1].playerName) {
			//     connection.connection.sendUTF(JSON.stringify(responseMessage))
			//   }
			// })
		}else{

		}
		if (room.data.currentPlayer === 0) {
			room.data.currentPlayer = 1
		} else {
			room.data.currentPlayer = 0
		}
		return room
	}
	currentRoom(roomId: string) {
		return this.roomsId.filter(room => room.id === roomId)[0]
	}
	rewriteCategories(){

	}
	getQuestion(_room: string) {
		const currentRoom = this.roomsId.filter(room => room.id == _room)
		const questionElement = currentRoom[0].currentQuestionData.questions[currentRoom[0].currentQuestionData.questionNumber]
		return [questionElement.correct, ...questionElement.variants]
	}

	getNextQuestion(content: { roomId: string }){
	this.roomsId.forEach(room => {
		if (room.id === content.roomId) {
			room.currentQuestionData.questionNumber += 1
			if (room.currentQuestionData.questionNumber == room.currentQuestionData.questions.length) {
				const playersRoundResults = room.data.players.map(player => {
					player.categoriesAnswer[room.category[0]]
				})
				this.onGetNextQuestion({responseType:'onFinishRound',data:JSON.stringify(JSON.stringify(playersRoundResults)),roomId:content.roomId})
			} else {
				room.data.players.forEach(player => {
					const question = this.getQuestion(content.roomId)
					this.onGetNextQuestion({responseType:'onGetNextQuestion',
						data:JSON.stringify(JSON.stringify(question)),roomId:content.roomId})
				})
			}
		}
	})
}

	getRoomQuestions(content: { mode: string; by: string; category: { russian: string; english: string; painters: string[] }; roomId: string; playerName: string }){
		const room = this.currentRoom(content.roomId)
		// const currentRoom = this.roomsId.filter(room => room.id == content.roomId)

		room.currentQuestionData.questions = new QuestionsGenerator(content).questionsArray

		return {question:this.getQuestion(content.roomId),players:room.data.players.map(player => player.playerName),roomId:room.id}
	}
	writeAnswerData(room: IRoom, name: string, correct: boolean, author: string) {
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
	onAnswer(content: { name: string; roomId: string; author: string }){
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
				this.onAnswerResponse({responseType:'onAnswer',data:{
						players: room.currentQuestionData.actions,
						correct: room.currentQuestionData.questions[room.currentQuestionData.questionNumber].correct.author
					},roomId:room.id})
				this.cleanAnswerData(room)
			}
		})
	}
	cleanAnswerData(room) {
		room.currentQuestionData.actions.forEach(act => {
			act.name = ''
			act.isCorrect = false
			act.author = ''
		})
	}
}
function isCorrectAnswer(room: IRoom, content) {
	return room.currentQuestionData.questions[room.currentQuestionData.questionNumber].correct.author === content.author
}