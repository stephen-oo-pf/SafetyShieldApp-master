import React from 'react';
import { RouteComponentProps, Redirect, Switch, Route } from 'react-router-dom';
import UIView from '../../ui/UIView';
import './DashboardView.scss';
import DashboardSidebar from './DashboardSidebar';
import UIIcon from '../../ui/UIIcon';


import User from '../../data/User';
import HomeView from './home/HomeView';
import UsersView from './settings/users/UsersView';


import { dispatch, listen, unlisten } from '../../dispatcher/Dispatcher';
import OrgEvent from '../../event/OrgEvent';

import LoadingOverlay from '../../overlay/LoadingOverlay';
import Api, { ApiCallback } from '../../api/Api';

import LoginView from '../login/LoginView';
import ConfirmOverlay from '../../overlay/ConfirmOverlay';

import NextFrame from '../../util/NextFrame';

import chevronLeft from '@iconify/icons-mdi/chevron-left';
import menuIcon from '@iconify/icons-mdi/menu';
import ChecklistsView from './er/checklists/ChecklistsView';

import { UITabBarItem } from '../../ui/UITabBar';
import OrgsView from './orgs/OrgsView';
import ERView from './er/ERView';
import AppData from '../../data/AppData';
import AppEvent from '../../event/AppEvent';
import IncidentOverlay from '../../overlay/IncidentOverlay';
import { IAlertEventData, ALERT_TYPE_INCIDENT_NOTIFICATION, ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION, IAlert_INCIDENT_REPORT_NOTIFICATION, IAlert_SCHEDULED_DRILL, ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE, ALERT_TYPE_ACTIVE_INCIDENT } from '../../data/AlertData';

import AlertOverlay from '../../overlay/AlertOverlay';
import AlertListOverlay from '../../overlay/AlertListOverlay';
import { IIncidentReportData, getIncidentTypeById, IPerOrgPerTypeIncidentReportGroup, IGetIncidentResponse, ALERT_ALT_TYPE_INCIDENT_REPORT_DATA } from '../../data/IncidentData';
import MyAccountView from './myaccount/MyAccountView';
import DocumentsView from './documents/DocumentsView';
import SettingsView from './settings/SettingsView';
import FloorPlansView from './documents/FloorPlansView';
import ERPsView from './documents/ERPsView';
import ECView from './er/ec/ECView';
import BNView from './er/bn/BNView';
import GeneralView from './settings/general/GeneralView';
import IntegrationsView from './settings/integrations/IntegrationsView';
import DrillsView from './er/drills/DrillsView';
import PromptOverlay from '../../overlay/PromptOverlay';
import FormatUtil from '../../util/FormatUtil';
import LocationUtil from '../../util/LocationUtil';
import EventMapView from './er/eventMap/EventMapView';
import MapIncidentData from '../../data/MapIncidentData';
import { Data } from '@react-google-maps/api';
import RealTimeIncidentOverlay from '../../overlay/RealTimeIncidentOverlay';


export interface IDashboardViewProps extends RouteComponentProps{

}

export interface IDashboardViewState {
    unmount:boolean;
}

export default class DashboardView extends React.Component<IDashboardViewProps, IDashboardViewState> {
    static ID:string = "dashboard";
    static PATH:string = "/";

    static EXPAND_TRANS_SPEED:number = 400;
    static EXPAND_TRANS_CSS:string = "all 0.4s ease-out";

    //POSSIBLE TABS
    _tabDashboard:UITabBarItem =     {id:HomeView.ID,            label:"Dashboard", icon:HomeView.ICON, alt:"Dashboard", url:HomeView.PATH, desc:"Dashboard"};
    _tabAccounts:UITabBarItem =      {id:OrgsView.ID,            label:"", icon:OrgsView.ICON, alt:"", url:OrgsView.PATH, desc:""};
    _tabER:UITabBarItem =            {id:ERView.ID,              label:"Event Response", icon:ERView.ICON, alt:"Event Response", url:ERView.PATH, desc:"Event Response", subItems:[]};
    _tabDocuments:UITabBarItem =     {id:DocumentsView.ID,       label:"Documents", icon:DocumentsView.ICON, alt:"Documents", url:DocumentsView.PATH, desc:"Documents", subItems:[]};
    _tabSettings:UITabBarItem =      {id:SettingsView.ID,        label:"Settings", icon:SettingsView.ICON, alt:"Settings", url:SettingsView.PATH, desc:"Settings", subItems:[]};
    
