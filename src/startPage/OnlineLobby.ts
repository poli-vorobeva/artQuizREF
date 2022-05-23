import Control from "../common/controll";

export class OnlineLobby extends Control {
  public onShowOnlineUsers:(input:HTMLInputElement)=>void
  constructor(parentNode: HTMLElement) {
    super(parentNode,'div', 'showOnlineUsers', 'ShowOnlineUsers')
   // const wrapper = new Control(parentNode,
    const input = new Control(this.node, 'input')
    const showOnlineUsers = new Control(this.node, 'button', '', 'showUsers')
    showOnlineUsers.node.onclick = () => {
      this.onShowOnlineUsers(input.node as HTMLInputElement)
      this.destroy()
    //  wrapper.destroy()
    }
  }
}
