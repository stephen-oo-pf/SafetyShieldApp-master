import SavedData from "./SavedData";
import { dispatch } from "../dispatcher/Dispatcher";

import DashboardEvent from "../event/DashboardEvent";
import IRawOrganization, { assignOrgChildren, Organization, sortOrgs, sortOrgsIntoHierarchy as sortIntoOrgsHierarchy, IOrganizationType } from "./Organization";
import { IAccessToken, ITFA} from "../api/ApiAccessManager";
import IUserData, { IUserDataEmail, UserData } from "./UserData";
import IOpsRole from "./OpsRole";
import ISecRole from "./SecRole";
import OrgEvent from "../event/OrgEvent";
import { IAssetTypeData } from "./AssetData";
import {IIncidentTypeData, IIncidentStatusData, IIncidentReportData, IPerOrgPerTypeIncidentReportGroup, createPerOrgPerTypePendingIncidentReportGroups} from './IncidentData';
import { IErrorType } from "../api/Api";
import AlertOverlay from "../overlay/AlertOverlay";
import UIStatusBanner from "../ui/UIStatusBanner";
import { IECData } from "./ECData";
import ChecklistData from "./ChecklistData";
import { IAlertData, IAlert_ACTIVE_INCIDENT, IAlert_ASSIGNED_CHECKLIST, IAlert_CHECKLIST_NOTIFICATION, IAlert_INCIDENT_NOTIFICATION, IAlert_PENDING_INCIDENT_REPORT, IAlert_INCIDENT_REPORT_NOTIFICATION, ALERT_TYPE_ACTIVE_INCIDENT, ALERT_TYPE_ASSIGNED_CHECKLIST, ALERT_TYPE_CHECKLIST_NOTIFICATION, ALERT_TYPE_INCIDENT_NOTIFICATION, ALERT_TYPE_PENDING_INCIDENT_REPORTS, ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION, createIDFromAlerts_ACTIVE_INCIDENT, IAlert_SCHEDULED_DRILL, ALERT_TYPE_SCHEDULED_DRILL, createIDFromAlerts_SCHEDULED_DRILL } from "./AlertData";
import AppEvent from "../event/AppEvent";
import AppData from "./AppData";
import TimerUtil from "../util/TimerUtil";
import MapIncidentData from "./MapIncidentData";
import MapEvent from "../event/MapEvent";

interface IUserInfo{
    userId:string;
    firstName:string;
    lastName:string;
    createDts:string;
    firstLoginDts:string;
    lastLoginDts:string;
    passwordChangeRequired:boolean;    
    emails:IUserDataEmail[];
}

export interface IResultNotification{
    dataType:string;
    result:string;
    type:string;
    resultBold?:string;
    resultDate:number;
}


class UserState{

    hasAppIntroed:boolean=false;

    isLoggedIn:boolean=false;
    isDashboardExpanded:boolean=false;

    invitationId?:string;
    forgotPWId?:string;


    selectedOrg:Organization | null = null;
    userOrgsFlat:Organization[] = [];
    userOrgsHierarchy:Organization[] = [];
    userOrgsZSortedByActivityForMap:Organization[] = [];
    userOrgsHasIncidentControl:boolean=false;
    userOrgsHasMasterOrg:boolean=false;
    

    organizations:Organization[] = [];
    accounts:Organization[] = [];
    accessToken:IAccessToken | null = null;

    orgTypes:IOrganizationType[] = [];
    orgTypesAsUIOptions:{label:string, value:string}[] = [];
    
    tfa:ITFA | null = null;

    userInfo:IUserInfo | null = null;
    userPeopleData:IUserData | null = null;

    allPeopleData:UserData[] = [];

    allAssetTypes:IAssetTypeData[] = [];
    allIncidentTypes:IIncidentTypeData[] = [];
    
    incidentStatuses:IIncidentStatusData[] = [];
    incidentStatusesDate?:Date;
    incidentStatusesAsUIOptions:{label:string, value:string}[] = [];

