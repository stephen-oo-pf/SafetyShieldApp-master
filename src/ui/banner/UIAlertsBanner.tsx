import * as React from 'react';
import User from '../../data/User';


import { dispatch, listen, unlisten } from '../../dispatcher/Dispatcher';

import AppEvent from '../../event/AppEvent';

import { ALERT_TYPE_ACTIVE_INCIDENT, createIDFromAlerts_ACTIVE_INCIDENT, ALERT_TYPE_SCHEDULED_DRILL, createIDFromAlerts_SCHEDULED_DRILL } from '../../data/AlertData';
import UIAlertBanner from './UIAlertBanner';
import NextFrame from '../../util/NextFrame';

export interface IUIAlertsBannerProps {

}

export interface IUIAlertsBannerState {
    alertID_ACTIVE_INCIDENTS:string;
    alertID_SCHEDULED_DRILLS:string;
    height:number;
    showing:boolean;
}

export default class UIAlertsBanner extends React.Component<IUIAlertsBannerProps, IUIAlertsBannerState> {

    static TRANS_SPEED:number = 0.8;

    inside:React.RefObject<HTMLDivElement> = React.createRef();

    timeoutAfterAniID:number = -1;
    timeoutResizeID:number = -1;

    constructor(props: IUIAlertsBannerProps) {
        super(props);

        this.state = {
            showing:false,
            height:0,
            alertID_ACTIVE_INCIDENTS:"",
            alertID_SCHEDULED_DRILLS:"",
        }
    }
    get canShow(){
        let canShow:boolean=true;
        if(User.state.userOrgsHasMasterOrg){
            canShow=false;
        }

        return canShow;
    }
    componentDidMount(){
        if(this.canShow){
            NextFrame(()=>{

                this._setHeight();
                listen(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);
                listen(AppEvent.PAGE_SIZE_CHANGE, this._onPageSizeChange);
                window.addEventListener("resize", this._onResize);
            })
        }
    }
    componentDidUpdate(){


        if(this.canShow && this.inside.current){

            let alertID_ACTIVE_INCIDENT:string = createIDFromAlerts_ACTIVE_INCIDENT(User.state.alerts_ACTIVE_INCIDENT);
            let alertID_SCHEDULED_DRILLS:string = createIDFromAlerts_SCHEDULED_DRILL(User.state.alerts_SCHEDULED_DRILL);

            if(alertID_ACTIVE_INCIDENT!==this.state.alertID_ACTIVE_INCIDENTS || alertID_SCHEDULED_DRILLS!==this.state.alertID_SCHEDULED_DRILLS){
                
                let shouldBeShowing:boolean=false;
                if(User.state.alerts_ACTIVE_INCIDENT.length>0 || User.state.alerts_SCHEDULED_DRILL.length>0){
                    shouldBeShowing=true;
                }
    
                let height:number = this.inside.current.clientHeight;
                this.setState({height:height, alertID_ACTIVE_INCIDENTS:alertID_ACTIVE_INCIDENT, alertID_SCHEDULED_DRILLS:alertID_SCHEDULED_DRILLS, showing:shouldBeShowing},this._dispatchBannerEvents);   
            }         
        }
    }
    _dispatchBannerEvents=()=>{                 
        dispatch(new AppEvent(AppEvent.ABOVE_HEIGHT_CHANGE));
        window.clearTimeout(this.timeoutAfterAniID);
        this.timeoutAfterAniID = window.setTimeout(()=>{
            dispatch(new AppEvent(AppEvent.ABOVE_HEIGHT_CHANGE));
        },UIAlertsBanner.TRANS_SPEED*1000);
    }

    _onAlertsUpdate=($event:AppEvent)=>{
        this.forceUpdate();
    }

    componentWillUnmount(){
        if(this.canShow){
            window.clearTimeout(this.timeoutAfterAniID);
            window.clearTimeout(this.timeoutResizeID);
            unlisten(AppEvent.PAGE_SIZE_CHANGE, this._onPageSizeChange);
            unlisten(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);
            window.removeEventListener("resize", this._onResize);
        }
    }

    _onResize=()=>{
        window.clearTimeout(this.timeoutResizeID);
        this.timeoutResizeID = window.setTimeout(this._setHeight,100);
    }
    _onPageSizeChange=($event:AppEvent)=>{
        this._setHeight();
    }


    _setHeight=()=>{
        if(this.inside.current){
            let height = this.inside.current.clientHeight;
            
            //The event dispatches are for updating the UIWindowTable's virtual list to the new height.
            if(this.state.height!==height){
                this.setState({height:height},this._dispatchBannerEvents);
            }
        }
    }

    render() {
        if(!this.canShow){
            return null;
        }

        let strCN:string = "alertsBanner";

        let numSpeed:number=0;
        /*
        The idea here is to only allow the banner to animate whenever the data changes or on the first time showing.
        */
        if(User.state.alertsLastUpdateWithDataChange && Date.now()-User.state.alertsLastUpdateWithDataChange.valueOf()<1000){
            numSpeed = UIAlertsBanner.TRANS_SPEED;
        }
        
        let bannerStyle:React.CSSProperties = {
            transitionDuration:numSpeed+"s",
            height:this.state.height+"px"
        };


        if(User.state.alerts_ACTIVE_INCIDENT.length>0 || User.state.alerts_SCHEDULED_DRILL.length>0){
            if(this.state.showing){
                strCN+=" showing";
            }
        }


        return (
            <div className={strCN} style={bannerStyle}>
                <div ref={this.inside} className="alertsBannerInside">
                    <UIAlertBanner
                        color="red"
                        data={User.state.alerts_ACTIVE_INCIDENT}
                        alertType={ALERT_TYPE_ACTIVE_INCIDENT}                        
                    />
                    <UIAlertBanner
                        color="blue"
                        data={User.state.alerts_SCHEDULED_DRILL}
                        alertType={ALERT_TYPE_SCHEDULED_DRILL}
                    />
                </div>
            </div>  
        );
    }
}
