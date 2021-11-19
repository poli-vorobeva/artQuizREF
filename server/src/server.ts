import {RequestListener, Server} from "http";
import {ServerSocket} from "./serverSocket";
const http = require('http');
const port = 3000;
const requestHandler: RequestListener = (request, response) => {
  response.end('Hello  Node.js Server!');
};
const server:Server = http.createServer(requestHandler);
const socketService = new ServerSocket(server)
server.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
