import * as React from 'react';
import UIWhiteBox from './UIWhiteBox';
import UIButton from './UIButton';
import closeIcon from '@iconify/icons-mdi/close';
import './UIPopup.scss';


export interface IUIPopupProps {
    showing:boolean;
    onClose:()=>void;
    extraClassName?:string;
    closeBtn?:boolean;
    anchor?:string;
}

export default class UIPopup extends React.Component<IUIPopupProps> {

    static ANCHOR_BOTTOM_CENTER:string = "bottomCenter";
    

    whiteBox:React.RefObject<UIWhiteBox> = React.createRef();
    
    _listening:boolean=false;

    constructor($props:IUIPopupProps){
        super($props);

    }
    componentDidMount(){
        if(this.props.showing){
            this._addListener();
        }
    }
    componentDidUpdate($prevProps:IUIPopupProps){
        if(this.props.showing!=$prevProps.showing){

            if(this.props.showing){
                this._addListener();
            }else{
                this._removeListener();
            }
        }
    }

    componentWillUnmount(){
        this._removeListener();
    }

    _addListener=()=>{
        if(!this._listening){
            this._listening=true;
            document.addEventListener("click", this._onDocClick);
        }
    }
    _removeListener=()=>{
        if(this._listening){
            this._listening=false;
            document.removeEventListener("click", this._onDocClick);
        }
    }

    _onDocClick=($event:MouseEvent)=>{
        if(this.whiteBox.current?.container.current){
            
            let shouldClose:boolean=true;
            let target:any = $event.target;
            if(this.whiteBox.current.container.current.contains(target)){
                shouldClose=false;
            }
            if(shouldClose){
                this._close();
            }
        }
    }
    _close=()=>{
        this._removeListener();
        this.props.onClose();
    }

    render() {
        let strCN:string = "popup";

        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }

        let anchor:string = UIPopup.ANCHOR_BOTTOM_CENTER;
        if(this.props.anchor){
            anchor = this.props.anchor;
        }
        strCN+=" anchor_"+anchor;



        if(this.props.showing){
            strCN+=" showing";
        }
        

        return (
            <UIWhiteBox ref={this.whiteBox} extraClassName={strCN} noPadding>
                {this.props.closeBtn && (
                    <UIButton extraClassName="closeBtn" size={UIButton.SIZE_TINY} isSquare icon={closeIcon} onClick={this._close} color={UIButton.COLOR_TRANSPARENT}/>
                )}
                {this.props.children}
            </UIWhiteBox>
        );
    }
}
