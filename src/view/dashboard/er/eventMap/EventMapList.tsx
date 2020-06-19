import * as React from 'react';
import UIScrollContainer from '../../../../ui/UIScrollContainer';
import User from '../../../../data/User';
import { IIncidentReportData, ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA } from '../../../../data/IncidentData';

import UIIncidentTypeIcon from '../../../../ui/UIIncidentTypeIcon';
import './EventMapList.scss';
import FormatUtil from '../../../../util/FormatUtil';
import { ALERT_TYPE_ACTIVE_INCIDENT, IAlert_ACTIVE_INCIDENT } from '../../../../data/AlertData';
import { ALERT_ALT_TYPE_INCIDENT_REPORT_DATA } from '../../../../data/IncidentData';
import { UIActiveIncidentBadge, UIDrillBadge, UIIncidentReportedBadge } from '../../../../ui/UIBadge';

import MapIncidentData from '../../../../data/MapIncidentData';
import UINoData from '../../../../ui/UINoData';

export interface IEventMapListProps {
}

export default class EventMapList extends React.Component<IEventMapListProps> {
    render() {

        let strCN:string = "eventMapList sidebarContentView";

        return (
            <UIScrollContainer extraClassName={strCN}>
                {User.state.mapIncidents.length===0 && (
                    <UINoData />
                )}
                {User.state.mapIncidents.filter(($incident)=>{
                    //lets remove the rolled up reports

                    let isOk:boolean=true;
                    if($incident.alertType===ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA){
                        isOk=false;
                    }
                    return isOk;

                }).map(($incident,$index)=>{
                    return (
                        <EventMapListItem key={$incident.alertType+$incident.datetime+$incident.orgId} data={$incident}/>
                    )
                })}
            </UIScrollContainer>
        );
    }
}



export interface IEventMapListItemProps {
    data:MapIncidentData;
}

export class EventMapListItem extends React.Component<IEventMapListItemProps> {

    static COLOR_STYLE_RED:string = "color_red";
    static COLOR_STYLE_ORANGE:string = "color_orange";


    _onClick=()=>{
        this.props.data.toggleSelected();
    }

    render() {
        let strCN:string = "eventMapListItem";

        let colorStyle:string = "";

        if(this.props.data.isSelected){
            strCN+=" selected";
        }

        let footerText:string = "";

        let jsxBadges:JSX.Element = <></>;
        switch(this.props.data.alertType){
            case ALERT_TYPE_ACTIVE_INCIDENT:
                colorStyle = EventMapListItem.COLOR_STYLE_RED;

                let hasSelectedChild = this.props.data.childMapReports.some(($childReport)=>{
                    return $childReport.isSelected;
                });

                if(hasSelectedChild){
                    strCN+=" selectedChild";
                }

                
                let activeIncident:IAlert_ACTIVE_INCIDENT = this.props.data.dataActiveIncident!;
                jsxBadges = (
                    <>
                        <UIActiveIncidentBadge/>
                        {activeIncident.isDrill && (
                            <UIDrillBadge/>
                        )}
                    </>
                );
                footerText = activeIncident.numReports+" Report"+(activeIncident.numReports===1?"":"s");
            break;
            case ALERT_ALT_TYPE_INCIDENT_REPORT_DATA:
                colorStyle = EventMapListItem.COLOR_STYLE_ORANGE;

                let incidentReport:IIncidentReportData = this.props.data.dataIncidentReport!;
                jsxBadges = (
                    <>
                        <UIIncidentReportedBadge/>
                    </>
                )
            break;
        }

        strCN+=" "+colorStyle;

        return (
            <div className={strCN} onClick={this._onClick}>
                
                <div className="listItemHeader">                    
                    <div className="listItemOrg">
                        {this.props.data.orgName}
                    </div>                   
                    <div className="listItemTime">
                        {this.props.data.getElapsedTime(true,true)}
                    </div>
                </div>
                <div className="listItemContent">
                    <UIIncidentTypeIcon smallerAndBlack type={this.props.data.incidentType}/>
                    <div className="listItemContentDetail">                                          
                        <div className="listItemTitle">
                            {this.props.data.title}
                        </div>                                     
                        <div className="listItemActionBy">
                            {this.props.data.actionBy}                        
                        </div>
                    </div>
                </div>
                <div className="listItemFooter"> 
                    {jsxBadges}
                    {footerText && (
                        <div className="footerText">{footerText}</div>
                    )}
                </div>                
            </div>
        );
    }
}
