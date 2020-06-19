export default class TimerUtil{

    static objDebounces:any = {};

    static debounce($id:string, $action:()=>void, $ms:number=300){
        let prevtimeoutID:number = -1;
        if(this.objDebounces[$id]) prevtimeoutID = this.objDebounces[$id];
        window.clearTimeout(prevtimeoutID);

        let nextTimeoutID:number = window.setTimeout(()=>{
            $action();
            delete this.objDebounces[$id];
        },$ms);
        this.objDebounces[$id] = nextTimeoutID;
    }
    static clearDebounce($id:string){
        let prevtimeoutID:number = -1;
        if(this.objDebounces[$id]){
            prevtimeoutID = this.objDebounces[$id];
            window.clearTimeout(prevtimeoutID);
            delete this.objDebounces[$id];
        }
        
    }
}