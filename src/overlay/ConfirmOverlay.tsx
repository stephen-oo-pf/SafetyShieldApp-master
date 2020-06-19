import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { showOverlay, hideOverlay } from './OverlayController';
import './ConfirmOverlay.scss';

import UIButton from '../ui/UIButton';


export default class ConfirmOverlay extends React.Component<BaseOverlayProps> {

    static ID:string = "confirm";

    static show($name:string, $confirmAction:()=>void, $confirmMsg:string="", $confirmTitle:string="Confirm", $confirmYes:string="Confirm", $confirmNo:string="Cancel", $confirmYesIcon?:object){
        showOverlay($name, ConfirmOverlay.ID,{confirmAction:$confirmAction, confirmMsg:$confirmMsg, confirmTitle:$confirmTitle, confirmYes:$confirmYes, confirmNo:$confirmNo, confirmYesIcon:$confirmYesIcon});
    }
    static hide($name:string){        
        hideOverlay($name, ConfirmOverlay.ID,{});
    }

    _onBGClick=()=>{
        this._onNo();
    }
    _onNo=()=>{
        ConfirmOverlay.hide(this.props.data.name);
    }
    _onYes=()=>{
        ConfirmOverlay.hide(this.props.data.name);
        this.props.data.details.confirmAction();        
    }


    render() {

        let strYes:string = "Confirm";
        if(this.props.data.details.confirmYes){
            strYes = this.props.data.details.confirmYes;
        }
        let strNo:string = "Cancel";
        if(this.props.data.details.confirmNo){
            strNo = this.props.data.details.confirmNo;
        }

        let strTitle:string = "Confirm";
        if(this.props.data.details.confirmTitle){
            strTitle = this.props.data.details.confirmTitle;
        }

        let extraYesProps:any = {};
        if(this.props.data.details.confirmYesIcon){
            extraYesProps.icon = this.props.data.details.confirmYesIcon;
        }

        let footerContent = (<>
            <UIButton extraClassName="btnNo" size={UIButton.SIZE_SMALL} onClick={this._onNo} color={UIButton.COLOR_TRANSPARENT_PURPLE} label={strNo}/>
            <UIButton extraClassName="btnYes" size={UIButton.SIZE_SMALL} onClick={this._onYes} label={strYes} {...extraYesProps}/>
        </>);

        return (
            <Overlay 
                state={this.props.data.state} 
                id={ConfirmOverlay.ID} 
                zIndex={510} 
                headerTitle={strTitle} 
                onBGClick={this._onBGClick} 
                footerContent={footerContent} 
                smallMaxWidth
            >
                <p>{this.props.data.details.confirmMsg}</p>
            </Overlay>
        );
    }
}
