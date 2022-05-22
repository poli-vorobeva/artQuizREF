import Connections from "./Connections";
import {connection} from "websocket";
import {IServerResponseMessage} from "./serverInterfaces";
import {response} from "./serverSocket";

export default class Users{
	private connects: Connections;
	constructor(connects: Connections) {
		this.connects=connects
	}

	getUsersList(name:string, connection: connection) {
		const otherUsers = this.connects.usersWithoutCurrentUser(name)
		const responseMessage: IServerResponseMessage = response('getUserList', otherUsers)
		connection.sendUTF(JSON.stringify(responseMessage))
		this.connects.getUsersList(name,connection)
	}

	getOpenUsers() {
		this.connects.getOpenUsers()
	}
}