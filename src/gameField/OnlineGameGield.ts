import Control from "../common/controll";

export class OnlineGameField extends Control{
  private wrapper: Control<HTMLElement>;
  private player: Control<HTMLElement>;
  private opponent: Control<HTMLElement>;
  constructor(parentNode:HTMLElement,player:string,opponent:string) {
    super(parentNode);
    this.wrapper=new Control(parentNode,'div', 'onlineGameField','ONLINEField')
    this.player=new Control(this.wrapper.node,'div','gameFieldPlayer',player)
    this.player.node.style.backgroundColor='white'
    this.opponent= new Control(this.wrapper.node,'div','gameFieldPlayer',opponent)

    //клик- получаем игрока который кликает. если уже кликнул, то кнопки не кликаются
    //на сервер отправляем запрос-
    // номер вопроса- игрок его ответ- правильно не правильно(с клиента придет)- проверяем если этот вопрос уже есть в массиве
    //с вопросами, то только дописываем в объект, если нет то создаем
    //если есть, то отправляем ответ- применяем стили к ответам участников -показываем правильный ответ
    //показываем счет-> следующий вопрос

  }
}
