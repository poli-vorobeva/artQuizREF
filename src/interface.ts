export interface IWorkItem {
  author: string;
  name: string;
  year: string;
  imageNum: string;
}
export interface IAnswerObj {
  itemArray:IWorkItem[],
  correct:IWorkItem,
  clickedAnswer:IWorkItem
}
