import Control from "../common/controll";
import {IPlayerAnswer, IServerBothAnswer, IWorkItem} from "../interface";
import {GameController} from "./GameController";
import {QuizItemController} from "./QuizItemController";
import {IQuestions} from "../app";
import Signal from "../common/singal";
import {observer} from "../common/observer";

function shuffle(array: IWorkItem[]) {
  let currentIndex = array.length, randomIndex;
  const newArray = array.slice()
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]
    ];
  }
  return newArray;
}

export class QuestionItem extends Control {
  private correctAnswer: IWorkItem;
  private shuffledArray: IWorkItem[];
  private title: Control<HTMLElement>;
  private controller: QuizItemController;
  public onAnswer: (author: string) => void
  public onSingleAnswer: (answer: boolean) => void
  private gameMode: string;
  public nextQuestion: () => void;
  private allVariantsHTMLElements: { [key: string]: HTMLElement };
  public hideOutItemStyle: () => void
  private question: IWorkItem[];

  constructor(parentNode: HTMLElement, question: IWorkItem[], gameMode: string, by: string) {
    super(parentNode);
    this.gameMode = gameMode
    this.allVariantsHTMLElements = {}
    this.shuffledArray = shuffle(question)
    this.question= question
    const wrapper = new Control(this.node, 'div', by === 'work'
      ? 'byWorkWrapper' : 'byPainterWrapper')
    const title = by === 'works' ? `какую из этих картин написал ${question[0].author} ?`
      : `Какой художник написал эту картину ?`
    const paintItem = new Control(wrapper.node, 'div', by === 'works'?'byPainter':'byWork__image')
    by !== 'works' && (paintItem.node.style.backgroundImage = `url(./public/assets/img/${question[0].imageNum}.jpg)`)
    const titleEl = new Control(paintItem.node, 'h4', '', title)
    this.shuffledArray.forEach((p: IWorkItem) => {
      this.variantItem(by, wrapper.node, p)
    })
  }

  variantItem(by: string, wrapper: HTMLElement, p: IWorkItem) {
    const but = new Control(wrapper, 'div',
      by === 'works' ? 'questionItem-variant-work' : 'questionItem-variant-painter',
      by === 'works' ? '' : p.author)
    const insideDiv = new Control(but.node, 'div', 'item-isCorrect-color')
    by === 'works' && (but.node.style.backgroundImage = `url(./public/assets/img/${p.imageNum}.jpg)`)
    this.allVariantsHTMLElements[p.author] = insideDiv.node
    but.node.onclick = () => {
      //  console.log('Mode', this.gameMode)
      insideDiv.node.classList.add('playerAnswer')
      if (this.gameMode === 'single') {
        this.correctAnswer=this.question[0]
        //console.log(this.correctAnswer,p.author)
        this.onSingleAnswer(this.correctAnswer.author==p.author)
      }
      else {
        this.onAnswer(p.author)
        //TODO блокировку повторной отправки ответа disabled
      }
    }
  }

  setAnswerStyles(author: string, element: HTMLElement) {
    element.querySelector('div').ontransitionend = () => {
      if (author == this.correctAnswer.author) {
        //  setTimeout(()=>{
        element.querySelector('div').classList.add('correctAnswer')
        element.ontransitionend = () => {
          //  this.nextQuestion(true)
        }
        //    },1000)
      }
      else {
        //   setTimeout(()=>{
        element.querySelector('div').classList.add('mistakeAnswer')
        element.ontransitionend = () => {
          // this.nextQuestion(true)
        }
        //  },1000)
      }
    }
  }

  playersAnswersStyle(player: IPlayerAnswer, opponent: IPlayerAnswer) {
    return new Promise((res, rej) => {
      Object.entries(this.allVariantsHTMLElements).forEach((variant, index) => {
        console.log(variant[0], variant[1])
        variant[0] === player.author && (variant[1].style.background = 'rgba(100,100,0,0.5)')
        variant[0] === opponent.author && (variant[1].style.background = 'rgba(0,100,100,0.5)')
        variant[1].ontransitionend = () => {
          res(null)
        }
      })

    })
  }

  correctAnswersStyle(correct: string) {
    return new Promise((res, rej) => {
      console.log("FromPlomise")
      Object.entries(this.allVariantsHTMLElements).forEach((variant, index) => {
        // console.log(variant[0], variant[1])
        if (variant[0] === correct) {
          variant[1].style.background = 'rgba(0,200,0,0.8)'
          variant[1].ontransitionend = () => {
            res(null)
          }
        }
        else {
          variant[1].style.background = 'rgba(200,0,0,0.8)'
          variant[1].ontransitionend = () => {
            res(null)
          }
        }

      })

    })

  }

  public async setOnlineAnswerStyles(player: IPlayerAnswer, opponent: IPlayerAnswer, correct: string) {
    await this.playersAnswersStyle(player, opponent)
    await this.correctAnswersStyle(correct)
    this.hideOutItemStyle()

//-----Нужна анимация

  }
}

// if (by === 'work') {
//   this.title = new Control(this.node, 'h5', 'questionItem-title',
//     `какую из этих картин написал ${question[0].author} ?`)
//   const byWorkWrapper = new Control(this.node, 'div', 'byWorkWrapper')
//
//   this.shuffledArray.forEach((p: IWorkItem) => {
//     const but = new Control(byWorkWrapper.node, 'div', 'questionItem-variant-work')
//     but.node.style.backgroundImage = `url(./public/assets/img/${p.imageNum}.jpg)`
//     const insideDiv = new Control(but.node, 'div', 'item-isCorrect-color')
//     this.allVariantsHTMLElements[p.author] = insideDiv.node
//     but.node.onclick = () => {
//       console.log('##########',p.author)
//       insideDiv.node.classList.add('playerAnswer')
//       console.log(p)
//       this.onAnswer(p.author)
//     }
//
//   })
// }
// if (by === 'painter') {
//   //какой художник нарисовал эту картину- выводим 4 художника
//   const byPainterWrapper = new Control(this.node, 'div', 'byPainterWrapper')
//   this.title = new Control(this.node, 'h5', 'questionItem-title',
//     `Какой художник написал эту картину ?`)
//   const imgWrapper = new Control(this.node, 'div', 'questionItem-img')
//
//   imgWrapper.node.style.backgroundImage = `url(./public/assets/full/${question[0].imageNum}full.jpg)`
//
//   this.shuffledArray.forEach(p => {
//     const but = new Control(byPainterWrapper.node, 'div', 'questionItem-variant-painter', p.author)
//     const insideDiv = new Control(but.node, 'div', 'item-isCorrect-color')
//     this.allVariantsHTMLElements[p.author] = insideDiv.node
//     but.node.onclick = () => {
//       //  console.log('Mode', this.gameMode)
//       insideDiv.node.classList.add('playerAnswer')
//       if (this.gameMode === 'single') {
//         this.onSingleAnswer(this.controller.isCorrect(p, this.correctAnswer))
//       } else {
//         console.log('##########',p.author)
//         this.onAnswer(p.author)
//       }
//
//     }
//   })
// }