    opsRoles:IOpsRole[] = [];
    opsRolesAsUIOptions:{label:string, value:string}[] = [];
    secRoles:ISecRole[] = [];
    secRolesAsUIOptions:{label:string, value:string}[] = [];

    resultNotification?:IResultNotification;
    errorResultNotification?:IResultNotification;

    alertsLastUpdate?:Date;
    alertsLastUpdateWithDataChange?:Date;

    alerts:IAlertData[] = [];

    alerts_ACTIVE_INCIDENT_ID:string = "";
    alerts_ACTIVE_INCIDENT:IAlert_ACTIVE_INCIDENT[] = [];
    alerts_ASSIGNED_CHECKLIST:IAlert_ASSIGNED_CHECKLIST[] = [];

    alerts_CHECKLIST_NOTIFICATION:IAlert_CHECKLIST_NOTIFICATION[] = [];
    alerts_INCIDENT_NOTIFICATION:IAlert_INCIDENT_NOTIFICATION[] = [];
    alerts_INCIDENT_REPORT_NOTIFICATION:IAlert_INCIDENT_REPORT_NOTIFICATION[] = [];
    alerts_SCHEDULED_DRILL:IAlert_SCHEDULED_DRILL[] = [];
    alerts_SCHEDULED_DRILL_ID:string = "";


    alerts_PENDING_INCIDENT_REPORT:IAlert_PENDING_INCIDENT_REPORT[] = []; //this is only used for badges
    
    pendingIncidentReports:IIncidentReportData[] = [];
    rolledIncidentReports:IIncidentReportData[] = [];

    perOrgPerTypePendingIncidentReportGroups:IPerOrgPerTypeIncidentReportGroup[] = [];

    mapIncidents:MapIncidentData[] = [];
    mapIncidents_ACTIVE_INCIDENTS:MapIncidentData[] = [];
    mapIncidents_INCIDENT_REPORTS:MapIncidentData[] = [];


    selectedMapIncident?:MapIncidentData;

    checkIncidentReports:boolean=false;
    canCheckForAlerts:boolean=true;


}

interface UserSavedData{
    rememberLogin:boolean;
    deviceId:string;
    userEmail:string;
}

class The_User{
    //State
    state:UserState;
    
    //Saved Data
    private _savedData:SavedData;

    //App Info
    isDebug:boolean=true;
    forcedLogoutError?:IErrorType;

    constructor(){
        this.state = new UserState();
        //default saved values
        let savedDefaults:UserSavedData = {
            rememberLogin:false,
            deviceId:"",
            userEmail:""
        }
        this._savedData = new SavedData("SafetyShield-02-10-2019__18-31",savedDefaults);
        
    }
    get selectedOrg():Organization{
        return this.state.selectedOrg!;
    }
    get savedData():UserSavedData{
        return this._savedData.data;
    }
    save=()=>{
        this._savedData.save();
    }
    setRememberMe=($value:boolean)=>{
        this.savedData.rememberLogin = $value;
        this.save();
    }
    setDeviceId=($value:string)=>{
        this.savedData.deviceId = $value;
        this.save();
    }
    setUserEmail=($userEmail:string)=>{
        this.savedData.userEmail = $userEmail;
        this.save();
    }



    /*
    SET FUNCTIONS
    */
    setAppHasIntroed=()=>{
        this.state.hasAppIntroed=true;
    }
    
    setInvitationId=($id?:string)=>{
        this.state.invitationId=$id;
    }
    
    setForgotPWId=($id?:string)=>{
        this.state.forgotPWId=$id;
    }
    setLoggedIn=()=>{
        this.state.isLoggedIn=true;
    }
    setLoggedOut=()=>{
        this.state = new UserState();
    }
    setForcedLogout=($error:IErrorType)=>{
        this.forcedLogoutError = $error;

        AlertOverlay.show("forcedLogout",$error.desc,"Ok");

        this.setLoggedOut();
    }
    setAccessInfo=($accessInfoData:any)=>{
        this.setAccessToken($accessInfoData.accessToken);
        this.setUserInfo($accessInfoData.user);
        this.setUserOrgs($accessInfoData.organizations);
    }
    setTFAInfo=($tfaInfoData:any)=>{
        //action  $tfaInfoData.action==="tfa"
        this.state.tfa = $tfaInfoData.tfa;
    }
    setAccessToken=($accessToken:IAccessToken)=>{
        this.state.accessToken = $accessToken;
    }


