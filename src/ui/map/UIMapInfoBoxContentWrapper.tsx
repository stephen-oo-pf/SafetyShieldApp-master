import * as React from 'react';
import BrowserUtil from '../../util/BrowserUtil';

export interface UIInfoBoxContentWrapperProps {
    width:number;
    disableMapDrag:()=>void;
    enableMapDrag:()=>void;
    onClick?:()=>void;
}

/**
 * 
 * The purpose of this class is to handle detection of interaction with the InfoBox so we can disable the map drag... 
 * if we don't, content that has overflow:auto/scroll will not be able to scroll without also moving the map.
 */
export default class UIInfoBoxContentWrapper extends React.Component<UIInfoBoxContentWrapperProps> {
    
    contentWrapper:React.RefObject<HTMLDivElement> = React.createRef();

    _windowListening:boolean=false;

    componentDidMount(){
        if(BrowserUtil.isTouchDevice){
            window.setTimeout(()=>{
                if(this.contentWrapper.current){
                    this.contentWrapper.current.addEventListener("touchstart", this._onTouchStart);
                }
            },0);
        }
    }
    componentWillUnmount(){
        
        if(BrowserUtil.isTouchDevice){
            if(this.contentWrapper.current){
                this.contentWrapper.current.removeEventListener("touchstart", this._onTouchStart);
            }
        }
        this._removeWindowListen();
        this.props.enableMapDrag();
    }

    _addWindowListen=()=>{

        if(!this._windowListening){
            this._windowListening=true;
            window.addEventListener("touchstart", this._onWindowTouchStart);
        }
    }
    _removeWindowListen=()=>{

        if(this._windowListening){
            this._windowListening=false;
            window.removeEventListener("touchstart", this._onWindowTouchStart);
        }
    }

    _onTouchStart=()=>{
        this.props.disableMapDrag();
    }
    _onWindowTouchStart=($event:TouchEvent)=>{
        let isTouchOutside:boolean=true;

        let target:any = $event.target;
        if(this.contentWrapper.current && this.contentWrapper.current.contains(target)){
            isTouchOutside=false;
        }
        if(isTouchOutside){
            this.props.enableMapDrag();
            this._removeWindowListen();
        }
    }

    _onMouseEnter=()=>{
        this.props.disableMapDrag();

    }
    _onMouseLeave=()=>{
        this.props.enableMapDrag();

    }

    render() {

        let extraProps:React.HTMLProps<HTMLDivElement> = {};
        if(!BrowserUtil.isTouchDevice){
            extraProps.onMouseEnter=this._onMouseEnter;
            extraProps.onMouseLeave=this._onMouseLeave;
        }

        return (
            <div ref={this.contentWrapper} style={{width:this.props.width+"px"}} className="markerInfoBox" onClick={this.props.onClick} {...extraProps}>
                {this.props.children}
            </div>
        );
    }
}
