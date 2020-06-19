import * as React from 'react';
import UIMapMarkerInfoBox from '../../../../ui/map/UIMapMarkerInfoBox';
import UIScrollContainer from '../../../../ui/UIScrollContainer';
import UIIncidentFrame from '../../../../ui/UIIncidentFrame';
import MapIncidentData from '../../../../data/MapIncidentData';
import { ALERT_TYPE_ACTIVE_INCIDENT, IAlert_ACTIVE_INCIDENT } from '../../../../data/AlertData';
import { UIActiveIncidentBadge, UIIncidentReportedBadge, UIDrillBadge } from '../../../../ui/UIBadge';
import UIButton from '../../../../ui/UIButton';
import { IIncidentReportData, ALERT_ALT_TYPE_INCIDENT_REPORT_DATA, INCIDENT_STATUS_TYPE_CLOSED, ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA } from '../../../../data/IncidentData';

import { createIncidentInfo_ReportedBy, createIncidentInfo_Comments, IIncidentInfo, createIncidentInfo_TriggeredBy } from '../../../../ui/UIIncidentInfo';

import alarmLight from '@iconify/icons-mdi/alarm-light';
import trendingUp from '@iconify/icons-mdi/trending-up';
import { dispatch } from '../../../../dispatcher/Dispatcher';
import AppEvent from '../../../../event/AppEvent';
import TriggerIncidentOverlay from '../../../../overlay/TriggerIncidentOverlay';
import User from '../../../../data/User';

import './EventMapInfoBox.scss';
import ConfirmOverlay from '../../../../overlay/ConfirmOverlay';
import PromptOverlay from '../../../../overlay/PromptOverlay';
import LoadingOverlay from '../../../../overlay/LoadingOverlay';
import Api from '../../../../api/Api';
import AlertOverlay from '../../../../overlay/AlertOverlay';


export interface IEventMapInfoBoxProps {
    data:MapIncidentData;
    onClickClose:()=>void;
    disableMapDrag:()=>void;
    enableMapDrag:()=>void;
}

export default class EventMapInfoBox extends React.Component<IEventMapInfoBoxProps> {

    infoBox:React.RefObject<UIMapMarkerInfoBox> = React.createRef();

    _onViewRealTime=()=>{

        let rawData;
        if(this.props.data.dataActiveIncident){
            rawData = this.props.data.dataActiveIncident;
        }
        if(this.props.data.dataIncidentReport){
            rawData = this.props.data.dataIncidentReport;
        }

        dispatch(new AppEvent(AppEvent.VIEW_REAL_TIME_INCIDENT,{data:this.props.data}));
    }

    _onClickTrigger=()=>{

        let data:IIncidentReportData = this.props.data.data as IIncidentReportData;

        TriggerIncidentOverlay.show("triggerIncidentReport", data);
    }

    _onCloseEvent=()=>{
        
        let activeIncident = this.props.data.dataActiveIncident as IAlert_ACTIVE_INCIDENT;
        let incidentType = this.props.data.incidentType;


        let extraBitAboutDrill:string = "";

        if(activeIncident.isDrill){
            extraBitAboutDrill = " drill";
        }

        ConfirmOverlay.show("confirmCloseEvent",()=>{
            PromptOverlay.show("promptCloseReason",($reason:string)=>{
                let hideLoading = LoadingOverlay.show("loadCloseEvent","Removing from Event Map","Closing Event...");

                Api.incidentManager.updateIncidentStatus(activeIncident.orgId,activeIncident.incidentId!,INCIDENT_STATUS_TYPE_CLOSED,($success,$results)=>{
                    hideLoading();
                    if($success){

                    }else{
                        AlertOverlay.show("errorClose","Error Closing");
                    }
                },$reason);
            },"Add a comment","Reason for Closing","Continue","Cancel","Enter a Reason");
        },"Are you sure the active "+incidentType.incidentType+extraBitAboutDrill+" event for "+activeIncident.orgName+" should be closed?","Confirm Close Event","Continue","Cancel");
    

    }

    _onDismissReport=()=>{


        let incidentReport = this.props.data.dataIncidentReport as IIncidentReportData;

        let incidentType = this.props.data.incidentType;


        ConfirmOverlay.show("confirmDismissReport",()=>{
            PromptOverlay.show("promptDismissReason",($reason:string)=>{
                let hideLoading = LoadingOverlay.show("loadDismissReport","Removing from Event Map","Dismissing Report...")
                Api.incidentManager.dismissIncidentReport(incidentReport.orgId,incidentReport.incidentReportId,($success,$results)=>{
                    hideLoading();
                    if($success){

                    }else{
                        AlertOverlay.show("errorDismiss","Error Dismissing");
                    }
                },$reason);
            },"Add a comment","Reason for Dismissing","Continue","Cancel","Enter a Reason");
        },"Are you sure the reported "+incidentType.incidentType+" event for "+incidentReport.orgName+" should be dismissed?","Confirm Dismiss Report","Continue","Cancel");
    }
    _onViewActiveEvent=()=>{
        
        
        if(this.props.data.parentMapReport){
            this.props.data.parentMapReport.toggleSelected();
        }


    }