    setUserInfo=($userInfo:IUserInfo)=>{
        this.state.userInfo = $userInfo;
    }
    setErrorResultNotification=($dataType:string, $result:string)=>{
        this.state.errorResultNotification = {
            dataType:$dataType,
            type:UIStatusBanner.STATUS_ERROR,
            result:$result,
            resultDate:Date.now()
        };
    }
    setResultNotification=($dataType:string, $type:string, $result:string, $resultBold:string)=>{
        this.state.resultNotification = {
            dataType:$dataType,
            type:$type,
            result:$result,
            resultBold:$resultBold,
            resultDate:Date.now()
        };
    }
    setSuccessEditedNotification=($dataType:string, $singularType:string, $name:string)=>{
        this.setSuccessNotification($dataType,"edited",$singularType,$name);
    }
    setSuccessAddedNewNotification=($dataType:string, $singularType:string, $name:string)=>{
        this.setSuccessNotification($dataType,"added new",$singularType,$name);
    }
    setSuccessNotification=($dataType:string, $action:string, $singularType:string, $resultBold:string)=>{
        this.setResultNotification($dataType, UIStatusBanner.STATUS_SUCCESS,"Successfully "+$action+" "+$singularType, $resultBold);
    }
    checkResultNotification=($datatype:string,$action:($notification:IResultNotification)=>void)=>{
        if(this.state.resultNotification && this.state.resultNotification.dataType===$datatype){
            $action(this.state.resultNotification);
            this.state.resultNotification = undefined;
        }
    }
    checkErrorResultNotification=($datatype:string,$action:($notification:IResultNotification)=>void)=>{
        if(this.state.errorResultNotification && this.state.errorResultNotification.dataType===$datatype){
            $action(this.state.errorResultNotification);
            this.state.errorResultNotification = undefined;
        }
    }
    


    setUserOrgs=($orgs:IRawOrganization[])=>{

        let doesAnyOrgHaveIncidentControl:boolean=false;
        let isAnyOrgAMasterOrg:boolean=false;


        //map raw to class... and use the loop for other stuff too!
        let arrOrgs:Organization[] = $orgs.map(($value)=>{
            let org:Organization = new Organization();
            org.populate($value);

            if(org.hasIncidentControl){
                doesAnyOrgHaveIncidentControl=true;
            }
            if(org.isMasterAdmin){
                isAnyOrgAMasterOrg=true;
            }
            return org;
        }).sort(sortOrgs);

        this.state.userOrgsFlat = arrOrgs;
        this.state.userOrgsHasIncidentControl = doesAnyOrgHaveIncidentControl;
        this.state.userOrgsHasMasterOrg = isAnyOrgAMasterOrg;

        this.state.userOrgsHierarchy = sortIntoOrgsHierarchy(arrOrgs);

        if(this.state.selectedOrg){
            //if it does exist, it means its from the previous data and we need to find its match in the new data
            
            let existingOrgFromNewData = arrOrgs.find(($org)=>{
                let match:boolean=false;
                if(this.state.selectedOrg && this.state.selectedOrg.orgId===$org.orgId){
                    match=true;
                }
                return match;
            });
            if(existingOrgFromNewData){
                this.state.selectedOrg = existingOrgFromNewData;
            }else{
                //if we are here, that means the selected org before the last validateToken happened is no longer in the list of user orgs... something bad probably happened
                //to keep things from not breaking, we select the first org.
                
                this.state.selectedOrg = this.state.userOrgsHierarchy[0];
            }

        }else{
            //this happens on fresh login.
            this.state.selectedOrg = this.state.userOrgsHierarchy[0];
        }
        
        this.applySelectedOrgTerminology();
        this.applyAlertsToOrgs();

    }
    setAllOrgs=($orgs:IRawOrganization[])=>{


        let countAccounts:number=0;
        let countOrgs:number=0;
        let arrOrgs:Organization[] = $orgs.map(($value,$index)=>{
            let org:Organization = new Organization();
            org.populate($value);
            if(org.isAccount){
                countAccounts++;
            }else{
                countOrgs++;
            }
            return org;
        }).sort(sortOrgs);

        assignOrgChildren(arrOrgs);

        this.state.organizations = arrOrgs;

        let arrAccounts:Organization[] = arrOrgs.filter(($value)=>{
            return $value.isAccount;
        });

        this.state.accounts = arrAccounts;
    }

