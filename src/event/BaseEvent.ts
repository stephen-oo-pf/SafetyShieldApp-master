export default class BaseEvent{
    type:string;
    details?:any;
    constructor($type:string, $details?:any){
        this.type = $type;
        this.details = $details;
    }
}