import * as React from 'react';
import { IAlertData, IAlert_ACTIVE_INCIDENT, IAlert_SCHEDULED_DRILL, ALERT_TYPE_ACTIVE_INCIDENT, ALERT_TYPE_SCHEDULED_DRILL } from '../../data/AlertData';
import UIButton from '../UIButton';
import User from '../../data/User';
import UIIncidentTypeIcon from '../UIIncidentTypeIcon';
import { getIncidentTypeById } from '../../data/IncidentData';
import FormatUtil from '../../util/FormatUtil';
import UIScrollContainer from '../UIScrollContainer';
import { Organization } from '../../data/Organization';
import AlertListOverlay from '../../overlay/AlertListOverlay';
import './UIAlertBanner.scss';
import { UIDrillBadge } from '../UIBadge';
import { dispatch } from '../../dispatcher/Dispatcher';
import AppEvent from '../../event/AppEvent';

export interface IUIAlertBannerProps {
    alertType:string;
    color:string;
    data:IAlertData[];
}

export default class UIAlertBanner extends React.Component<IUIAlertBannerProps> {

    _setSelectedOrg=($orgId:string)=>{
        User.setSelectedOrganizationById($orgId);
    }

    _alertSelected=($alert:IAlertData)=>{
        switch(this.props.alertType){
            case ALERT_TYPE_ACTIVE_INCIDENT:

                
                dispatch(new AppEvent(AppEvent.VIEW_MAP_INCIDENT, {data:$alert, type:this.props.alertType}));

                //User.setCanCheckForAlerts(false);
                //let activeIncident = $alert as IAlert_ACTIVE_INCIDENT;
                //AlertListOverlay.show("activeIncidents",ALERT_TYPE_ACTIVE_INCIDENT, [activeIncident]);


            break;
            case ALERT_TYPE_SCHEDULED_DRILL:
                let scheduledDrill = $alert as IAlert_SCHEDULED_DRILL;
                AlertListOverlay.show("scheduledDrills",ALERT_TYPE_SCHEDULED_DRILL, [scheduledDrill]);

            break;
        }
    }