    setSelectedOrganizationById=($orgId:string)=>{
        
        let org = this.state.userOrgsFlat.find(($value)=>{
            return $orgId===$value.orgId;
        })
        if(org){
            this.setSelectedOrganization(org);
        }
    }
    setSelectedOrganization=($value:Organization | null)=>{
        this.state.selectedOrg = $value;
        this.applySelectedOrgTerminology();
        dispatch(new OrgEvent(OrgEvent.ORG_SELECTED));
    }
    applySelectedOrgTerminology=()=>{
        //Terminology Changes based on selected ORG
        let termList = this.selectedOrg.terminologyList;
        ChecklistData.SET_CHECKLIST_TERMINOLOGY(termList.parent_org.singular,termList.child_org.singular,termList.child_org.plural);
        
    }

    setUserPeopleData=($value:IUserData)=>{
        this.state.userPeopleData = $value;
    }

    setAllPeopleData=($value:UserData[])=>{
        this.state.allPeopleData = $value;
    }
    setOpsRoles=($value:IOpsRole[])=>{
        this.state.opsRoles = $value;
        
        
        let options = $value.filter(($opsRole)=>{
            let isOk:boolean=false;
            if($opsRole.orgTypeId==="" || $opsRole.orgTypeId===null){
                isOk=true;
            }
            if(this.selectedOrg.orgTypeId===$opsRole.orgTypeId){
                isOk=true;
            }
            return isOk;
        });

        let uiOptions = options.map(($value)=>{
            return {
                label:$value.opsRole,
                value:$value.opsRoleId
            }
        });
        uiOptions.unshift({
            label:"Select",
            value:""
        });
        this.state.opsRolesAsUIOptions = uiOptions;
    }
    setSecRoles=($roles:ISecRole[])=>{
        this.state.secRoles = $roles;


        let uiOptions = $roles.filter(($role)=>{
            let isOk:boolean=false;

            if(this.selectedOrg.secRole){
                let orgSecRole = this.selectedOrg.secRole;
                let numOrgPriority:number = Number(orgSecRole.priority);
                let numPriority:number = Number($role.priority);

                if(numOrgPriority>numPriority || (numOrgPriority===numPriority && AppData.config.general.user_edit_same_permission==="Y")){
                    isOk=true;
                }

                if(isOk){
                    if($role.rootFlag){
                        isOk=false;
                    }
                }
            }

            return isOk;
        }).map(($value)=>{
            return {
                label:$value.secRole,
                value:$value.secRoleId
            }
        });
        uiOptions.unshift({
            label:"Select",
            value:""
        });
        this.state.secRolesAsUIOptions = uiOptions;
    }
    setOrgTypes=($value:IOrganizationType[])=>{
        this.state.orgTypes = $value;

        let uiOptions = $value.filter(($value)=>{
            let isOk:boolean=true;
            if($value.hasOwnProperty("hiddenFlag") && $value.hiddenFlag===1){
                isOk=false;
            }
            return isOk;
        }).map(($value)=>{
            return {
                label:$value.orgType,
                value:$value.orgTypeId
            }
        });
        uiOptions.unshift({
            label:"Select",
            value:""
        });

        this.state.orgTypesAsUIOptions = uiOptions;
    }

