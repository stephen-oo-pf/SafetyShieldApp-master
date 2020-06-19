import React from 'react';
import Widget from './Widget';
import { unlisten, listen } from '../../../../dispatcher/Dispatcher';
import OverlayEvent from '../../../../event/OverlayEvent';
import Api, { IErrorType } from '../../../../api/Api';
import { IActivityData, IActivityPerDayData } from '../../../../data/ActivityData';
import FormatUtil from '../../../../util/FormatUtil';
import UILoadingIcon from '../../../../ui/UILoadingIcon';
import UILoadingBox from '../../../../ui/UILoadingBox';
import UIErrorBox from '../../../../ui/UIErrorBox';
import UIIcon from '../../../../ui/UIIcon';
import User from '../../../../data/User';
import { getIncidentTypeIconOrFontLetter } from '../../../../data/IncidentData';

import baselineAccessTime from '@iconify/icons-ic/baseline-access-time';
import clipboardCheck from '@iconify/icons-mdi/clipboard-check';
import fileDocument from '@iconify/icons-mdi/file-document';
import floorPlan from '@iconify/icons-mdi/floor-plan';
import baselineContactPhone from '@iconify/icons-ic/baseline-contact-phone';
import bullhornIcon from '@iconify/icons-mdi/bullhorn';
import baselineSpeakerPhone from '@iconify/icons-ic/baseline-speaker-phone';
import './NotifWidget.scss';
import { NavLink } from 'react-router-dom';
import UIScrollContainer from '../../../../ui/UIScrollContainer';
import UINoData from '../../../../ui/UINoData';
import AppData from '../../../../data/AppData';
import { UIUrgentBadge, UIDrillBadge } from '../../../../ui/UIBadge';


export interface INotifWidgetProps {
}

export interface INotifWidgetState {
    loading:boolean;
    initialLoadCompleted:boolean;
    error?:IErrorType;
    data?:IActivityPerDayData[];
    lastUpdate?:Date;
}

export default class NotifWidget extends React.Component<INotifWidgetProps, INotifWidgetState> {

    static ID:string = "notificationsWidget";


    _unmounting:boolean=false;


    _timeoutID:number = -1;

    constructor(props: INotifWidgetProps) {
        super(props);

        this.state = {
            loading:true,
            initialLoadCompleted:false,
        }
    }
    componentDidMount(){
        this._loadData();        
        listen(OverlayEvent.SHOW, this._onOverlayShow);
    }
    componentWillUnmount(){
        this._unmounting=true;
        window.clearTimeout(this._timeoutID);
        unlisten(OverlayEvent.SHOW, this._onOverlayShow);

    }
    _continueLoading=()=>{
        window.clearTimeout(this._timeoutID);
        if(!this._unmounting){
            let numInterval:number=AppData.config.ui.user_activity_polling_interval*1000;
            this._timeoutID = window.setTimeout(this._loadData,numInterval);
        }
    }
    _loadData=()=>{
        this.setState({loading:true},()=>{

            window.setTimeout(()=>{

                Api.userManager.getUserOrgActivity(($success,$results)=>{
                    if(!this._unmounting){                    
                        if($success){
    
                            //sort data into activity per day
                            let activityPerDay:IActivityPerDayData[] = ($results as IActivityData[]).reduce(($prev:IActivityPerDayData[],$current,$index)=>{
    
                                let date:Date = new Date($current.datetime*1000);
                                let idFromDate = FormatUtil.dateMDY(date);
    
                                let match = $prev.find(($activity)=>{
                                    return $activity.id===idFromDate;
                                });
                                if(match){
                                    //exists
                                    match.items.push($current);
                                }else{
                                    //new
    
                                    let isToday:boolean=false;
                                    let today:Date = new Date();
                                    if(today.getFullYear()===date.getFullYear() && today.getMonth()===date.getMonth() && today.getDate()===date.getDate()){
                                        isToday=true;
                                    }
    
                                    $prev.push({
                                        id:idFromDate,
                                        date:date,
                                        isToday:isToday,
                                        datetime:$current.datetime,
                                        items:[$current]
                                    });
                                }
                                return $prev;
                            },[]);
    
                            //sort items in each activityPerDay
                            activityPerDay.forEach(($perDay)=>{
                                $perDay.items.sort(($itemA,$itemB)=>{
                                    let a:number=$itemA.datetime;
                                    let b:number=$itemB.datetime;
    
                                    if(a===b){
                                        return 0;
                                    }else if(a>b){
                                        return -1;
                                    }else{
                                        return 1;
                                    }
                                });
                            });
    
                            //now sort the items themselves
                            activityPerDay.sort(($perDayA,$perDayB)=>{
                                
                                let a:number=$perDayA.datetime;
                                let b:number=$perDayB.datetime;
    
                                if(a===b){
                                    return 0;
                                }else if(a>b){
                                    return -1;
                                }else{
                                    return 1;
                                }
                            });
    
    
                            this.setState({loading:false, initialLoadCompleted:true, data:activityPerDay, lastUpdate:new Date()},this._continueLoading);
                        }else{
                            this.setState({loading:false, initialLoadCompleted:false, error:$results},this._continueLoading);
                        }
                    }
                });
            },5000);

        });
    }