    //_tabMap =           {id:MapView.ID,             label:"Real Time Event Map", icon:MapView.ICON, alt:"Real Time Event Map", url:MapView.PATH, desc:"Real Time Event Map"};
    _subtabUsers =          {id:UsersView.ID,           label:"", icon:UsersView.ICON, alt:"", url:UsersView.PATH, desc:""};
    _subtabGeneralSettings ={id:GeneralView.ID,         label:"General", icon:GeneralView.ICON, alt:"General", url:GeneralView.PATH, desc:"General"};
    _subtabIntegrations =   {id:IntegrationsView.ID,    label:"Integrations", icon:IntegrationsView.ICON, alt:"Integrations", url:IntegrationsView.PATH, desc:"Integrations"};
    
    _subtabFloorPlans =     {id:FloorPlansView.ID,      label:"Floor Plans", icon:FloorPlansView.ICON, alt:"Floor Plans", url:FloorPlansView.PATH, desc:"Floor Plans"};
    _subtabERPs =           {id:ERPsView.ID,            label:"ERPs",icon:ERPsView.ICON,  url:ERPsView.PATH, alt:"Emergency Response Plans", desc:"Emergency Response Plans"};
    _subtabChecklist =      {id:ChecklistsView.ID,      label:"Checklists", icon:ChecklistsView.ICON, alt:"Checklists", url:ChecklistsView.PATH, desc:"Checklists"};
    _subtabEC =             {id:ECView.ID,              label:"Emergency Contacts", icon:ECView.ICON, alt:"Emergency Contacts", url:ECView.PATH, desc:"Emergency Contacts"};
    _subtabBroadcasts =     {id:BNView.ID,              label:"Broadcast Notifications", icon:BNView.ICON, alt:"Checklists", url:BNView.PATH, desc:"Broadcast Notifications"};
    _subtabDrills =         {id:DrillsView.ID,          label:"Drills", icon:DrillsView.ICON, alt:"Drills", url:DrillsView.PATH, desc:"Drills"};
    _subtabEventMap =       {id:EventMapView.ID,             label:"Event Map", icon:DrillsView.ICON, alt:"Event Map", url:EventMapView.PATH, desc:"Real Time Event Map"};


    _tabs:UITabBarItem[] = [];

    _isUnmounting:boolean=false;
    _isCheckingAlerts:boolean=false;

    _checkingTimeoutID:number = -1;
    _beginEventTimeoutID:number = -1;    
    _expandTimeoutID:number = -1;
    
