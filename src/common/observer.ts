class Observer{
  private listeners: any[];
  constructor() {
    this.listeners=[]
  }
  addListener(name:string,callback:()=>any){
    let id={}
    this.listeners.push({name,id,callback})
    return id
  }
  removeListener(id:any){
    this.listeners=this.listeners.filter(it=>it.id!=id)
  }
  dispatch(name:string,params:string){
    this.listeners.filter(it=>it.name===name).forEach(e=>e.callback())
  }
}
export const observer= new Observer()
