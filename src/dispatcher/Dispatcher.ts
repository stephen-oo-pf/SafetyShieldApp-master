
import BaseEvent from "../event/BaseEvent";
export default abstract class Dispatcher{    
    private static _events:{[key:string]:(($e:BaseEvent)=>void)[]} = {};

    static addEventListener($type:string, $listener:($e:BaseEvent)=>void):void{
        if(this._events[$type]===null || this._events[$type]===undefined) {
            this._events[$type] = [];
        }
        this._events[$type].push($listener);
    }
    static removeEventListener($type:string, $listener:($e:BaseEvent)=>void):void{
        if (this._events[$type]) {
            const id = this._events[$type].indexOf($listener);
            if (id!==-1) {
                this._events[$type].splice(id, 1);
            }
        }
    }
    static dispatchEvent($event:BaseEvent):void{
        if(this._events[$event.type]){
            this._events[$event.type].forEach(($value:($e:BaseEvent)=>void)=>{
                $value($event);
            });
        }
    }
};

export function dispatch($event:BaseEvent){
    Dispatcher.dispatchEvent($event);
}

export function listen($event:string, $listener:($e:BaseEvent)=>void){
    Dispatcher.addEventListener($event,$listener);
}
export function unlisten($event:string, $listener:($e:BaseEvent)=>void){
    Dispatcher.removeEventListener($event,$listener);
}