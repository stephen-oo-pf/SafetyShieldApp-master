import * as React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';

import { showOverlay, hideOverlay } from './OverlayController';
import { IAlertEventData, ALERT_TYPE_ACTIVE_INCIDENT, ALERT_TYPE_INCIDENT_NOTIFICATION, ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION, IAlertData, IAlert_INCIDENT_NOTIFICATION, ALERT_TYPE_SCHEDULED_DRILL } from '../data/AlertData';
import UIAlertList from '../ui/UIAlertList';
import './AlertListOverlay.scss';

import { listen, unlisten, dispatch } from '../dispatcher/Dispatcher';
import AppEvent from '../event/AppEvent';
import User from '../data/User';
import Api from '../api/Api';
import { INCIDENT_STATUS_TYPE_CLOSED, INCIDENT_STATUS_TYPE_TRIGGERED } from '../data/IncidentData';
export interface IAlertListOverlayProps extends BaseOverlayProps{
}

export interface IAlertListOverlayState {
    data:IAlertEventData[];
}

export default class AlertListOverlay extends React.Component<IAlertListOverlayProps, IAlertListOverlayState> {
    static ID:string = "alertListOverlay";

    static show($name:string, $type:string, $data:IAlertEventData[], $shouldDismiss:boolean=false){
        User.setCanCheckForAlerts(false);
        showOverlay($name, AlertListOverlay.ID,{type:$type, data:$data, shouldDismiss:$shouldDismiss});
    }
    static hide($name:string){        
        hideOverlay($name, AlertListOverlay.ID,{});
    }


    constructor(props: IAlertListOverlayProps) {
        super(props);

        //create our own copy.. we do this in case the data changes in the background from another check.
        let data = [...this.props.data.details.data];

        this.state = {
            data:data
        }
    }
    componentDidMount(){
        listen(AppEvent.VIEW_INCIDENT, this._onViewIncident);
        listen(AppEvent.VIEW_MAP_INCIDENT, this._onViewMapIncident);
        listen(AppEvent.START_DRILL, this._onStartDrill);

        if(this.props.data.details.shouldDismiss){
            let alertIds = this.state.data.map(($notif)=>{
                let alertId = "";
                if(($notif as IAlertData).alertId){
                    alertId = ($notif as IAlertData).alertId!;
                }
                return alertId;
            }).filter(($alertId)=>{
                let isOk:boolean=true;
                if($alertId===""){
                    isOk=false;
                }
                return isOk;
            });
            Api.alertsManager.dismissUINotifications(alertIds,($success,$results)=>{});
        } 
    }
    componentWillUnmount(){
        unlisten(AppEvent.VIEW_INCIDENT, this._onViewIncident);
        unlisten(AppEvent.START_DRILL, this._onStartDrill);

    }
    _onBGClick=()=>{
        this._close();
    }

    _onClose=()=>{
        this._close();
    }
    _close=()=>{
        this._hide();      
        if(!User.state.canCheckForAlerts){
            User.setCanCheckForAlerts(true);
        }
    }
    
    _hide=()=>{
        AlertListOverlay.hide(this.props.data.name);
    }
    _onViewIncident=($event:AppEvent)=>{
        this._hide();
    }
    _onViewMapIncident=($event:AppEvent)=>{
        this._hide();
    }
    _onStartDrill=($event:AppEvent)=>{
        this._hide();
    }
    render() {

        let overlayTitle;

        let zIndex:number = 400;

        switch(this.props.data.details.type){
            case ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION:
                overlayTitle = this.props.data.details.data.length+" New Event"+(this.props.data.details.data.length.length>1?"s":"")+" Reported";
                zIndex = 408;
            break;
            case ALERT_TYPE_INCIDENT_NOTIFICATION:
                zIndex = 410;
                
                let endedNotifs = (this.state.data as IAlert_INCIDENT_NOTIFICATION[]).filter(($notif)=>{
                    return $notif.incidentStatusId===INCIDENT_STATUS_TYPE_CLOSED;
                });
                
                let activeNotifs = (this.state.data as IAlert_INCIDENT_NOTIFICATION[]).filter(($notif)=>{
                    return $notif.incidentStatusId===INCIDENT_STATUS_TYPE_TRIGGERED;
                });                

                if(activeNotifs.length===0 && endedNotifs.length>0){
                    overlayTitle = "Event"+(endedNotifs.length>1?"s":"")+" closed.";
                }else{
                    if(activeNotifs.length>0){
                        overlayTitle = "Active Event"+(activeNotifs.length>1?"s":"")+" in Progress";
                    }
                }

            break;
            case ALERT_TYPE_ACTIVE_INCIDENT:
                overlayTitle = "Active Event in Progress";
            break;
            case ALERT_TYPE_SCHEDULED_DRILL:
                overlayTitle = "Drill Scheduled for Today";
            break;
        }

        return (            
            <Overlay 
                state={this.props.data.state} 
                id={AlertListOverlay.ID} 
                zIndex={zIndex} 
                headerClose={this._close} 
                headerTitle={overlayTitle} 
                smallHeader
            >
                <UIAlertList type={this.props.data.details.type} data={this.state.data}/>
            </Overlay>
        );
    }
}
