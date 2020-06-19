import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { hideOverlay, showOverlay } from './OverlayController';
import UIButton from '../ui/UIButton';
import './TriggerIncidentOverlay.scss';
import { IIncidentReportData, getIncidentTypeById } from '../data/IncidentData';
import UIEditFields from '../ui/UIEditFields';
import UIInput from '../ui/UIInput';
import UIIncidentTypeIcon from '../ui/UIIncidentTypeIcon';

import chevronRight from '@iconify/icons-mdi/chevron-right';

import pencilIcon from '@iconify/icons-mdi/pencil';
import IncidentTypeOverlay from './IncidentTypeOverlay';
import LoadingOverlay from './LoadingOverlay';
import Api from '../api/Api';
import User from '../data/User';


interface ITriggerIncidentOverlayState{
    validationError?:string;
    title:string;
    comments:string;
    incidentTypeId:string;
}


export default class TriggerIncidentOverlay extends React.Component<BaseOverlayProps,ITriggerIncidentOverlayState> {

    static ID:string = "triggerIncident";

    static show($name:string, $incidentReport:IIncidentReportData){
        User.setCanCheckForAlerts(false);
        showOverlay($name, TriggerIncidentOverlay.ID,{data:$incidentReport});
    }
    static hide($name:string){        
        hideOverlay($name, TriggerIncidentOverlay.ID,{});
    }


    constructor($props:BaseOverlayProps){
        super($props);
        this.state = {
            title:"",
            comments:"",
            incidentTypeId:this.props.data.details.data.incidentTypeId
        }
    }

    _hide=()=>{
        if(!User.state.canCheckForAlerts){
            User.setCanCheckForAlerts(true);
        }
        TriggerIncidentOverlay.hide(this.props.data.name);
    }

    _onBGClick=()=>{
        this._hide();
    }

    
    _sending:boolean=false;
    _onInputChange=($value:string, $name?:string)=>{
        let obj:any = {};

        if($name){
            obj[$name] = $value;
            this.setState(obj);
        }

    }

    _onClickIncident=()=>{
        IncidentTypeOverlay.show("pickIncidentTypeForTrigger",($incidentTypeId:string)=>{
            this.setState({incidentTypeId:$incidentTypeId});
        },this.state.incidentTypeId);
    }
    _onErrorClose=()=>{
        this.setState({validationError:undefined});
    }

    _onCancel=()=>{
        this._hide();
    }
    _onHeaderClose=()=>{
        this._hide();
    }
    _onSubmit=()=>{
        
        if(this.state.title===""){
            this.setState({validationError:"You must enter a Title."});
            return;
        }

        if(this.state.comments===""){
            this.setState({validationError:"You must enter a comment."});
            return;
        }

        
        let incidentReport:IIncidentReportData =  this.props.data.details.data as IIncidentReportData;
                        
        Api.incidentManager.FULLFLOW_ReportIncident({
            loadingTitle:"Triggering Event...",
            title:this.state.title,
            desc:this.state.comments,
            incidentIdType:this.state.incidentTypeId,
            orgId:incidentReport.orgId,
            autoTrigger:true,
        },($success,$results)=>{
            if($success){
                this._hide();
            }
        });                    

    }

    render() {


        let footerContent = (<>
            <UIButton extraClassName="btnNo" size={UIButton.SIZE_SMALL} onClick={this._onCancel} color={UIButton.COLOR_TRANSPARENT_PURPLE} label="Cancel"/>
            <UIButton extraClassName="btnOk" size={UIButton.SIZE_SMALL} onClick={this._onSubmit} label="Confirm and Send" icon={chevronRight}/>
        </>);

        let incidentReport:IIncidentReportData =  this.props.data.details.data as IIncidentReportData;


        let incidentType = getIncidentTypeById(this.state.incidentTypeId);

        return (
            <Overlay 
                state={this.props.data.state} 
                id={TriggerIncidentOverlay.ID} 
                zIndex={452} 
                headerTitle="Triggering Event For"
                onBGClick={this._onBGClick} 
                footerContent={footerContent} 
                headerClose={this._onHeaderClose}
                mediumMaxWidth

                smallHeader
            >
                <div className="triggerContainer">
                    <div className="orgName">{incidentReport.orgName}</div>
                    {incidentType && (
                        <UIIncidentTypeIcon smallerAndBlack type={incidentType} onClick={this._onClickIncident}>
                            <div className="label">
                                {incidentType.incidentType}
                                <UIButton label="Change" size={UIButton.SIZE_TINY} icon={pencilIcon} color={UIButton.COLOR_TRANSPARENT_PURPLE}/>
                            </div>
                        </UIIncidentTypeIcon> 
                    )}
                    <UIEditFields extraClassName="" validationError={this.state.validationError} onValidationErrorClose={this._onErrorClose}>                        
                        <UIInput fieldItem fullWidth title="Event Title" showTitleAsLabel showTitleAsLabel_Placeholder="Add Title" isRequired name="title" value={this.state.title} onChange={this._onInputChange} />
                        <UIInput fieldItem fullWidth title="Comments" type="textarea" showTitleAsLabel showTitleAsLabel_Placeholder="Add Comments" isRequired name="comments" value={this.state.comments} onChange={this._onInputChange} />
                    </UIEditFields>
                </div>
            </Overlay>
        );
    }
}
