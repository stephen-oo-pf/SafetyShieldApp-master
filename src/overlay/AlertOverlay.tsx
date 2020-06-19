import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { hideOverlay, showOverlay } from './OverlayController';
import UIButton from '../ui/UIButton';
import './AlertOverlay.scss';


export default class AlertOverlay extends React.Component<BaseOverlayProps> {

    static ID:string = "alert";

    static show($name:string, $alertMsg:string="", $okBtn:string="Ok"){
        showOverlay($name, AlertOverlay.ID,{alertMsg:$alertMsg, okBtn:$okBtn});
    }
    static hide($name:string){        
        hideOverlay($name, AlertOverlay.ID,{});
    }
    _onBGClick=()=>{
        this._onOK();
    }
    _onOK=()=>{
        AlertOverlay.hide(this.props.data.name);
    }
    render() {

        let strOk:string = this.props.data.details.okBtn;

        let footerContent = (<>
            <UIButton extraClassName="btnOk" size={UIButton.SIZE_SMALL} onClick={this._onOK} label={strOk}/>
        </>);

        return (
            <Overlay 
                state={this.props.data.state} 
                id={AlertOverlay.ID} 
                zIndex={520} 
                onBGClick={this._onBGClick} 
                footerContent={footerContent} 
                smallMaxWidth
            >
                <p>{this.props.data.details.alertMsg}</p>
            </Overlay>
        );
    }
}
