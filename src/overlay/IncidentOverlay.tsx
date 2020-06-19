import * as React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import UIButton from '../ui/UIButton';
import { showOverlay, hideOverlay } from './OverlayController';

import { IAlertEventData, ALERT_TYPE_INCIDENT_NOTIFICATION, ALERT_TYPE_ACTIVE_INCIDENT, IAlert_INCIDENT, ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION, IAlert_INCIDENT_REPORT_NOTIFICATION, ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE } from '../data/AlertData';
import { IGetIncidentResponse, getIncidentTypeById, ALERT_ALT_TYPE_INCIDENT_REPORT_DATA, IIncidentReportData, IPerOrgPerTypeIncidentReportGroup } from '../data/IncidentData';

import './IncidentOverlay.scss';
import FormatUtil from '../util/FormatUtil';
import UIAlertList from '../ui/UIAlertList';
import User from '../data/User';

import { createIncidentInfo_Status, IIncidentInfo } from '../ui/UIIncidentInfo';

import UIIncidentFrame from '../ui/UIIncidentFrame';


export default class IncidentOverlay extends React.Component<BaseOverlayProps> {
    static ID:string = "incidentOverlay";


    static show($name:string, $type:string, $alertData:IAlertEventData, $incidentDetails?:any){
        showOverlay($name, IncidentOverlay.ID, {type:$type,alertData:$alertData,incidentDetails:$incidentDetails});
    }
    static hide($name:string){        
        hideOverlay($name, IncidentOverlay.ID,{});
    }
    

    _onClose=()=>{
        this._hide();
    }
    _onClickOrg=()=>{
        let alertData:IAlertEventData = this.props.data.details.alertData;
        User.setSelectedOrganizationById(alertData.orgId);
    }
    
    _hide=()=>{
      
        if(!User.state.canCheckForAlerts){
            User.setCanCheckForAlerts(true);
        }

        IncidentOverlay.hide(this.props.data.name);
    }
    render() {     
        
        let alertData:IAlertEventData = this.props.data.details.alertData;
        let type:string = this.props.data.details.type;

        let incidentType = getIncidentTypeById(alertData.incidentTypeId);

        let actionByTitle:string = "";
        let actionByValue:string = "";
        let actionByRole:string = "";

        let datetime:number=0;
        let lbl:string = incidentType!.incidentType;
        let status:string = "";

        let comments:string = "N/A";

        let isDrill:boolean=false;

        let jsxContentPerType:JSX.Element = <></>;

        let incidentInfo:IIncidentInfo[] = [];

        let showIncidentInfo:boolean=false;

        switch(type){
            case ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE:
                let perOrgIncidentType = alertData as IPerOrgPerTypeIncidentReportGroup;  
                datetime = Number(perOrgIncidentType.datetime);
                

                jsxContentPerType = (
                    <>
                        <div className="alertListTitle">Reports ({perOrgIncidentType.reports.length})</div>
                        <UIAlertList hideOrgAndIncident type={ALERT_ALT_TYPE_INCIDENT_REPORT_DATA} data={perOrgIncidentType.reports}/>
                    </>
                );

            break;    
            case ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION:
                let incidentReport = alertData as IAlert_INCIDENT_REPORT_NOTIFICATION;

                let pendingIncidentReport:IIncidentReportData =  this.props.data.details.incidentDetails;

                datetime = Number(incidentReport.datetime);
                actionByTitle = "REPORTED BY";
                actionByValue = incidentReport.reportedByName;

                if(pendingIncidentReport.createUserId===User.state.userInfo?.userId){
                    actionByValue+=" (me)"
                }
                status = pendingIncidentReport.incidentReportStatus;
                
                actionByRole = pendingIncidentReport.opsRole;

                if(incidentReport.description){
                    comments = incidentReport.description
                }
                showIncidentInfo=true;
            break;
            case ALERT_TYPE_ACTIVE_INCIDENT:
            case ALERT_TYPE_INCIDENT_NOTIFICATION:

                let getIncidentResponse:IGetIncidentResponse =  this.props.data.details.incidentDetails;

                let activeIncident = alertData as IAlert_INCIDENT;  
                lbl = activeIncident.title;  

                isDrill = activeIncident.isDrill;

                datetime = Number(activeIncident.datetime);

                actionByTitle = "TRIGGERED BY";
                actionByValue = activeIncident.triggeredByName;
                if(getIncidentResponse){
                    status = getIncidentResponse.incident.incidentStatus;
                    actionByRole = getIncidentResponse.incident.createOpsRole;

                    jsxContentPerType = (
                        <>
                            <div className="alertListTitle">Reports ({getIncidentResponse.reports.length})</div>
                            <UIAlertList hideOrgAndIncident type={ALERT_ALT_TYPE_INCIDENT_REPORT_DATA} data={getIncidentResponse.reports}/>
                        </>
                    );

                }
                if(activeIncident.description){
                    comments = activeIncident.description
                }
                showIncidentInfo=true;

            break;
        }

        let elapsedSeconds:number=0;
        elapsedSeconds = Math.round((Date.now()/1000)-Number(datetime));

        if(showIncidentInfo){

            incidentInfo = [
                createIncidentInfo_Status(status),
                {
                    extraClassName:"actionBy",
                    title:actionByTitle,
                    value:actionByValue,
                    valueSpan:actionByRole
                },
                {
                    extraClassName:"fullWidth",
                    title:"COMMENTS", 
                    value:comments
                }
            ];
        }
        return (
            <Overlay 
                state={this.props.data.state} 
                id={IncidentOverlay.ID} 
                zIndex={300} 
                smallHeader
                headerClose={this._onClose} 
                headerTitle={(
                    <>
                        <UIButton extraClassName="orgName" color={UIButton.COLOR_TRANSPARENT} label={alertData.orgName}  onClick={this._onClickOrg} />
                        <div className="time">{FormatUtil.timerHMSForReading(elapsedSeconds,false,true)} AGO</div>
                    </>
                )}
            >
                <UIIncidentFrame
                    incidentInfo={incidentInfo}
                    incidentType={incidentType!}
                    title={lbl}
                >
                    {jsxContentPerType}
                </UIIncidentFrame>
            </Overlay>
        );
    }
}