    setAssetTypes=($value:IAssetTypeData[])=>{
        this.state.allAssetTypes = $value;
    }
    setIncidentTypes=($value:IIncidentTypeData[])=>{
        this.state.allIncidentTypes = $value;
    }
    setIncidentStatuses=($statuses:IIncidentStatusData[])=>{
        this.state.incidentStatuses = $statuses;
        this.state.incidentStatusesDate = new Date();


        let uiOptions = $statuses.filter(($value)=>{
            return $value.canBroadcastFlag;
        }).map(($value)=>{
            return {
                label:$value.incidentStatus,
                value:$value.incidentStatusId
            }
        });
        
        uiOptions.unshift({
            label:"Select",
            value:""
        });

        this.state.incidentStatusesAsUIOptions = uiOptions;
    }

    setUserSettings=($value:any)=>{

    }


    setDashboardExpanded=($value:boolean)=>{
        this.state.isDashboardExpanded = $value;
        dispatch(new DashboardEvent(DashboardEvent.DASHBOARD_EXPAND_TOGGLED));
    }
    setDashboardExpandedComplete=()=>{
        dispatch(new DashboardEvent(DashboardEvent.DASHBOARD_EXPAND_TOGGLED_COMPLETE));
    }
    
    setCanCheckForAlerts=($value:boolean)=>{
        this.state.canCheckForAlerts=$value;
        if($value){
            dispatch(new AppEvent(AppEvent.RESUME_CHECKING_ALERTS));
        }
    }

    setCurOrgEC=($value:IECData)=>{
        this.selectedOrg.setECData($value);
    }
    setCurOrgBroadcasts=($value:any)=>{
        this.selectedOrg.setBroadcasts($value);
    }
    setCurOrgBroadcastList=($value:any)=>{
        this.selectedOrg.setBroadcastList($value);
    }

    getOrgRights=()=>{
        return this.selectedOrg.userRights!;
    }


    setAlerts=($value:IAlertData[])=>{
        this.state.alertsLastUpdate = new Date();
        this.state.alerts = $value;

        let activeIncidents:IAlert_ACTIVE_INCIDENT[] = [];
        let assignedChecklists:IAlert_ASSIGNED_CHECKLIST[] = [];
        let checklistNotifications:IAlert_CHECKLIST_NOTIFICATION[] = [];
        let incidentNotifications:IAlert_INCIDENT_NOTIFICATION[] = [];
        let pendingIncidentReports:IAlert_PENDING_INCIDENT_REPORT[] = [];
        let incidentReportNotifications:IAlert_INCIDENT_REPORT_NOTIFICATION[] = [];
        let scheduledDrills:IAlert_SCHEDULED_DRILL[] = [];

        $value.forEach(($alert)=>{
            switch($alert.alertType){
                case ALERT_TYPE_ACTIVE_INCIDENT:
                    activeIncidents.push($alert as IAlert_ACTIVE_INCIDENT);
                break;
                case ALERT_TYPE_ASSIGNED_CHECKLIST:
                    assignedChecklists.push($alert as IAlert_ASSIGNED_CHECKLIST);
                break;
                case ALERT_TYPE_CHECKLIST_NOTIFICATION:
                    checklistNotifications.push($alert as IAlert_CHECKLIST_NOTIFICATION);
                break;
                case ALERT_TYPE_INCIDENT_NOTIFICATION:
                    incidentNotifications.push($alert as IAlert_INCIDENT_NOTIFICATION);
                break;
                case ALERT_TYPE_PENDING_INCIDENT_REPORTS:
                    pendingIncidentReports.push($alert as IAlert_PENDING_INCIDENT_REPORT);
                break;   
                case ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION:
                    incidentReportNotifications.push($alert as IAlert_INCIDENT_REPORT_NOTIFICATION);
                break;        
                case ALERT_TYPE_SCHEDULED_DRILL:
                    scheduledDrills.push($alert as IAlert_SCHEDULED_DRILL);
                break;             
            }
        });

        this.state.alerts_ACTIVE_INCIDENT = activeIncidents;

        let idForAlerts_ACTIVE_INCIDENT = createIDFromAlerts_ACTIVE_INCIDENT(activeIncidents);
        if(this.state.alerts_ACTIVE_INCIDENT_ID!==idForAlerts_ACTIVE_INCIDENT){
            this.state.alerts_ACTIVE_INCIDENT_ID = idForAlerts_ACTIVE_INCIDENT;
            this.state.alertsLastUpdateWithDataChange = new Date();
        }

        this.state.alerts_ASSIGNED_CHECKLIST = assignedChecklists;
        this.state.alerts_CHECKLIST_NOTIFICATION = checklistNotifications;
        this.state.alerts_INCIDENT_NOTIFICATION = incidentNotifications;
        this.state.alerts_PENDING_INCIDENT_REPORT = pendingIncidentReports;
        this.state.alerts_INCIDENT_REPORT_NOTIFICATION = incidentReportNotifications;
        this.state.alerts_SCHEDULED_DRILL = scheduledDrills;

        let idForAlerts_SCHEDULED_DRILL = createIDFromAlerts_SCHEDULED_DRILL(scheduledDrills);
        if(this.state.alerts_SCHEDULED_DRILL_ID!==idForAlerts_SCHEDULED_DRILL){
            this.state.alerts_SCHEDULED_DRILL_ID = idForAlerts_SCHEDULED_DRILL;
            this.state.alertsLastUpdateWithDataChange = new Date();
        }

        this.applyAlertsToOrgs();
        this.setupMapData();

        dispatch(new AppEvent(AppEvent.ALERTS_UPDATE));
    }

