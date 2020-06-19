import * as React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { showOverlay, hideOverlay } from './OverlayController';

import { IGetIncidentResponse, IIncidentData, IIncidentChecklist, generateTimelineFromIncident } from '../data/IncidentData';

import './RealTimeIncidentOverlay.scss';
import FormatUtil from '../util/FormatUtil';
import UIAlertList from '../ui/UIAlertList';
import User from '../data/User';

import trendingUp from '@iconify/icons-mdi/trending-up';

import { createIncidentInfo_Status,createIncidentInfo_Comments, IIncidentInfo, createIncidentInfo_TriggeredBy } from '../ui/UIIncidentInfo';

import UIIncidentFrame from '../ui/UIIncidentFrame';
import MapIncidentData from '../data/MapIncidentData';
import { UIActiveIncidentBadge, UIDrillBadge } from '../ui/UIBadge';
import UIIncidentTabSections from '../ui/UIIncidentTabSections';
import { ITimelineItem } from '../ui/UITimeline';

interface IRealTimmeIncidentOverlayState{
    timeline:ITimelineItem[];
}

export default class RealTimeIncidentOverlay extends React.Component<BaseOverlayProps,IRealTimmeIncidentOverlayState> {
    static ID:string = "realtimeIncidentOverlay";
    static ICON:object = trendingUp;


    static show($name:string, $mapIncident:MapIncidentData, $incidentResponse:IGetIncidentResponse){
        User.setCanCheckForAlerts(false);
        showOverlay($name, RealTimeIncidentOverlay.ID, {mapIncident:$mapIncident, incidentResponse:$incidentResponse});
    }
    static hide($name:string){        
        hideOverlay($name, RealTimeIncidentOverlay.ID,{});
    }
    

    constructor($props:BaseOverlayProps){
        super($props);


        let timeline = generateTimelineFromIncident(this.props.data.details.incidentResponse);

        this.state = {
            timeline:timeline,
        }
    }

    _onClose=()=>{
        this._hide();
    }
    _onClickOrg=()=>{
        //let alertData:IAlertEventData = this.props.data.details.alertData;
        //User.setSelectedOrganizationById(alertData.orgId);
    }
    
    _hide=()=>{
      
        if(!User.state.canCheckForAlerts){
            User.setCanCheckForAlerts(true);
        }

        RealTimeIncidentOverlay.hide(this.props.data.name);
    }
    render() {     
        
        /*
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
            case ALERT_TYPE_ACTIVE_INCIDENT:

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

        }
        */

        let mapIncident:MapIncidentData = this.props.data.details.mapIncident;

        let incidentResponse:IGetIncidentResponse = this.props.data.details.incidentResponse;

        let {incident, checklists, statusChanges, reports} = incidentResponse;
        
        let incidentInfo:IIncidentInfo[] = [
            createIncidentInfo_TriggeredBy(incident.createUserName,mapIncident.date,incident.createOpsRole)
        ];

        
        if(incident.description){
            incidentInfo.push(createIncidentInfo_Comments(incident.description));
        }

        let isDrill:boolean=false;
        if(incident.isDrill){
            isDrill=true;
        }

        let jsxHeaderRightContent = (
            <>
                <div className="badges">
                    <UIActiveIncidentBadge/>
                    {isDrill && (
                        <UIDrillBadge/>
                    )}
                </div>
                <div className="duration">{mapIncident.getElapsedTime()}</div>
            </>
        );



        return (
            <Overlay 
                state={this.props.data.state} 
                id={RealTimeIncidentOverlay.ID} 
                zIndex={300}
                smallHeader
                biggerMaxWidth
                headerClose={this._onClose} 
                headerTitle={"Real-Time Event Reporting"}
                headerIcon={RealTimeIncidentOverlay.ICON}
                
            >
                <UIIncidentFrame
                    orgName={mapIncident.orgName}
                    incidentInfo={incidentInfo}
                    incidentType={mapIncident.incidentType}
                    title={incident.title}
                    headerRightContent={jsxHeaderRightContent}
                >
                    <UIIncidentTabSections
                        orgId={mapIncident.orgId}
                        incidentResponse={incidentResponse}
                        incidentTimelineData={this.state.timeline}
                    />

                </UIIncidentFrame>
            </Overlay>
        );
    }
}
