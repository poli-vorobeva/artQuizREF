import Control from "../common/controll";
import './Header.css';
import Signal from "../common/singal";

export class Header extends Control{
    private header: Control<HTMLElement>;
    private homeButton: Control<HTMLElement>;
    public onHomeButton:Signal<null>= new Signal<null>()
    constructor(parentElement:HTMLElement){
        super(parentElement)
        this.header=new Control(parentElement,'header','header','header')
        this.homeButton= new Control(this.header.node,'button','','Home')
        this.homeButton.node.onclick=()=>this.onHomeButton.emit(null)
    }
}