    setupMapData=()=>{

        //prepare the current data to recieve a new proof of existance
        this.state.mapIncidents.forEach(($mapIncident)=>{
            $mapIncident.setProofOfExistence(false);
        });


        
        //compare the active incidents
        this.state.alerts_ACTIVE_INCIDENT.forEach(($activeIncident)=>{    

            let existingMapIncident = this.state.mapIncidents.find(($incident)=>{
                let match:boolean=false;
                if($incident.dataActiveIncident && $incident.dataActiveIncident.incidentId===$activeIncident.incidentId){
                    match=true;
                }
                return match;
            });

            if(existingMapIncident){
                existingMapIncident.populateWithActiveIncident($activeIncident);
                existingMapIncident.resetChildMapReports();
            }else{
                let mapDataItem:MapIncidentData = new MapIncidentData();
                mapDataItem.populateWithActiveIncident($activeIncident);
                this.state.mapIncidents.push(mapDataItem);
                this.state.mapIncidents_ACTIVE_INCIDENTS.push(mapDataItem);
            }            
        });


        //helper for the following
        const findExistingMapIncidentWithReport=($incidentReport:IIncidentReportData)=>{
            return this.state.mapIncidents.find(($incident)=>{
                let match:boolean=false;
                if($incident.dataIncidentReport && $incident.dataIncidentReport.incidentReportId===$incidentReport.incidentReportId){
                    match=true;
                }
                return match;
            })
        }
        
        //compare the pending incident reports
        this.state.pendingIncidentReports.forEach(($incidentReport)=>{
            let existingMapIncident = findExistingMapIncidentWithReport($incidentReport);
            if(existingMapIncident){
                existingMapIncident.populateWithPendingIncidentReport($incidentReport);
            }else{
                let mapDataItem:MapIncidentData = new MapIncidentData();
                mapDataItem.populateWithPendingIncidentReport($incidentReport);
                this.state.mapIncidents.push(mapDataItem);
                this.state.mapIncidents_INCIDENT_REPORTS.push(mapDataItem);
            }
        });


        //compare the rolled incident reports
        this.state.rolledIncidentReports.forEach(($incidentReport)=>{

            //we don't allow the incident reports that match an exact active incident's lat/lon, because it would be permanently behind it.
            let canUse:boolean=true;
            let reportLat:number = 0;
            let reportLng:number = 0;
            if($incidentReport.reportingDeviceInfo?.device_info?.length){
                if($incidentReport.reportingDeviceInfo.device_info.length>0){
                    reportLat = $incidentReport.reportingDeviceInfo.device_info[0].latitude;
                    reportLng = $incidentReport.reportingDeviceInfo.device_info[0].longitude;
                }
            }

            let existingMatchMapActiveIncident:MapIncidentData | undefined = undefined;
            let existingExactMatchMapActiveIncident:MapIncidentData | undefined = undefined;
            
            
            this.state.mapIncidents.forEach(($incident)=>{
                
                if($incident.id===$incidentReport.incidentId){
                    existingMatchMapActiveIncident = $incident;

                    if($incident.lat===reportLat && $incident.lng===reportLng){
                        existingExactMatchMapActiveIncident = $incident;
                    }
                }
            });
            if(existingExactMatchMapActiveIncident){
                canUse=false;
            }


            if(canUse){
                let mapDataItem:MapIncidentData
                let existingMapIncident = findExistingMapIncidentWithReport($incidentReport);
                if(existingMapIncident){
                    mapDataItem = existingMapIncident;
                    mapDataItem.populateWithRolledIncidentReport($incidentReport);
    

                }else{
                    mapDataItem = new MapIncidentData();
                    mapDataItem.populateWithRolledIncidentReport($incidentReport);
                    this.state.mapIncidents.push(mapDataItem);
                    this.state.mapIncidents_INCIDENT_REPORTS.push(mapDataItem);
                }


                if(existingMatchMapActiveIncident){
                    mapDataItem.setParentMapReport(existingMatchMapActiveIncident!);
                    existingMatchMapActiveIncident!.addChildMapReport(mapDataItem);
                }

            }

        });



        //now remove items that have no proof they exist
        this.state.mapIncidents = this.state.mapIncidents.filter(($mapIncident)=>{
            let stillExists:boolean = $mapIncident.proofOfExistence;
            if(!stillExists){
                //if we are removing, lets check if its the selected and clear it
                if($mapIncident===this.state.selectedMapIncident){
                    this.setSelectedMapIncident(undefined);
                }
            }
            return stillExists;
        });
        //also for each specific type 
        this.state.mapIncidents_ACTIVE_INCIDENTS = this.state.mapIncidents_ACTIVE_INCIDENTS.filter($mapIncident=>$mapIncident.proofOfExistence);
        this.state.mapIncidents_INCIDENT_REPORTS = this.state.mapIncidents_INCIDENT_REPORTS.filter($mapIncident=>$mapIncident.proofOfExistence);


        const sortMapIncidents = ($incidentA:MapIncidentData,$incidentB:MapIncidentData)=>{
            if($incidentA.datetime===$incidentB.datetime){
                return 0;
            }else if($incidentA.datetime>$incidentB.datetime){
                return -1;
            }else{
                return 1;
            }
        }


        //sort the remaining (this is for the list on the right)
        this.state.mapIncidents.sort(sortMapIncidents);
        


        //now we also sort for the map markers... this is a helper function used below
        const sortMapIncidentOnLat = ($mapIncidentA:MapIncidentData, $mapIncidentB:MapIncidentData)=>{
            let a = $mapIncidentA.lat;
            let b = $mapIncidentB.lat;

            if(a===b){
                return 0
            }else if(a>b){
                return -1;
            }else{
                return 1;
            }
        }

        //now sort each group type based on latitude
        this.state.mapIncidents_INCIDENT_REPORTS.sort(sortMapIncidentOnLat);
        this.state.mapIncidents_ACTIVE_INCIDENTS.sort(sortMapIncidentOnLat);


        
        let zIndex:number=1;
        //reports first
        this.state.mapIncidents_INCIDENT_REPORTS.forEach(($mapIncident)=>{
            $mapIncident.setMapZIndex(zIndex);
            zIndex++;
        });

        //active goes last to ensure on top
        this.state.mapIncidents_ACTIVE_INCIDENTS.forEach(($mapIncident)=>{
            $mapIncident.setMapZIndex(zIndex);
            zIndex++;
        });

    }



