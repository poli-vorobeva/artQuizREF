import {IConnection, IRoom, IServerResponseMessage, IStartGameData, IUser} from "./serverInterfaces";
import {connection, IUtf8Message} from "websocket";

export default class Connections {
	public connections: Array<IConnection> = []
	public clients: Array<IUser> = []

	constructor() {

	}

	toAllConnections(message: IUtf8Message) {
		this.connections.forEach(connect => {
			connect.connection.sendUTF(message.utf8Data)
		})
	}

	addConnection(userName: string, connection: connection) {
		this.connections.push({name: userName, connection})
	}

	addClient(userName: string) {
		this.clients.push({name: userName, status: 'wait', room: null})
		console.log(this.clients, '$#$#$')
	}

	usersWithoutCurrentUser(userName: string, array = this.clients) {
		return array.map((user) => {
			if (!user) return
			if (user.name != userName) {
				return user.name
			} else {
				return
			}
		})
	}

	sendUserList() {
		const openUsersList=this.clients.map(cl=> {
			if(cl.status !== 'game'){
				return cl
			}
			return
		})
		this.connections.forEach(client => {
		const responseMessage: IServerResponseMessage = response('getUserList',
				this.usersWithoutCurrentUser(client.name,openUsersList))
			client.connection.sendUTF(JSON.stringify(responseMessage))
		})
	}

	findConnection(user: string) {
		return this.connections.find(con => con.name === user)
	}

	sendToRoomPlayers(room: any, response: IServerResponseMessage) {
		this.connections.forEach(connection => {
			if (connection.name === room.data.players[0].playerName
				|| connection.name === room.data.players[1].playerName) {
				connection.connection.sendUTF(JSON.stringify(response))
			}
		})
	}

	sendToRoomPlayer(name: string, responseMessage: IServerResponseMessage, _room: string) {
		this.connections.forEach(connection => {
			if (connection.name === name || connection.name === name) {
				connection.connection.sendUTF(JSON.stringify(responseMessage))
			}
		})
	}

	getOpenPlayers() {
		console.log(this.clients, '---Clients')
		return this.clients.map(client => {
			if (client.status != 'game') {
				return client
			}
		})
	}

	getOpenPlayersExceptCurrent(userName: string) {
		const openUsers = this.getOpenPlayers()
		return openUsers.map(e => e && e.name != userName)
	}

	getOpenUsers() {
		this.connections.forEach(connect => {
			const responseMessage: IServerResponseMessage = response('getOpenUsers',
				this.usersWithoutCurrentUser(connect.name, this.getOpenPlayers()))
			connect.connection.sendUTF(responseMessage)
		})
	}

	getUsersInGame(roomId: string) {
		return this.clients.map(client => {
			if (client.status === 'game' && client.room === roomId) {
				return client.name
			}
		}).filter(cl => cl)
	}

	changeClientStatus(nameOne: string, nameTwo: string, roomId: string) {
		this.clients.forEach(client => {
			if (client.name === nameOne || client.name === nameTwo) {
				client.status = 'game'
				client.room = roomId
			}
		})
	}

	getUsersList(name: string, connection: connection) {
		this.addConnection(name, connection)
		this.addClient(name)
		this.sendUserList()
	}
}

function response(type: string, content: any) {
	return {
		type: type,
		content: JSON.stringify(content)
	}
}