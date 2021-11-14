import Control from "../common/controll";
import {categoriesList} from "../images";
import {App} from "../app";
import './StrartPage.css'

export class StartPage extends Control {
    public wrapper: Control<HTMLElement>;
    public onStartClick: () => void;
    private gameMode: Control<HTMLElement>;
    private singleGame: Control<HTMLElement>;
    private onlineGame: Control<HTMLElement>;
    private questionsBy: Control<HTMLElement>;
    private painterQuestions: Control<HTMLElement>;
    private worksQuestions: Control<HTMLElement>;
    private categories: Control<HTMLElement>;
    private startGame: Control<HTMLButtonElement>;

    private category: Control<HTMLElement>;

    constructor(parentNode: HTMLElement, parentControl: App) {
        super(parentNode);
        this.wrapper = new Control(this.node, 'div', 'start-page')
        this.gameMode = new Control(this.wrapper.node, 'div', 'start-page-gameMode')
        this.singleGame = new Control(this.gameMode.node, 'div', 'single-game', 'Single Game')
        this.singleGame.node.setAttribute('data-index', 'single')
        this.singleGame.node.addEventListener('click', (e) => {
            parentControl.choosedMode = (e.target as HTMLElement).dataset.index
            this.gameMode.destroy()
            this.gameBy(parentControl)
            //this.onlineGame.node.setAttribute('disabled', 'true')
        })
        this.onlineGame = new Control(this.gameMode.node, 'div', 'online-game', 'Online Game')
        this.onlineGame.node.setAttribute('data-index', 'online')
        this.onlineGame.node.addEventListener('click', (e) => {
            parentControl.choosedMode = (e.target as HTMLElement).dataset.index
            this.gameMode.destroy()
            this.gameBy(parentControl)
            // this.singleGame.node.setAttribute('disabled', 'true')
        })
    }

    gameBy(parentControl: App) {
        this.questionsBy = new Control(this.wrapper.node, 'div', 'guestionsBy')
        this.painterQuestions = new Control(this.questionsBy.node, 'div', 'painter-game', 'By painter')
        this.painterQuestions.node.setAttribute('data-index', 'painter')
        this.painterQuestions.node.addEventListener('click', (e) => {
            this.drawCategories(e,parentControl)
        })
        this.worksQuestions = new Control(this.questionsBy.node, 'div', 'works-game', 'By paints')
        this.worksQuestions.node.setAttribute('data-index', 'works')
        this.worksQuestions.node.addEventListener('click', (e) => {
           this.drawCategories(e,parentControl)
        })
    }
    drawCategories(e:Event,parentControl:App){
        parentControl.questions = (e.target as HTMLElement).dataset.index
        this.questionsBy.destroy()
        this.showCategories(parentControl)
    }
    showCategories(parentControl:App){
        this.categories = new Control(this.wrapper.node, 'div', 'categories')
        categoriesList.forEach((cat, ind: number) => {
            this.category = new Control(this.categories.node, 'div', 'category', cat.russian)
            this.category.node.style.background = this.generateRandomColor()
            this.category.node.setAttribute('data-index', ind.toString())
            this.category.node.addEventListener('click', (e) => {
                parentControl.choosedCategory = (e.target as HTMLElement).dataset.index
                this.onStartClick()
            })
        })
    }

    generateRandomColor() {
        const r = Math.floor(Math.random() * 255)
        const g = Math.floor(Math.random() * 255)
        const b = Math.floor(Math.random() * 255)
        // return `rgba(${r},${g},${b},1)`
        return `linear-gradient(125deg,
         rgba(${r},${g},${b},1) 0%, rgba(${r},${g},${b},0.5) 38%, 
         rgba(${255 - r},${255 - g},${255 - b},1) 100%)`
    }
}