    applyAlertsToOrgs=()=>{


        //now assign to orgs
        User.state.userOrgsFlat.forEach(($org)=>{
            let orgActiveIncidents = this.state.alerts_ACTIVE_INCIDENT.filter(($alert)=>{
                return $alert.orgId===$org.orgId;
            });
            let orgAssignedChecklists = this.state.alerts_ASSIGNED_CHECKLIST.filter(($alert)=>{
                return $alert.orgId===$org.orgId;
            });
            let orgPendingIncidentReports = this.state.alerts_PENDING_INCIDENT_REPORT.filter(($alert)=>{
                return $alert.orgId===$org.orgId;
            });
            let orgScheduledDrills = this.state.alerts_SCHEDULED_DRILL.filter(($alert)=>{
                return $alert.orgId===$org.orgId;
            });
            $org.setAlerts(orgActiveIncidents,orgAssignedChecklists,orgPendingIncidentReports,orgScheduledDrills);
        });


        //now lets sort orgs based on alerts
        let orgsSortedByLat = [...User.state.userOrgsFlat].sort(($orgA,$orgB)=>{
            let a = 0;
            let b = 0;

            if($orgA.primaryAddress?.lat){
                a = $orgA.primaryAddress.lat;
            }
            if($orgB.primaryAddress?.lat){
                b = $orgB.primaryAddress.lat;
            }

            if(a===b){
                return 0
            }else if(a>b){
                return -1;
            }else{
                return 1;
            }

        });
        
        //seperate out the orgs by alert type so we can layer them on the map properly with zindex
        let orgsWithActiveIncidents:Organization[] = [];
        let orgsWithReportedIncidents:Organization[] = [];
        let orgsRemaining:Organization[] = [];

        orgsSortedByLat.forEach(($org)=>{
            if($org.alerts_ACTIVE_INCIDENT.length>0){
                orgsWithActiveIncidents.push($org);
            }else{
                if($org.alerts_PENDING_INCIDENT_REPORT.length>0){
                    orgsWithReportedIncidents.push($org);
                }else{
                    orgsRemaining.push($org);
                }
            }
        });

        let orgsOrdered = [...orgsRemaining, ...orgsWithReportedIncidents, ...orgsWithActiveIncidents];

        this.state.userOrgsZSortedByActivityForMap = orgsOrdered;
    }