    constructor(props: IDashboardViewProps) {
        super(props);

        this.state = {
            unmount:false
        }
        this._updateSelectedOrgDetails();
    }

    
    componentDidMount(){

        window.clearInterval(this._checkingTimeoutID);       
        
        listen(OrgEvent.ORG_SELECTED, this._onOrgSelected);
        listen(AppEvent.VIEW_REAL_TIME_INCIDENT, this._onViewRealTimeIncident);
        listen(AppEvent.VIEW_MAP_INCIDENT, this._onViewMapIncident);
        listen(AppEvent.START_DRILL, this._onStartDrill);
        listen(AppEvent.RESUME_CHECKING_ALERTS, this._onResumeCheckingAlerts);

        User.setCheckIncidentReports(true);
        this._checkForAlerts();

    }
    componentWillUnmount(){
        window.clearInterval(this._checkingTimeoutID);
        this._isUnmounting=true;
        unlisten(OrgEvent.ORG_SELECTED, this._onOrgSelected);
        unlisten(AppEvent.VIEW_REAL_TIME_INCIDENT, this._onViewRealTimeIncident);
        unlisten(AppEvent.VIEW_MAP_INCIDENT, this._onViewMapIncident);
        unlisten(AppEvent.START_DRILL, this._onStartDrill);
        unlisten(AppEvent.RESUME_CHECKING_ALERTS, this._onResumeCheckingAlerts);
        

        //hide any possible open alertListoverlays
        AlertListOverlay.hide("incidentsNotification");
        AlertListOverlay.hide("incidentReportsNotification");
        AlertListOverlay.hide("activeIncidents");
    }
    _checkForAlerts=()=>{
        if(!this._isCheckingAlerts && User.state.isLoggedIn && User.state.canCheckForAlerts){
            this._isCheckingAlerts=true;
                     
            
            window.clearInterval(this._checkingTimeoutID);
            dispatch(new AppEvent(AppEvent.CHECKING_ALERTS_TICK));

            Api.alertsManager.getAlerts(($success, $results)=>{
                this._isCheckingAlerts=false;
                let hasShown1Type:boolean=false;


                if(!hasShown1Type && User.state.alerts_INCIDENT_NOTIFICATION.length>0 && User.state.isLoggedIn){
                    hasShown1Type=true;
                    AlertListOverlay.show("incidentsNotification",ALERT_TYPE_INCIDENT_NOTIFICATION,User.state.alerts_INCIDENT_NOTIFICATION,true);
                }
                if(!hasShown1Type && User.state.alerts_INCIDENT_REPORT_NOTIFICATION.length>0 && User.state.isLoggedIn){
                    hasShown1Type=true;
                    AlertListOverlay.show("incidentReportsNotification", ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION,User.state.alerts_INCIDENT_REPORT_NOTIFICATION,true);
                }
                this._checkingTimeoutID = window.setTimeout(()=>{
                    this._checkForAlerts();
                },AppData.config.ui.alert_polling_interval*1000);

            });

        }
    }






    _updateTabs=()=>{
        
    }

    _onResumeCheckingAlerts=($event:AppEvent)=>{
        this._checkForAlerts();
    }


//$orgId:string, $incidentTypeId:string, $title:string, $desc:string, $loadingTitle:string


    _onStartDrill=($event:AppEvent)=>{

        let drill:IAlert_SCHEDULED_DRILL = $event.details.data;

        let drillDate:Date = new Date(Number(drill.datetime)*1000);

        let incidentType = getIncidentTypeById(drill.incidentTypeId);
 

        let confirmMsg:string = "Are you sure you want to start the "+incidentType!.incidentType+" drill for "+drill.orgName+" scheduled at "+FormatUtil.dateHMS(drillDate,true,false,true)+" today?";
        ConfirmOverlay.show("confirmDrillStart",()=>{
            PromptOverlay.show("promptDrillTitle",($title:string)=>{
                PromptOverlay.show("promptDrillDesc",($desc:string)=>{                    
                    Api.incidentManager.FULLFLOW_ReportIncident({
                        loadingTitle:"Starting Drill",
                        title:$title,
                        desc:$desc,
                        incidentIdType:drill.incidentTypeId,
                        orgId:drill.orgId,
                        calendarId:drill.calendarId,
                        autoTrigger:true,
                        isDrill:true
                    });                    
                },"Add Drill Comment","Add Drill Comments","Start","Cancel","You must enter a Comment",PromptOverlay.ID2);        
            },"Add Drill Title","Add Drill Title","Continue","Cancel","You must enter a Title");
        },confirmMsg, "Confirm Drill Start","Continue", "Cancel");
    }