    render() {

        let numW:number = 700;
        let incidentFrameTitle:string = "";
        let incidentFrameSubtitle:string = "";

        let incidentInfo:IIncidentInfo[] = [];
        

        let jsxHeaderRightContent:JSX.Element = <></>;
        let jsxContent:JSX.Element = <></>;
        
        

        switch(this.props.data.alertType){
            case ALERT_TYPE_ACTIVE_INCIDENT:
                let activeIncident = this.props.data.dataActiveIncident as IAlert_ACTIVE_INCIDENT;


                let activeIncidentDate = new Date(Number(activeIncident.datetime!)*1000);


                incidentFrameTitle = activeIncident.title;
                jsxHeaderRightContent = (
                    <>
                        <div className="badges">
                            <UIActiveIncidentBadge/>
                            {activeIncident.isDrill && (
                                <UIDrillBadge/>
                            )}
                        </div>
                        <div className="duration">{this.props.data.getElapsedTime(false)}</div>
                    </>
                );

                let name:string = activeIncident.triggeredByName;
                if(activeIncident.triggeredByUserId===User.state.userInfo?.userId){
                    name+=" (me)";
                }

                

                incidentInfo.push(createIncidentInfo_TriggeredBy(name, activeIncidentDate,activeIncident.triggeredByOpsRole));

                if(activeIncident.description){
                    incidentInfo.push(createIncidentInfo_Comments(activeIncident.description));
                }
                if(activeIncident.numReports){
                    incidentFrameSubtitle = activeIncident.numReports+" Report"+(activeIncident.numReports===1?"":"s");

                }
                
                jsxContent = (
                    <div className="eventMarkerInfoBoxFooter">
                        <UIButton size={UIButton.SIZE_SMALL} icon={trendingUp} iconOnLeft label="View Real-Time Reporting" color={UIButton.COLOR_TRANSPARENT_PURPLE} onClick={this._onViewRealTime}/>
                        <UIButton size={UIButton.SIZE_SMALL} label="Close Event" onClick={this._onCloseEvent} />
                    </div>
                );
                

            break;
                case ALERT_ALT_TYPE_INCIDENT_REPORT_DATA:
                case ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA:
                let incidentReport = this.props.data.dataIncidentReport as IIncidentReportData;

                let reportDate:Date = new Date(Number(incidentReport.createDts)*1000);
                
                
                let reportName:string = incidentReport.createUserName;
                if(incidentReport.createUserId===User.state.userInfo?.userId){
                    reportName+=" (me)";
                }
                
                incidentInfo.push(createIncidentInfo_ReportedBy(reportName,reportDate,incidentReport.opsRole));


                if(incidentReport.comments){
                    incidentInfo.push(createIncidentInfo_Comments(incidentReport.comments));
                }
                

                jsxHeaderRightContent = (
                    <>
                        <UIIncidentReportedBadge/>
                        <div className="duration">{this.props.data.getElapsedTime(false)}</div>
                    </>
                );

                if(this.props.data.alertType===ALERT_ALT_TYPE_INCIDENT_REPORT_DATA){

                    jsxContent = (
                        <div className="eventMarkerInfoBoxFooter">
                            <UIButton size={UIButton.SIZE_SMALL} label="Dismiss Report" color={UIButton.COLOR_TRANSPARENT_PURPLE} onClick={this._onDismissReport}/>
                            <UIButton size={UIButton.SIZE_SMALL} label="Trigger Event" color={UIButton.COLOR_RED} iconOnLeft icon={alarmLight} onClick={this._onClickTrigger}/>
                        </div>
                    );
                }else{
                    jsxContent = (
                        <div className="eventMarkerInfoBoxFooter">
                            <UIButton size={UIButton.SIZE_SMALL} label="View the Active Event" color={UIButton.COLOR_TRANSPARENT_PURPLE} onClick={this._onViewActiveEvent}/>
                        </div>
                    );
                }
                
            break;
        }


        let yOffset:number = -this.props.data.mapIcon.size!.height;

        let position = this.props.data.mapPosition;
        
        if(this.props.data.clusterPosition){
            yOffset = -18;
            position = this.props.data.clusterPosition;
        }
        

        return (        
            <UIMapMarkerInfoBox 
                ref={this.infoBox}
                position={position}
                disableMapDrag={this.props.disableMapDrag}
                enableMapDrag={this.props.enableMapDrag}
                width={numW}
                yOffset={yOffset}
                onClickClose={this.props.onClickClose}
                extraClassName="eventMarkerInfoBox">
                    <UIScrollContainer>
                        <UIIncidentFrame
                            orgName={this.props.data.orgName}
                            incidentType={this.props.data.incidentType}
                            incidentInfo={incidentInfo}
                            headerRightContent={jsxHeaderRightContent}
                            title={incidentFrameTitle}
                            subtitle={incidentFrameSubtitle}
                        >
                            {jsxContent}
                        </UIIncidentFrame>
                    </UIScrollContainer>
            </UIMapMarkerInfoBox>
        );
    }
    
}
