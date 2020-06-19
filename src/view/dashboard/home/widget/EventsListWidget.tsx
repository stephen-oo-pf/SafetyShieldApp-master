import * as React from 'react';
import Widget from './Widget';
import './EventsListWidget.scss';
import UITabBar, { UITabBarItem } from '../../../../ui/UITabBar';


import mapMarkerAlert from '@iconify/icons-mdi/map-marker-alert';
import { listen, unlisten } from '../../../../dispatcher/Dispatcher';
import AppEvent from '../../../../event/AppEvent';
import User from '../../../../data/User';
import UIAlertList from '../../../../ui/UIAlertList';
import { ALERT_TYPE_ACTIVE_INCIDENT, ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE } from '../../../../data/AlertData';
import FormatUtil from '../../../../util/FormatUtil';

import {IIncidentReportData, IPerOrgPerTypeIncidentReportGroup} from '../../../../data/IncidentData';

export interface EventsListWidgetProps {
}




export interface EventsListWidgetState {
    selectedTab:string;
    
    dataReports?:IIncidentReportData[];
    dataReportsPerOrgIncidentType?:IPerOrgPerTypeIncidentReportGroup[];
    dataReportsLastUpdate?:Date;
}

export default class EventsListWidget extends React.Component<EventsListWidgetProps, EventsListWidgetState> {
    static ID:string = "eventsListWidget";

    static TAB_ACTIVE:string = "tabActive";
    static TAB_REPORTED:string = "tabReported";


    _unmounting:boolean=false;

    _tabs:UITabBarItem[] = [];
    constructor(props: EventsListWidgetProps) {
        super(props);


        this._tabs.push({id:EventsListWidget.TAB_ACTIVE, label:""});
        this._tabs.push({id:EventsListWidget.TAB_REPORTED, icon:mapMarkerAlert, label:""});


        //we only show the loading when its mounting
        this.state = {
            selectedTab:EventsListWidget.TAB_ACTIVE
        }
    }
    componentDidMount(){
        
        listen(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);

    }
    


    componentWillUnmount(){
        this._unmounting=true;
        unlisten(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);
    }

    _onAlertsUpdate=($event:AppEvent)=>{
        this.forceUpdate();
    }

    _onTabClick=($value:string)=>{
        this.setState({selectedTab:$value});



    }
    render() {


        let reportedCount = User.state.alerts_PENDING_INCIDENT_REPORT.reduce(($prev:number, $current)=>{
            return $prev+$current.numItems;
        },0);

        this._tabs[0].label = "Active ("+User.state.alerts_ACTIVE_INCIDENT.length+")";
        this._tabs[1].label = "Reported ("+reportedCount+")";

        let date = User.state.alertsLastUpdate;

        let jsxContent:JSX.Element = <></>;
        switch(this.state.selectedTab){
            case EventsListWidget.TAB_ACTIVE:
                jsxContent = (
                    <UIAlertList key="activeList" smaller type={ALERT_TYPE_ACTIVE_INCIDENT} data={User.state.alerts_ACTIVE_INCIDENT} />
                );
            break;
            case EventsListWidget.TAB_REPORTED:
                jsxContent = (
                    <UIAlertList key="reportedList" smaller type={ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE} data={User.state.perOrgPerTypePendingIncidentReportGroups} />   
                );
            break;
        }
        

        return (
            <Widget id={EventsListWidget.ID} label="Event List" useWhiteBoxForContent>
                <UITabBar
                    selectedID={this.state.selectedTab}
                    horizontal
                    data={this._tabs}
                    onChange={this._onTabClick}
                />
                <div className="eventsListContent">
                    {jsxContent}
                </div>                
                {date && (
                    <div className="lastUpdate">Last Update: {FormatUtil.dateHMS(date,true)}</div>
                )}
            </Widget>
        );
    }
}
