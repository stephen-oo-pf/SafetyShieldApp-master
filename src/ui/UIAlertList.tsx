import * as React from 'react';
import { IAlertEventData, ALERT_TYPE_ACTIVE_INCIDENT, ALERT_TYPE_INCIDENT_NOTIFICATION, ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION, IAlert_INCIDENT, IAlertIncidentData, IAlert_INCIDENT_NOTIFICATION, IAlert_INCIDENT_REPORT_NOTIFICATION, ALERT_TYPE_PENDING_INCIDENT_REPORTS, ALERT_TYPE_SCHEDULED_DRILL, IAlert_SCHEDULED_DRILL, ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE, IAlert_ACTIVE_INCIDENT } from '../data/AlertData';
import UIIncidentTypeIcon from './UIIncidentTypeIcon';
import { getIncidentTypeById, ALERT_ALT_TYPE_INCIDENT_REPORT_DATA, IIncidentReportData, INCIDENT_STATUS_TYPE_CLOSED, IPerOrgPerTypeIncidentReportGroup } from '../data/IncidentData';
import './UIAlertList.scss';
import FormatUtil from '../util/FormatUtil';
import UIScrollContainer from './UIScrollContainer';


import User from '../data/User';
import UIButton from './UIButton';

import chevronRight from '@iconify/icons-mdi/chevron-right';
import { dispatch } from '../dispatcher/Dispatcher';
import AppEvent from '../event/AppEvent';
import UINoData from './UINoData';

import { UIDrillBadge } from './UIBadge';
export interface IUIAlertListProps {
    type:string;
    data:IAlertEventData[];
    smaller?:boolean;
    hideOrgAndIncident?:boolean;
}


export default class UIAlertList extends React.Component<IUIAlertListProps> {
    render() {
        let strCN:string = "alertList";

        let strNoData:string = "No Data Available";
        switch(this.props.type){
            case ALERT_ALT_TYPE_INCIDENT_REPORT_DATA:
            case ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE:
            case ALERT_TYPE_PENDING_INCIDENT_REPORTS:
                strNoData = "No Reports Available";
            break;
            case ALERT_TYPE_ACTIVE_INCIDENT:
                strNoData = "No Events Available";
            break;
        }

        return (
            <UIScrollContainer extraClassName={strCN}>
                {this.props.data.length>0 && (
                    <div className="alertListInside">
                        {this.props.data.map(($alert,$index)=>{
                            return (
                                <UIAlertListItem 
                                    key={this.props.type+(this.props.smaller?"smaller":"")+$alert.orgId+$index} 
                                    smaller={this.props.smaller} 
                                    data={$alert} 
                                    hideOrgAndIncident={this.props.hideOrgAndIncident}
                                    type={this.props.type}/>
                            )
                        })}
                    </div>
                )}
                
                {this.props.data.length===0 && (
                    <UINoData customMsg={strNoData}/>
                )}
            </UIScrollContainer>
        );
    }
}


interface IUIAlertListItemProps {
    type:string;
    data:IAlertEventData;
    
    hideOrgAndIncident?:boolean;
    smaller?:boolean;
}
class UIAlertListItem extends React.Component<IUIAlertListItemProps> {

    _onOrgClick=()=>{
        
        User.setSelectedOrganizationById(this.props.data.orgId);

    }
    _onBtnClick=()=>{
        switch(this.props.type){
            case ALERT_TYPE_SCHEDULED_DRILL:
                this._startDrill();
            break;
            default:
                this._viewMapIncident();
        }
    }
    _startDrill=()=>{
        dispatch(new AppEvent(AppEvent.START_DRILL, {data:this.props.data, type:this.props.type}));
    }
    _viewMapIncident=()=>{
        dispatch(new AppEvent(AppEvent.VIEW_MAP_INCIDENT, {data:this.props.data, type:this.props.type}));
    }
    