    setCheckIncidentReports=($value:boolean)=>{

        if(User.state.userOrgsHasIncidentControl){

            TimerUtil.clearDebounce("stopCheckingIncidentReports");
            if($value){
                this.state.checkIncidentReports = $value;
            }else{
                TimerUtil.debounce("stopCheckingIncidentReports",()=>{
                    this.state.checkIncidentReports = $value;
                });
            }        
        }

    }
    setPendingIncidentReports=($pending:IIncidentReportData[])=>{
        this.state.pendingIncidentReports = $pending;
        this.state.perOrgPerTypePendingIncidentReportGroups = createPerOrgPerTypePendingIncidentReportGroups($pending);
    }

    setRolledIncidentReports=($rolled:IIncidentReportData[])=>{        
        this.state.rolledIncidentReports = $rolled;
    }



    setSelectedMapIncident=($newMapIncident?:MapIncidentData)=>{

        let change:boolean=false;
        if(this.state.selectedMapIncident){
            this.state.selectedMapIncident.setSelected(false);
            change=true;
        }

        this.state.selectedMapIncident = $newMapIncident;

        if(this.state.selectedMapIncident){
            this.state.selectedMapIncident.setSelected(true);
            change=true;
        }
        
        if(change){
            dispatch(new MapEvent(MapEvent.MAP_INCIDENT_SELECTED_CHANGE));
        }

    }
    

}




const User:The_User = new The_User();
export default User;
