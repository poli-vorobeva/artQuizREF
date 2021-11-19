// import Control from "./src/common/controll";
// import {IServerResponseMessage} from "./server/src/server";
//
//
// export class Test extends Control {
//   private wrapper: Control<HTMLElement>;
//   private input: Control<HTMLInputElement>;
//   private button: Control<HTMLButtonElement>;
//   private results: Control<HTMLElement>;
//   private websocket: WebSocket;
//   private messages: any[];
//   private buttonUsers: Control<HTMLButtonElement>;
//
//   constructor(parentNode: HTMLElement) {
//     super(parentNode);
//     this.messages=[]
//     this.websocket = new WebSocket('ws://localhost:3000/')
//     this.websocket.onopen = () => {
//
//     }
//     this.websocket.onmessage = (message) => {
//      const response:IServerResponseMessage =JSON.parse(message.data)
//       if(response.type==='message'){
//          new Control(this.results.node,'span','',response.content)
// }
//       if(response.type==='userList'){
//         const users =JSON.parse(response.content)
//         users.forEach((user:any)=>{
//           new Control(this.results.node,'span','',user.toString())
//         })
//       }
//     }
//     this.websocket.onerror = () => {
//
//     }
//     //websocket.close()
//
//     this.wrapper = new Control(parentNode, 'div', '', 'test')
//     this.input = new Control(this.wrapper.node, 'input')
//     this.button = new Control(this.wrapper.node, 'button', '', 'Send')
//     this.results = new Control(this.wrapper.node, 'span', '')
//     this.button.node.onclick = () => {
//       this.input.node.value
//       const request={
//         type:'message',
//         content:this.input.node.value,
//       }
//       this.websocket.send(JSON.stringify(request))
//     }
//     this.buttonUsers=new Control(this.wrapper.node,'button','','getUsers')
//     this.buttonUsers.node.onclick=()=>{
//       const request={
//         type:'userList',
//         content:'',
//       }
//        this.websocket.send(JSON.stringify(request))
//     }
//   }
// }