    _onViewMapIncident=($event:AppEvent)=>{
        let data:IAlertEventData = $event.details.data as IAlertEventData;
        let type:string = $event.details.type;


        //Lets find a matching MapIncidentData and then go see it!
        let idToFind:string = "";
        switch(type){
            case ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE:
                let perOrgPerTypeIncidentReportGroup = data as IPerOrgPerTypeIncidentReportGroup;
                idToFind = perOrgPerTypeIncidentReportGroup.reports[0].incidentReportId;
            break;
            case ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION:
                let incidentReportNotification = data as IAlert_INCIDENT_REPORT_NOTIFICATION;
                idToFind = incidentReportNotification.incidentReportId;
            break;
            case ALERT_ALT_TYPE_INCIDENT_REPORT_DATA:
                let incidentReport = data as IIncidentReportData;;
                idToFind = incidentReport.incidentReportId;
            break;
            default://ACTIVE INCIDENT/INCIDENT NOTIFICATIONS
            if(data.incidentId){
                idToFind = data.incidentId;
            }
        }

        let matchingMapIncident = User.state.mapIncidents.find(($mapIncident)=>{
            let match:boolean=false;
            return $mapIncident.id===idToFind;
        });

        if(matchingMapIncident){

            if(!matchingMapIncident.isSelected){
                matchingMapIncident.toggleSelected();
            }
            this.props.history.push(EventMapView.PATH);
        }


    }

    
    _onViewRealTimeIncident=($event:AppEvent)=>{
        let data:MapIncidentData= $event.details.data;
        
        let hideLoading = LoadingOverlay.show("loadIncident","Loading Event", "Loading Please Wait");
        this._beginEventTimeoutID = window.setTimeout(()=>{
            Api.incidentManager.getIncident(data.orgId,data.id,($success,$results)=>{
                hideLoading();
                if($success){
                    User.setCanCheckForAlerts(false);
                    RealTimeIncidentOverlay.show("viewRealTimeIncident",data,$results);
                    
                }else{
                    AlertOverlay.show("errorLoadIncident","Error Loading Event");
                }
            });
        },500);
        
    }

    _onViewIncident_OLD=($event:AppEvent)=>{

        let data:IAlertEventData = $event.details.data as IAlertEventData;
        let type:string = $event.details.type;

        window.clearTimeout(this._beginEventTimeoutID);


        const successLoading=($incidentDetails?:any)=>{
            IncidentOverlay.show("viewIncident", type, data, $incidentDetails);
        }
        const errorLoading=($error:string)=>{
            AlertOverlay.show("errorLoadIncident",$error);
        }

        switch(type){
            case ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE:
                //already have the data we need
                successLoading();
            break;
            case ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION:
                let hideLoadingReport = LoadingOverlay.show("loadIncidentReport","Loading Report", "Loading Please Wait");
                this._beginEventTimeoutID = window.setTimeout(()=>{
                     /*
                    we do a lookup of the pending incident reports to find a matching incidentReportId from the ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION
                    if found we use the matchingReport as the ALERT_ALT_TYPE_INCIDENT_REPORT_DATA instead of the curEventAlert 
                    */
                    Api.incidentManager.getPendingIncidentReports(($success,$results)=>{
                        hideLoadingReport();
                        if($success){
                            let pendingIncidentReports:IIncidentReportData[] = $results;
                            let incidentReportNotification = data as IAlert_INCIDENT_REPORT_NOTIFICATION;
                            let matchingReport = pendingIncidentReports.find(($report)=>{
                                return $report.incidentReportId===incidentReportNotification.incidentReportId;
                            });
                            if(matchingReport){
                                successLoading(matchingReport);
                            }else{
                                errorLoading("Error Loading Report");
                            }
                        }else{
                            errorLoading("Error Loading Report");
                        }
                    });
                },500);                
            break;
            default: //ACTIVE INCIDENT/INCIDENT NOTIFICATIONS
                let hideLoading = LoadingOverlay.show("loadIncident","Loading Event", "Loading Please Wait");
                this._beginEventTimeoutID = window.setTimeout(()=>{
                    Api.incidentManager.getIncident(data.orgId,data.incidentId!,($success,$results)=>{
                        hideLoading();
                        if($success){
                            successLoading($results);
                        }else{
                            errorLoading("Error Loading Event");
                        }
                    });
                },500);

        }

    }

