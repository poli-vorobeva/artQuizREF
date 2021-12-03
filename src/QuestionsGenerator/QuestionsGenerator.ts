import {images} from "../images";
import {IWorkItem} from "../interface";
export interface IParams {
    mode: string,
    by: string,
    category: { russian: string, english: string, painters: string[] }
}
export interface IQuestions{
    correct:IWorkItem
    variants:IWorkItem[]
}
export class QuestionsGenerator {
    private painters: string[];
    private questionsElements: IWorkItem[];
    public questionsArray: IQuestions[];

    constructor(params: IParams) {
        this.painters = params.category.painters
        const works: IWorkItem[][] = []
        this.painters.forEach(p => {
            const painWorks = images.filter(w => w.author === p)
            works.push(painWorks)
        })
        this.questionsElements = []
        works.forEach(e => {
            this.questionsElements.push(e[Math.floor(Math.random() * e.length)])
        })
        this.questionsArray= this.createQuestionsWithVariants(this.questionsElements)
    }
    createQuestionsWithVariants(array: IWorkItem[]){
        const resultQuestionsArray:IQuestions[]=[]
        array.forEach((item,index)=>{
            const element:{correct:IWorkItem,variants:IWorkItem[]}={correct:null,variants:[]}
            element.correct=item
            const variants:IWorkItem[]=[]
            const randomElement=()=>{
                const randomIndex=Math.floor(Math.random()*array.length)
                const notRepeat = variants
                    ? variants.every(variant=>variant.author!==array[randomIndex].author)
                    :true
                if(randomIndex!==index && notRepeat){
                    variants.push(array[randomIndex])
                }
            }
            do{
                randomElement()
            }
            while(variants.length<3)

            element.variants=[...variants]
            resultQuestionsArray.push(element)
        })
        return resultQuestionsArray
    }
    getRandom() {
        const questionsVariants: number[][] = []
        this.questionsElements.forEach((el, i) => {
            const ids = [i]

            function rand() {
                const n = Math.floor(Math.random() * 10)
                if (ids.every(e => n != e)) {
                    ids.push(n)
                } else {
                    rand()
                }
            }

            do {
                rand()
            }
            while (ids.length < 4)
            questionsVariants.push(ids)
        })
        return questionsVariants
    }

    // getValues(array: number[][]) {
    //     console.log("^^^^^",array)
    //     const roundQuestions: IWorkItem[][] = []
    //     array.forEach((ar, i) => {
    //         //  const element:{correct:IWorkItem,variants:IWorkItem[]}= {}
    //         // element.correct=ar
    //         const questions: IWorkItem[] = []
    //         ar.forEach(b => {
    //             questions.push(this.questionsElements[b])
    //         })
    //         roundQuestions.push(questions)
    //     })
    //     return roundQuestions
    // }
}