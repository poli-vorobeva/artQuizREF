import {images} from "../images";
import {IParams, IWorkItem} from "../interface";

export class QuestionsGenerator {
    private painters: string[];
    private questionsElements: IWorkItem[];
    public questionsArray: IWorkItem[][];

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
        this.questionsArray = this.getValues(this.getRandom())
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

    getValues(array: number[][]) {
        const roundQuestions: IWorkItem[][] = []
        array.forEach((ar, i) => {
            const questions: IWorkItem[] = []
            ar.forEach(b => {
                questions.push(this.questionsElements[b])
            })
            roundQuestions.push(questions)
        })
        return roundQuestions
    }
}