    _onOrgSelected=($event:OrgEvent)=>{
        
        let strName:string = "";
        let lblType:string = "";
        strName = User.selectedOrg.orgName;

        lblType = User.selectedOrg.terminologyList.parent_org.singular;
        if(User.selectedOrg.parentOrgId && User.selectedOrg.parentOrgId!==""){
            lblType = User.selectedOrg.terminologyList.child_org.singular;
        }



        let hideOverlay = LoadingOverlay.show("changeAccount",strName,"Changing to "+lblType);

        window.setTimeout(()=>{

            Api.getSelectedOrgInfo(($success:boolean)=>{
                if($success){                    
                    if(!this._isUnmounting){
                        this._updateSelectedOrgDetails();
                        this.props.history.push(DashboardView.PATH);
                    }
                }
                hideOverlay();
            });

        },300);

    }
    _updateSelectedOrgDetails=()=>{

        //correct tab labels to selectedOrg Terminology
        this._tabAccounts.label = User.selectedOrg.terminologyList.parent_org.plural;
        this._tabAccounts.alt = User.selectedOrg.terminologyList.parent_org.plural;
        this._tabAccounts.desc = User.selectedOrg.terminologyList.parent_org.plural;
        this._subtabUsers.label = User.selectedOrg.terminologyList.user.plural;
        this._subtabUsers.alt = User.selectedOrg.terminologyList.user.plural;
        this._subtabUsers.desc = User.selectedOrg.terminologyList.user.plural;


        //Gather TABS permitted
        this._tabs = [];
        this._tabs.push(this._tabDashboard);

        if(User.selectedOrg.isRootAdmin && User.selectedOrg.isMasterAdmin){
            this._tabs.push(this._tabAccounts);
        }      

        if(User.selectedOrg.rgChecklists.canView || User.selectedOrg.rgMyChecklists.canView || User.selectedOrg.rgBroadcasts.canView || User.selectedOrg.rgEC.canView || User.selectedOrg.hasIncidentControl){
            this._tabs.push(this._tabER);     
            this._tabER.subItems = [];

            if(User.selectedOrg.hasIncidentControl){
                this._tabER.subItems.push(this._subtabEventMap);
            }

            if(User.selectedOrg.rgChecklists.canView || User.selectedOrg.rgMyChecklists.canView){
                this._tabER.subItems.push(this._subtabChecklist);
            }
            if(User.selectedOrg.rgEC.canView){
                this._tabER.subItems.push(this._subtabEC);
            }
            if(User.selectedOrg.rgBroadcasts.canView){
                this._tabER.subItems.push(this._subtabBroadcasts);
            }    
            if(User.selectedOrg.hasIncidentControl){
                this._tabER.subItems.push(this._subtabDrills);
            }    

        }

        if(User.selectedOrg.rgFloorPlans.canView || User.selectedOrg.rgERPs.canView){
            
            this._tabs.push(this._tabDocuments);
            this._tabDocuments.subItems = [];

            if(User.selectedOrg.rgERPs.canView){
                this._tabDocuments.subItems.push(this._subtabERPs);
            }
            if(User.selectedOrg.rgFloorPlans.canView){
                this._tabDocuments.subItems.push(this._subtabFloorPlans);
            }

        }
        
        if(User.selectedOrg.rgUsers.canView){
            this._tabs.push(this._tabSettings);
            this._tabSettings.subItems = [];

            if(User.selectedOrg.rgOrgSettings.canView){
                this._tabSettings.subItems.push(this._subtabGeneralSettings);
                this._tabSettings.subItems.push(this._subtabIntegrations);
            }

            if(User.selectedOrg.rgUsers.canView){
                this._tabSettings.subItems.push(this._subtabUsers);
            }



        }

    }