    render() {


        let strCN:string = "alertBanner color_"+this.props.color;


        let jsxContent:JSX.Element = <></>;

        if(this.props.data.length===1){

            let firstAlert = this.props.data[0];

            let actionLbl:string = "View Details";
            let incidentTypeId:string = "";
            let singleItemName:JSX.Element = <></>;


            switch(this.props.alertType){
                case ALERT_TYPE_ACTIVE_INCIDENT:

                    let firstActiveIncident:IAlert_ACTIVE_INCIDENT = firstAlert as IAlert_ACTIVE_INCIDENT;
                    incidentTypeId = firstActiveIncident.incidentTypeId;

                    let jsxDrill:JSX.Element = <></>;
                    if(firstActiveIncident.isDrill){
                        jsxDrill = <UIDrillBadge/>;
                        strCN+=" activeIncidentDrill";
                    }

                    singleItemName = (
                        <>
                            <span>Active Event:</span>{jsxDrill}{firstActiveIncident.title}
                        </>
                    );
                break;
                case ALERT_TYPE_SCHEDULED_DRILL:
                    let firstDrill:IAlert_SCHEDULED_DRILL = firstAlert as IAlert_SCHEDULED_DRILL;
                    incidentTypeId = firstDrill.incidentTypeId;
                    
                    let drillDate:Date = new Date(Number(firstDrill.datetime)*1000);
                    let strTime:string = FormatUtil.dateHMS(drillDate,true,false,true);

                    singleItemName = (
                        <>
                            <span>Drill scheduled for {strTime} Today</span>
                        </>                        
                    );
                break;
            }


            strCN+=" singleIncident";

            jsxContent = (
                <div className={strCN}>
                    <div className="singleIncidentOrg">
                        <UIButton 
                            label={firstAlert.orgName}
                            color={UIButton.COLOR_TRANSPARENT} 
                            onClick={()=>{
                                this._setSelectedOrg(firstAlert.orgId)
                            }}/>
                    </div>
                    <div className="singleIncidentInfo" onClick={()=>{
                        this._alertSelected(firstAlert);
                    }}>
                        {incidentTypeId && (
                            <UIIncidentTypeIcon type={getIncidentTypeById(incidentTypeId)!}/>
                        )}
                        <div className="singleIncidentInfoName">{singleItemName}</div>
                        <div className="viewDetails">{actionLbl}</div>
                    </div>
                </div>
            );
        }else if(this.props.data.length>1){


            let multiTitle:JSX.Element = <></>;

            let dataByOrg:Organization[] = [];

            let counter = ($org:Organization)=>{
                return 0;
            }
            let multiRenderer:($org:Organization)=>JSX.Element;

            switch(this.props.alertType){
                case ALERT_TYPE_ACTIVE_INCIDENT:

                    dataByOrg = User.state.userOrgsFlat.filter(($org)=>{
                        return $org.alerts_ACTIVE_INCIDENT.length>0;
                    });

                    multiTitle = (
                        <>
                            Active Events in Progress ({User.state.alerts_ACTIVE_INCIDENT.length})
                        </>
                    );

                    counter = ($org:Organization)=>{
                        return $org.alerts_ACTIVE_INCIDENT.length;
                    }

                    multiRenderer = ($org:Organization)=>{

                        return (
                            <>
                                {$org.alerts_ACTIVE_INCIDENT.map(($activeIncident, $index)=>{
                                    let incidentType = getIncidentTypeById($activeIncident.incidentTypeId)!;

                                    let jsxDrill:JSX.Element = <></>;
                                    if($activeIncident.isDrill){
                                        jsxDrill = <UIDrillBadge/>;
                                    }

                                    return (
                                        <UIIncidentTypeIcon extraClassName="incidentItem" key={"incidentItem"+$index+$activeIncident.alertId} type={incidentType} onClick={()=>{
                                            this._alertSelected($activeIncident);                                            
                                        }}>
                                            <div className="label">{jsxDrill}{$activeIncident.title}</div>
                                        </UIIncidentTypeIcon>
                                    );
                                })}
                            </>
                        )                        
                    }

                break;
                case ALERT_TYPE_SCHEDULED_DRILL:
                    dataByOrg = User.state.userOrgsFlat.filter(($org)=>{
                        return $org.alerts_SCHEDULED_DRILL.length>0;
                    });

                    multiTitle = (
                        <>
                            Drills Scheduled Today ({User.state.alerts_SCHEDULED_DRILL.length})
                        </>
                    )
                    
                    counter = ($org:Organization)=>{
                        return $org.alerts_SCHEDULED_DRILL.length;
                    }
                    multiRenderer = ($org:Organization)=>{
                        return (
                            <>
                                {$org.alerts_SCHEDULED_DRILL.map(($drill,$index)=>{

                                    let drillDate:Date = new Date(Number($drill.datetime)*1000);
                                    let incidentType = getIncidentTypeById($drill.incidentTypeId)!

                                    return (
                                        <UIIncidentTypeIcon extraClassName="incidentItem" key={"drillItem"+$index+$drill.calendarId} type={getIncidentTypeById($drill.incidentTypeId)!} onClick={()=>{
                                            this._alertSelected($drill);
                                        }}>
                                            <div className="label">{incidentType.incidentType} - {FormatUtil.dateHMS(drillDate,true,false,true)}</div>
                                        </UIIncidentTypeIcon>
                                    )
                                })}
                            </>
                        )
                    }
                break;
            }

            
            strCN+=" multipleIncidents";


            jsxContent = (
                <div className={strCN}>
                    <div className="multipleIncidentsTitle">{multiTitle}</div>
                    <div className="multipleIncidentsContainer">
                        {dataByOrg.map(($org)=>{
                            return (
                                <div key={$org.orgId} className="multipleIncidentsItem">
                                    <div className="orgName">
                                        <UIButton onClick={()=>{
                                            this._setSelectedOrg($org.orgId)
                                        }} size={UIButton.SIZE_TINY} label={$org.orgName+" ("+counter($org)+")"} color={UIButton.COLOR_TRANSPARENT}/>
                                    </div>
                                    <UIScrollContainer extraClassName="incidentItems">
                                        {multiRenderer($org)}
                                    </UIScrollContainer>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        }

        return jsxContent;
    }
}
