import {
	IAnswerObj,
	IChooseCategoryData, IParams, IPlayerAnswer, IPlayersResponse, IServerBothAnswer, IServerQuestions,
	IServerResponseMessage,
	IStartGame,
	IStartGameData, IUser,
	IUsernameList, IWorkItem
} from "./interface";
import {App} from "./app";
import Signal from "./common/singal";

export class ClientSocketModel {
	public onGetUserList: Signal<IUsernameList> = new Signal();
	public oneChoosedCategory: Signal<string> = new Signal();
	public onGetServerNextQuestion: Signal<IWorkItem[]> = new Signal<IWorkItem[]>();
	public redrawCategories: Signal<string> = new Signal<string>();
	public onOnlineSettings: Signal<IStartGameData> = new Signal<IStartGameData>();
	public onStartGame: Signal<null> = new Signal<null>();
	public onGetServerQuestions: Signal<IServerQuestions> = new Signal<IServerQuestions>();
	onGetInvite: Signal<{from:string,to:string}> = new Signal<{from:string,to:string}>();
	declineInvite:Signal<{from:string,to:string}>=new Signal<{from: string, to: string}>()
	private websocket: WebSocket;
	private userConnectionName: string;
	private app: App;
	private activePlayer: string;
	private players: string[];
	private roomId: string
	public onGetOpenUsers: Signal<string[]> = new Signal<string[]>()
	public onNextQuestion: Signal<null> = new Signal<null>()
	public onBothAnswer: Signal<IServerBothAnswer> = new Signal<IServerBothAnswer>()
	public onPlayersFromServer: Signal<IPlayersResponse> = new Signal<IPlayersResponse>()
	private types: Record<string, (data: any) => void>

	constructor(setSettingsData: (category: string[], _number: number) => void
	) {
		this.types = {
			getUserList: (data) => this.onGetUserList.emit(data),
			getOpenUsers: (data) => {
				const responseNames = data.map((e: IUser) => e && e.name != this.userConnectionName)
				this.onGetOpenUsers.emit(responseNames)
			},
			oneCategoryLeft: (data) => {
				this.oneChoosedCategory.emit(data)
				return
			},
			chooseCategory: (data) => {
				this.activePlayer = data.activePlayer
				this.redrawCategories.emit(data.category)
			},
			declineInvite:(data)=>{
				this.declineInvite.emit(data)
			},
			sendInvite:(data)=>{
				this.onGetInvite.emit(data)
			},
			startGame: (data) => {
				this.activePlayer = data.activePlayer
				this.onOnlineSettings.emit(data);
				this.roomId = data.roomId;
				this.onStartGame.emit(null)
			},
			playersFromServer: (data) => {

				this.onPlayersFromServer.emit({
					player: this.userConnectionName,
					opponent: data.players.filter((e: string) => e != this.userConnectionName)[0],
					question: JSON.parse(data.question)
				})
			},
			onAnswer: (data) => {
				const player = data.players.filter((player: IPlayerAnswer) => player.name === this.userConnectionName)[0]
				const opponent = data.players.filter((player: IAnswerObj) => player.name !== this.userConnectionName)[0]
				this.onBothAnswer.emit({player, opponent, question: data.question, correct: data.correct})
			},
			onGetNextQuestion: (data) => {
				const _response = JSON.parse(data)
				this.onGetServerNextQuestion.emit(JSON.parse(_response))
			},
			onFinishRound: (data) => {
				console.log(data)
				console.log(JSON.parse(data))
			}
		}
		this.websocket = new WebSocket('ws://localhost:3000/');
		this.websocket.onopen = () => {

		}
		this.websocket.onmessage = (message) => {
			const response: IServerResponseMessage = JSON.parse(message.data)
			this.types[response.type](JSON.parse(response.content))
			if (response.type === 'message') {
			}
		}
		this.websocket.onerror = () => {

		}
		//websocket.close()
	}

	getOnlineUsers(name: string) {
		this.userConnectionName = name
		this.sendRequest('getUserList', name)
	}

	chooseCategory(category: string) {
		if (this.activePlayer !== this.userConnectionName) return
		else {
			this.sendRequest('chooseCategory', {category, roomId: this.roomId})
		}
	}

	sendGameParams(params: IParams) {
		this.sendRequest("sendGameParams", {...params, roomId: this.roomId, playerName: this.userConnectionName})
	}

	onAnswer(author: string) {
		this.sendRequest('onAnswer', {
			name: this.userConnectionName,
			roomId: this.roomId,
			author
		})
	}

	getPlayersName() {
		return {
			player: this.userConnectionName,
			opponent: this.players.filter(e => e !== this.userConnectionName)[0],
			activePlayer: this.activePlayer
		}
	}
//todo delete room after game, clear players data, add them to open players
	nextQuestionFromServer() {
		this.sendRequest('onGetNextQuestion', {
			roomId: this.roomId,
		})
	}

	sendRequest(type: string, data: string | Record<string, string | { [key: string]: string | string[] }> | IStartGame) {
		const requestMessage = {
			type: type,
			content: JSON.stringify(data)
		}
		this.websocket.send(JSON.stringify(requestMessage))
	}
	onDeclineInvite(data: { players: { to: string; from: string } }) {
		this.sendRequest('declineInvite',data)
	}
}