    _onOverlayShow=($event:OverlayEvent)=>{

        if($event.data){
            switch($event.data.name){
                case "incidentNotificationsOverlay":
                case "incidentReportNotificationsOverlay":
                    this._loadData();
                break;
            }
        }
    }
    render() {
        return (
            <Widget id={NotifWidget.ID} label="Notifications" useWhiteBoxForContent>
                
                {!this.state.data && this.state.loading && !this.state.initialLoadCompleted &&  (
                    <UILoadingBox fullHeight/>
                )}
                {this.state.data && this.state.loading && this.state.initialLoadCompleted &&  (
                    <UILoadingIcon extraClassName="loadingCorner"  />
                )}
                {!this.state.loading && this.state.error && (
                    <UIErrorBox error={this.state.error.desc}/>
                )}
                {this.state.initialLoadCompleted && this.state.data && (
                    <>
                        <UIScrollContainer>        
                            {this.state.data.map(($perDay, $index:number)=>{
                                return (                        
                                    <NotifPerDay index={$index} key={"perDay"+$perDay.id+$perDay.datetime} data={$perDay}/>
                                )
                            })}

                            {this.state.data.length===0 && (
                                <UINoData/>
                            )}

                        </UIScrollContainer>
                        <div className="lastUpdate">Last Update: {FormatUtil.dateHMS(this.state.lastUpdate!,true,false)}</div>
                    </>
                )}
            </Widget>
        );
    }
}


interface INotifPerDayProps {
    data:IActivityPerDayData;
    index:number;
}

class NotifPerDay extends React.Component<INotifPerDayProps> {
    render() {
        let strCN:string = "notifPerDay";

        let today:string = "";
        

        return (
            <div className={strCN}>
                <div className="date">{this.props.data.isToday?"Today - ":""}{FormatUtil.dateMDY(this.props.data.date,false,true,false)}</div>
                <div className="items">
                    {this.props.data.items.map(($item,$index)=>{
                        return (
                            <NotifItem data={$item} key={this.props.index+"_notifItem"+$item.datetime+"_"+$index}/>
                        );
                    })}


                </div>
            </div>
        );
    }
}

interface INotifItemProps {
    data:IActivityData;
}

class NotifItem extends React.Component<INotifItemProps> {
    render() {
        let strCN:string = "notifItem";

        let icon;

        let matchingIncident = User.state.allIncidentTypes.find(($incidentType)=>{
            return $incidentType.iconInfo===this.props.data.iconInfo;
        });

        if(matchingIncident){
            let incidentIcon = getIncidentTypeIconOrFontLetter(matchingIncident.iconInfo) as object;
            if(incidentIcon){
                icon =  incidentIcon;
            }
        }else{
            //other possible types
            switch(this.props.data.iconInfo){
                case "/icons-mdi/clipboard-check":
                    icon = clipboardCheck;
                break;
                case "/icons-mdi/file-document":
                    icon = fileDocument;
                break;
                case "/icons-mdi/floor-plan":
                    icon = floorPlan;
                break;
                case "/icons-ic/baseline-contact-phone":
                    icon = baselineContactPhone;
                break;
                case "/icons-mdi/bullhorn":
                    icon = bullhornIcon;
                break;
                case "/icons-ic/baseline-speaker-phone":
                    icon = baselineSpeakerPhone;
                break;
                case "/icons-ic/baseline-access-time":
                    icon = baselineAccessTime;
                break;

                
            }
        }

        let link:string = "";
        if(this.props.data.link){
            link = this.props.data.link;
            if(link.indexOf("/#")!==-1){
                link = link.split("/#").join("");
            }
        }

        return (
            <div className={strCN}>
                {icon && (
                    <UIIcon icon={icon}/>
                )}
                <div className="notifItemDetails">
                    <div className="notifItemDetailsTitle">
                        {this.props.data.urgentFlag && (
                            <UIUrgentBadge/>
                        )}
                        {this.props.data.isDrill && (
                            <UIDrillBadge/>
                        )}
                        {this.props.data.title}
                    </div>
                    <div className="notifItemDetailsText">
                        {this.props.data.text}
                        {link && link!=="" && (
                            <NavLink to={link}>{this.props.data.linkTitle!}</NavLink>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