    render() {

        let strCN:string = "alertListItem";

        let incidentType = getIncidentTypeById(this.props.data.incidentTypeId);

        if(this.props.smaller){
            strCN+=" smaller";
        }
        if(this.props.hideOrgAndIncident){
            strCN+=" hideOrgAndIncident";
        }

        let color:string = "";

        let lbl:string = "";
        let desc:string = "";
        let desc2;
        let bigDesc:string = "";

        let jsxExtraContent:JSX.Element = <></>;

        let datetime:number=0;


        let comments;
        let hasBtn:boolean=false;
        let itemIsTheBtn:boolean=false;
        let lblBtn:string = "";

        let isDrill:boolean=false;
        
        let orgOfIncident = User.state.userOrgsFlat.find(($org)=>{
            return $org.orgId===this.props.data.orgId;
        });

        let showOrgName:boolean=true;
        let showIncidentIcon:boolean=true;
        let showElapsedTime:boolean=true;

        if(this.props.type===ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE){

            let perOrgIncidentType = this.props.data as IPerOrgPerTypeIncidentReportGroup;
            color = "yellow";

            lbl = incidentType!.incidentType;
            desc = perOrgIncidentType.reports.length+" REPORTS"; 
            datetime = perOrgIncidentType.datetime;
            
            itemIsTheBtn=true;
            

        }else if(this.props.type===ALERT_ALT_TYPE_INCIDENT_REPORT_DATA){
            let incidentReport = this.props.data as IIncidentReportData;;
            color = "grey";
            showIncidentIcon=false;
            showOrgName=false;
            datetime = incidentReport.createDts;
            if(incidentReport.updateDts){
                datetime = incidentReport.updateDts;
            }
            comments = incidentReport.description;
            desc = "REPORTED BY:";
            desc2 = incidentReport.createUserName;
            if(incidentReport.createUserId===User.state.userInfo?.userId){
                desc2+=" (me)";
            }

        }else{

            let incidentAlert = this.props.data as IAlertIncidentData;

            if(incidentAlert.datetime){
                datetime = incidentAlert.datetime;
            }

            switch(this.props.type){

                case ALERT_TYPE_INCIDENT_NOTIFICATION:
                case ALERT_TYPE_ACTIVE_INCIDENT:
                    color = "red";
                    let activeIncident = this.props.data as IAlert_INCIDENT;
                    lbl = activeIncident.title;
                    desc = "TRIGGERED BY:";
                    desc2 = activeIncident.triggeredByName;
                    comments = activeIncident.description;
                    lblBtn = "Review";

                    isDrill = activeIncident.isDrill;

                    if(this.props.smaller){
                        comments = undefined;
                        desc2=undefined;

                        if(this.props.type===ALERT_TYPE_ACTIVE_INCIDENT){
                            let activeIncidentAlert = this.props.data as IAlert_ACTIVE_INCIDENT;
                            let numReports:number=0;
                            if(activeIncidentAlert.numReports){
                                numReports = activeIncidentAlert.numReports;
                            }                            
                            desc = numReports+" REPORT"+(numReports===1?"":"S");
                        }

                        
                        
                        itemIsTheBtn=true;
                    }else{
                        if(orgOfIncident && orgOfIncident.hasIncidentControl){
                            hasBtn=true;
                        }
                    }


                    if(this.props.type===ALERT_TYPE_INCIDENT_NOTIFICATION){                        
                        let incidentNotification = this.props.data as IAlert_INCIDENT_NOTIFICATION;
                        if(incidentNotification.statusChangeDescription){
                            comments = incidentNotification.statusChangeDescription;
                        }

                        switch(incidentNotification.incidentStatusId){
                            case INCIDENT_STATUS_TYPE_CLOSED:
                                color = "green";
                                desc = "CLOSED BY:";
                                hasBtn=false;
                                if(incidentNotification.statusChangeName){
                                    desc2 = incidentNotification.statusChangeName;
                                }
                            break;
                        }
                    }
                break;
                case ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION:
                    let incidentReportNotification = this.props.data as IAlert_INCIDENT_REPORT_NOTIFICATION;
                    color = "yellow";
                    lbl = incidentType!.incidentType;
                    desc = "REPORTED BY:";
                    desc2 = incidentReportNotification.reportedByName;
                    hasBtn=true;
                    lblBtn = "Review";
                break;
                case ALERT_TYPE_SCHEDULED_DRILL:
                    let drill = this.props.data as IAlert_SCHEDULED_DRILL;
                    color = "blue";
                    lbl = incidentType!.incidentType;
                    hasBtn=true;
                    lblBtn = "Start";
                    let drillDate:Date = new Date(Number(drill.datetime)*1000);
                    
                    showElapsedTime=false;
                    bigDesc = "Scheduled for "+FormatUtil.dateHMS(drillDate,true,false,true);
                break;
            }
        }
        
        let elapsedTimeSecs:number = Math.round(((Date.now()/1000)-datetime));


        strCN+=" "+color;

        let itemExtraProps:any = {};
        if(itemIsTheBtn){
            itemExtraProps.onClick=this._onBtnClick;
        }
        

        return (
            <div className={strCN} {...itemExtraProps}>
                <div className="alertListItemHeader">
                    {showOrgName && (
                        <div className="alertListItemOrg" onClick={this._onOrgClick}>{this.props.data.orgName}</div>
                    )}
                    {showElapsedTime && (
                        <div className="alertListItemTime">{FormatUtil.timerHMSForReading(elapsedTimeSecs,false,true)} ago</div>
                    )}
                </div>
                <div className="alertListItemInfo">
                    {showIncidentIcon && incidentType && (
                        <UIIncidentTypeIcon type={incidentType}/>
                    )}
                    {isDrill && (
                        <UIDrillBadge/>
                    )}
                    <div className="alertListItemInfoDetails">
                        {lbl && lbl!=="" &&  (
                            <div className="alertListItemLabel">
                                {lbl}
                            </div>
                        )}
                        <div className="alertListItemDesc">
                            {desc}
                            {desc2 && (
                                <span>{desc2}</span>
                            )}
                            {bigDesc && (
                                <div className="bigDesc">{bigDesc}</div>
                            )}
                        </div>
                        {comments && this.props.hideOrgAndIncident &&(                            
                            <div className="alertListItemComments">
                                COMMENTS:
                                {comments && (
                                    <span>{comments}</span>
                                )}
                            </div>
                        )}
                    </div>
                    {hasBtn && (
                        <UIButton onClick={this._onBtnClick} label={lblBtn} icon={chevronRight} size={UIButton.SIZE_SMALL}/>
                    )}
                </div>
                {comments && !this.props.hideOrgAndIncident &&  (
                    <div className="alertListItemFooter">
                        {comments}                
                    </div>
                )}

            </div>
        );
    }
}