    _onToggleExpand=()=>{
        let value:boolean = !User.state.isDashboardExpanded;
        User.setDashboardExpanded(value);
        this.forceUpdate();
        
        window.clearTimeout(this._expandTimeoutID);
        this._expandTimeoutID = window.setTimeout(()=>{
            NextFrame(()=>{
                User.setDashboardExpandedComplete();
            });
        },DashboardView.EXPAND_TRANS_SPEED);
    }
    _onLogout=()=>{

        ConfirmOverlay.show("confirmLogout",()=>{
            
            const hideLoading = LoadingOverlay.show("logout","Logging Out","Loading...");
            Api.access.logout(($success:boolean, $results:any)=>{
                hideLoading();
                //yes this is weird, but the wrapper api fetcher will be redirect to login anyway if its unmounting
                if(!this._isUnmounting){
                    this.props.history.push(LoginView.PATH);
                }
            });
        },"Are you sure you want to Logout?","Confirm Logout","Logout","Cancel");

    }




    render() {

        let strCN:string = "";
        let strContentCN:string = "dashboardContent";

        let icon:object = chevronLeft;

        let strExpandToggle:string = "expandToggle";
        if(User.state.isDashboardExpanded){
            icon = menuIcon;
            strExpandToggle+=" expanded";
            strCN+=" expanded";
        }

        let canViewDocuments:boolean = false;
        if(User.selectedOrg.rgFloorPlans.canView || User.selectedOrg.rgERPs.canView){
            canViewDocuments=true;
        }
        let canViewSettings:boolean = false;
        if(User.selectedOrg.rgUsers.canView){
            canViewSettings=true;
        }

        
        let canViewAccounts:boolean = false;
        if(User.selectedOrg.isRootAdmin && User.selectedOrg.isMasterAdmin){
            canViewAccounts=true;
        }

        let canViewER:boolean=false;
        if(User.selectedOrg.rgChecklists.canView || User.selectedOrg.rgMyChecklists.canView || User.selectedOrg.rgBroadcasts.canView || User.selectedOrg.rgEC.canView || User.selectedOrg.hasIncidentControl){
            canViewER=true;
        }

        /*

                        {(User.selectedOrg.rgMyChecklists.canView || User.selectedOrg.rgChecklists.canView) && (
                            <Route path={ChecklistsView.PATH} component={ChecklistsView}/>  
                        )}
                        {User.selectedOrg.rgMyChecklists.canView && (
                            <Route path={ChecklistsView.PATH_USER} component={ChecklistsView}/>
                        )}
        */
        return (
            <UIView id={DashboardView.ID} extraClassName={strCN}>
                <DashboardSidebar
                    tabs={this._tabs.map(($value)=>{
                        let tabBarItem:UITabBarItem = {...$value};
                        if(User.state.isDashboardExpanded && $value.subItems){
                            //we delete the URL so when the TabBarItem Renderer renders it will be a div instead of a NavLink.
                            delete tabBarItem.url;
                        }
                        return tabBarItem;
                    })}
                    onLogout={this._onLogout}
                    onToggleExpand={this._onToggleExpand}
                />
                <div className={strContentCN} style={{transition:DashboardView.EXPAND_TRANS_CSS}}>
                    {!this.state.unmount && (
                    <Switch>    
                        <Route path={HomeView.PATH} component={HomeView}/>  
                        {canViewAccounts && (
                            <Route path={OrgsView.PATH} component={OrgsView}/> 
                        )}                        
                        {canViewDocuments && (
                            <Route path={DocumentsView.PATH} component={DocumentsView}/>
                        )}                        
                        {canViewSettings && (
                            <Route path={SettingsView.PATH} component={SettingsView}/>
                        )}         
                        {canViewER && (
                            <Route path={ERView.PATH} component={ERView}/>  
                        )}  
                        <Route path={MyAccountView.PATH} component={MyAccountView}/>  
                        <Redirect path="/" to={HomeView.PATH}/>
                    </Switch>  
                    )}
                </div>
                <UIIcon style={{transition:DashboardView.EXPAND_TRANS_CSS}} icon={icon} onClick={this._onToggleExpand} extraClassName={strExpandToggle} />
            </UIView>
        );
    }
}
