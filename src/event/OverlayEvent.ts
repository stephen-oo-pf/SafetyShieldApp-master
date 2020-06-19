import BaseEvent from "./BaseEvent";
import { OverlayData } from "../overlay/OverlayController";

export default class OverlayEvent extends BaseEvent{

    data?:OverlayData;
    
    static SHOW:string = "overlay_show";
    static HIDE:string = "overlay_hide";

    constructor($type:string, $details?:any){
        super($type,$details);

        if($details){
            this.data = $details as OverlayData;
        }
    }
    
}