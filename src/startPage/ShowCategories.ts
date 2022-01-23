import Control from "../common/controll";
import {ICategory} from "../interface";
import {categoriesList} from "../images";

export class ShowCategories extends Control {
    public category: Control<HTMLButtonElement>;
    public onChoosedCategory: (category: ICategory) => void
    private categories: Control<HTMLElement>;
    public onExcludedCategory:(category:string)=>void
    private clickedCategory: string;
    private mode: string;

    constructor(parentNode: HTMLElement, categories?: string[]|boolean,mode?:string) {

        super(parentNode);
        this.clickedCategory=''
        this.mode=mode
        this.categories = new Control(parentNode, 'div', 'categories')
        let categList: string[] = []
        if (!categories) {
            categoriesList.forEach((cat) => {
                categList.push(cat.russian)
            })
        } else {
            categList = categories as string[]
        }
        categList.forEach(cat => {
            this.category = new Control(this.categories.node, 'div', 'category', cat)
            this.category.node.style.background = this.generateRandomColor()
            this.category.node.onclick = () => {
                if(this.mode==='single'){
                    const category:ICategory=categoriesList.find(category=> category.russian===cat)
                    this.onChoosedCategory(category)
                    console.log(category)
                }else {
                    this.onExcludedCategory(cat)
                }
            }
        })
    }
    deleteOneCategory(category:string){
        Array.from(this.categories.node.children).forEach(el=>{
            if(el.innerHTML==category){
                (el as HTMLElement).style.display='none'
            }
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
    gameMode(mode:string){
        this.mode=mode
    }
}