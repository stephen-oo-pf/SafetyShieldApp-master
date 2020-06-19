import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { showOverlay, hideOverlay } from './OverlayController';
import './IncidentTypeOverlay.scss';

import UIButton from '../ui/UIButton';
import UIIncidentTypePicker from '../ui/UIIncidentTypePicker';


interface IIncidentTypeOverlayState{
    incidentTypeId:string;
}

export default class IncidentTypeOverlay extends React.Component<BaseOverlayProps,IIncidentTypeOverlayState> {

    static ID:string = "incidentTypeOverlay";

    static show($name:string, $confirmAction:($incidentTypeId:string)=>void, $incidentTypeId:string=""){
        showOverlay($name, IncidentTypeOverlay.ID,{confirmAction:$confirmAction, incidentTypeId:$incidentTypeId});
    }
    static hide($name:string){        
        hideOverlay($name, IncidentTypeOverlay.ID,{});
    }

    constructor($props:BaseOverlayProps){
        super($props);


        let incidentTypeId:string = "";
        if(this.props.data.details.incidentTypeId){
            incidentTypeId = this.props.data.details.incidentTypeId;
        }

        this.state = {
            incidentTypeId:incidentTypeId
        }
    }

    _onBGClick=()=>{
        this._hide();
    }
    _hide=()=>{
        IncidentTypeOverlay.hide(this.props.data.name);
    }
    _onYes=()=>{
        this._hide();
        this.props.data.details.confirmAction(this.state.incidentTypeId);        
    }
    _onNo=()=>{
        this._hide();
    }

    _onIncidentTypeChanged=($incidentTypeId:string)=>{
        this.setState({incidentTypeId:$incidentTypeId});
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

        let strTitle:string = "Select an Event Type";

        let footerContent = (<>
            <UIButton extraClassName="btnNo" size={UIButton.SIZE_SMALL} onClick={this._onNo} color={UIButton.COLOR_TRANSPARENT_PURPLE} label={strNo}/>
            <UIButton extraClassName="btnYes" size={UIButton.SIZE_SMALL} onClick={this._onYes} label="Continue"/>
        </>);

        return (
            <Overlay 
                state={this.props.data.state} 
                id={IncidentTypeOverlay.ID} 
                zIndex={510} 
                headerTitle={strTitle} 
                onBGClick={this._onBGClick} 
                footerContent={footerContent} 
                smallHeader
                mediumMaxWidth
            >
                <UIIncidentTypePicker
                    selectedIncidentTypeId={this.state.incidentTypeId}
                    onChange={this._onIncidentTypeChanged}
                />
            </Overlay>
        );
    }
}
