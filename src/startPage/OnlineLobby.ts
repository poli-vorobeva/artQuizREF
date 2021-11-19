import Control from "../common/controll";

export class OnlineLobby extends Control {
  public onShowOnlineUsers:(input:HTMLInputElement)=>void
  constructor(parentNode: HTMLElement) {
    super(parentNode);
    const wrapper = new Control(parentNode, 'div', 'showOnlineUsers', 'ShowOnlineUsers')
    const input = new Control(wrapper.node, 'input')
    const showOnlineUsers = new Control(wrapper.node, 'button', '', 'showUsers')
    showOnlineUsers.node.onclick = () => {
      this.onShowOnlineUsers(input.node as HTMLInputElement)
    //  wrapper.destroy()
    }
  }
}
