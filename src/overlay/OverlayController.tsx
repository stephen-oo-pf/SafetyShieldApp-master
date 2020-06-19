import React from 'react';
import { listen, unlisten, dispatch } from '../dispatcher/Dispatcher';
import OverlayEvent from '../event/OverlayEvent';
import Overlay from './Overlay';
import NextFrame from '../util/NextFrame';

export interface OverlayControllerProps {
    id:string;
    overlay:any;
}

export interface OverlayData{
    id:string;
    name:string;
    details:any;
    state?:string;
}

export function showOverlay($name:string, $id:string, $details:any){
    dispatch(new OverlayEvent(OverlayEvent.SHOW, {name:$name, id:$id, details:$details}))
    
}
export function hideOverlay($name:string, $id:string, $details:any){
    dispatch(new OverlayEvent(OverlayEvent.HIDE, {name:$name, id:$id, details:$details}));
}


export default class OverlayController extends React.Component<OverlayControllerProps> {


    static STATE_INIT:string = "init";
    static STATE_SHOW:string = "show";
    static STATE_HIDE:string = "hide";

    overlays:OverlayData[];
    
    constructor($props:OverlayControllerProps){
        super($props);

        this.overlays = [];
        listen(OverlayEvent.SHOW, this._onShow);
        listen(OverlayEvent.HIDE, this._onHide);        
    }
    componentWillUnmount(){
        unlisten(OverlayEvent.SHOW, this._onShow);
        unlisten(OverlayEvent.HIDE, this._onHide);
    }
    _onShow=($event:OverlayEvent)=>{
        if($event.data && this.props.id===$event.data.id){
            $event.data.state=OverlayController.STATE_INIT;
            this.overlays.push($event.data);
            this.forceUpdate(()=>{
                NextFrame(()=>{
                    if($event.data){
                        $event.data.state=OverlayController.STATE_SHOW;
                        this.forceUpdate();
                    }
                });
            });  
        }
    }

   

    _onHide=($event:OverlayEvent)=>{
        
        if($event.data && this.props.id===$event.data.id){
            const findIndex = ()=>{           
                return this.overlays.findIndex(($overlay)=>{
                    return $overlay.name===$event.data!.name && $overlay.id===$event.data!.id;
                });
            }
            let index:number = findIndex();
            if(index!==-1){
                this.overlays[index].state = OverlayController.STATE_HIDE;
                this.forceUpdate();
            }

            if(index!==-1){
                this.forceUpdate();
                window.setTimeout(()=>{
                    let removeIndex:number = findIndex();
                    if(removeIndex!==-1){
                        this.overlays.splice(removeIndex,1);
                        this.forceUpdate();
                    }
                },(Overlay.TRANS_SPEED*1000)+10);
            }
        }
    }

    render() {
        return (
            <>
                {this.overlays.map(($value, $index)=>{                    
                    return React.createElement(this.props.overlay,{
                        key:$index+$value.id+$value.name,
                        data:$value
                    });
                })}
            </>
        );
    }
}
