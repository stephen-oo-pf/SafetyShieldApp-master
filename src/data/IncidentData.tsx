import React from 'react';

import gunIcon          from '@iconify/icons-whh/gun';
import sprayIcon        from '@iconify/icons-mdi/spray';
import questionMark     from '@iconify/icons-emojione-monotone/question-mark';
import weatherHurricane from '@iconify/icons-mdi/weather-hurricane';
import tornadoIcon      from '@iconify/icons-emojione-monotone/tornado';
import fireIcon         from '@iconify/icons-mdi/fire';
import biohazardIcon    from '@iconify/icons-mdi/biohazard';
import bombIcon         from '@iconify/icons-mdi/bomb';
import clipboardList    from '@iconify/icons-mdi/clipboard-list';
import boltSlash        from '@iconify/icons-uil/bolt-slash';
import crosshairs       from '@iconify/icons-fa/crosshairs';
import User from './User';
import { ITimelineItem } from '../ui/UITimeline';
import { getOpsRole } from './OpsRole';
import { IAlert_ACTIVE_INCIDENT, ALERT_TYPE_PENDING_INCIDENT_REPORTS, ALERT_TYPE_ACTIVE_INCIDENT } from './AlertData';


export interface IGetIncidentResponse{
    checklists:IIncidentChecklist[];
    incident:IIncidentData;
    reports:IIncidentReportData[];
    statusChanges:IIncidentStatusChangeData[];
}


export interface IIncidentTypeData{
    incidentTypeId:string;
    incidentType:string;
    description:string;
    iconInfo:string;
    colorInfo:{
        backgroundColor:string;
        textColor:string;
    }
    styleInfo:string;//not used
    sequenceNumber:number;
}

export const INCIDENT_STATUS_TYPE_CLOSED:string = "ended";
export const INCIDENT_STATUS_TYPE_TRIGGERED:string = "triggered";
export const INCIDENT_STATUS_TYPE_ACTIVE:string = "active";

export class IncidentType{
    static FIRE:string = "fire";
    static GUN_THREAT:string = "gun-threat";
    static HAZARD:string = "hazard";
    static TORNADO:string = "tornado";
    static TSUNAMI:string = "tsunami";
}





export interface IIncidentStatusData{
    incidentStatusId:string;
    incidentStatus:string;
    activeIncidentFlag:number;
    canBroadcastFlag?:boolean;    
}

export interface IReportingDeviceInfo{
    accuracy_ring_radius:number;
    altitude:number;
    bearing:number;
    latitude:number;
    longitude:number;
    source:string;
    speed:number;
    timestamp:number;
}

export const ALERT_ALT_TYPE_INCIDENT_REPORT_DATA = "incidentReportData";
export const ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA = "rolledIncidentReportData";


export interface IIncidentReportData{
    autoTriggerResponse:boolean;
    comments:string | null;
    createDts:number;
    createUserId:string;
    description:string;//maybe null?
    dismissReason:string | null;
    incidentId?:string;
    incidentReportId:string;
    incidentReportStatus:string;
    incidentReportStatusId:string;
    incidentTypeId:string;
    isDrill:boolean;
    opsRole:string;
    reportingDeviceInfo?:{
        device_info?:IReportingDeviceInfo[]
    }
    title:string;
    updateDts:number | null;
    updateUserId:string | null;
    userEmail:string;
    
    createUserName:string;
    orgId:string;
    orgName:string;
    elapsedTime:number;
}

export interface IPerOrgPerTypeIncidentReportGroup{
    orgId:string;
    orgName:string;
    incidentTypeId:string;
    reports:IIncidentReportData[];
    datetime:number;
    /** 
     * not used...this is to help be compatible with other interfaces during union
    */
    description?:string;    
    /** 
     * not used...this is to help be compatible with other interfaces during union
    */
    incidentId?:string;
}



export interface IIncidentData{
    autoTriggered:boolean; //but a boolean?
    createDts:number;
    createUserId:string;
    createOpsRole:string;
    createUserName:string;
    description:string;
    elapsedTime:number;
    incidentId:string;
    incidentReportId:string;
    incidentStatusDts:number | null;
    incidentStatusId:string;
    incidentStatus:string;
    incidentType:string;
    incidentTypeId:string;
    isDrill:boolean; //but a boolean?
    orgName:string;
    reportingDeviceInfo:string;
    title:string;
    updateDts:number | null;
    updateUserId:string | null;

}

export interface IIncidentStatusChangeData{
    createDts:number;
    createUserId:string;
    createUserName:string;
    description:string | null;
    incidentId:string;
    incidentStatusChangeId:string;
    newIncidentStatusId:string;
    oldIncidentStatusId:string;
    updateDts:number | null;
    opsRoleId:string | null;
}

export interface IIncidentChecklist{
    checklist:string;
    checklistId:string;
    firstAssignedDts:number;
    orgId:string;
    opsRoleId?:string;
    stats:IIncidentChecklistStatus[];
}

export interface IIncidentChecklistStatus{
    canBeCompleted:boolean;
    checklistStatus:string;
    checklistStatusId:string;
    count:number;
}
export interface IIncidentChecklistUserChecklist{
    checklist:string;
    status:string;
    userName:string;
    checklistItems:IIncidentChecklistUserChecklistItem[];
}
export interface IIncidentChecklistUserChecklistItem{
    checklistItem:string;
    comment:string | null;
    doneDts:number | null;
    doneFlag:boolean;
    sequenceNumber:number;
    updateDts:number | null;
}

export function getIncidentStatusById($id:string){
    return User.state.incidentStatuses.find(($value)=>{
        return $value.incidentStatusId===$id;
    });
}

export function getIncidentTypeById($id:string){
    return User.state.allIncidentTypes.find(($value)=>{
        return $value.incidentTypeId===$id;
    });
}
export function getIncidentTypeByLabel($label:string){
    return User.state.allIncidentTypes.find(($value)=>{
        return $value.incidentType==$label;
    });
}

export function countIncidentChecklistStats($data:IIncidentChecklist){

    let numTotal:number=0;
    let numStarted:number=0;
    let numComplete:number=0;
    $data.stats.forEach(($statItem)=>{
        numTotal+=$statItem.count;
        switch($statItem.checklistStatusId){
            case "P"://NOT STARTED

            break;
            case "I"://INPROGRESS
            numStarted+=$statItem.count

            break;
            case "C"://COMPLETE
            numComplete+=$statItem.count;

            break;
        }
        
    });

    return {
        total:numTotal,
        started:numStarted,
        
        completed:numComplete,
    }
}

/**
 * Sort data into an array of a new type only used for the EventsListWidget (for now) "IPerOrgIncidentType".
 * Each item has a unique incidentType AND orgId... it contains a reports array of all incident Reports that match that incidentType AND orgId
 * @param $reports IIncidentReportData[]
 */
export function createPerOrgPerTypePendingIncidentReportGroups($reports:IIncidentReportData[]):IPerOrgPerTypeIncidentReportGroup[]{

    let dataPerOrgIncidentTypes:IPerOrgPerTypeIncidentReportGroup[] = $reports.reduce(($prev:IPerOrgPerTypeIncidentReportGroup[],$current)=>{
        let match = $prev.find(($reportPerOIT)=>{
            let isMatch:boolean=false;
            if($reportPerOIT.orgId===$current.orgId && $reportPerOIT.incidentTypeId===$current.incidentTypeId){
                isMatch=true;
            }
            return isMatch;
        });
        if(match){
            //exists
            match.reports.push($current);                            
        }else{
            //new
            $prev.push({
                orgName:$current.orgName,
                orgId:$current.orgId,
                datetime:0,
                reports:[$current],
                incidentTypeId:$current.incidentTypeId
            });
        }
        return $prev
    },[]);

    //now sort the items individual reports
    dataPerOrgIncidentTypes.forEach(($data)=>{
        $data.reports.sort(($reportA,$reportB)=>{
            let a:number=0;
            if($reportA.createDts){
                a = $reportA.createDts;
                if($reportA.updateDts){
                    a = $reportA.updateDts;
                }
            }
            let b:number=0;
            if($reportB.createDts){
                b = $reportB.createDts;
                if($reportB.updateDts){
                    b = $reportB.updateDts;
                }
            }

            if(a===b){
                return 0;
            }else if(a>b){
                return 1;
            }else{
                return -1;
            }
        });

        let latestReport = $data.reports[0];
        let latestReportTime = 0;
        if(latestReport.createDts){
            latestReportTime = latestReport.createDts;
            if(latestReport.updateDts){
                latestReportTime = latestReport.updateDts;
            }
        }
        $data.datetime = latestReportTime;
    });

    //now sort items baed on elapsedTime
    dataPerOrgIncidentTypes.sort(($perA,$perB)=>{
        if($perA.datetime===$perB.datetime){
            return 0
        }else if($perA.datetime>$perB.datetime){
            return 1
        }else{
            return -1;
        }
    });

    return dataPerOrgIncidentTypes;

}


export function generateTimelineFromIncident($getincidentres:IGetIncidentResponse):ITimelineItem[]{
    let timeline:ITimelineItem[] = [];
    

    //Event Reported
    if($getincidentres.reports &&  $getincidentres.reports.length>0){

        let report:IIncidentReportData = $getincidentres.reports[0];
        
        let reported:ITimelineItem = {
            date:new Date(Number(report.createDts)*1000),
            title:"Event Reported",
            value:(
                <>
                    {$getincidentres.reports.length} Report{$getincidentres.reports.length>1?"s":""} received for Event
                </>
            )
        }

        timeline.unshift(reported);

    }

    let triggeredStatus = $getincidentres.statusChanges.find(($status)=>{return $status.newIncidentStatusId===INCIDENT_STATUS_TYPE_TRIGGERED});
    let closedStatus = $getincidentres.statusChanges.find(($status)=>{return $status.newIncidentStatusId===INCIDENT_STATUS_TYPE_CLOSED});
    let activeStatus = $getincidentres.statusChanges.find(($status)=>{return $status.newIncidentStatusId===INCIDENT_STATUS_TYPE_ACTIVE});


    //Event Triggered
    
    if(triggeredStatus){


        let strOpsRole:string = "";
        if(triggeredStatus.opsRoleId){
            let opsRole = getOpsRole(triggeredStatus.opsRoleId, User.state.opsRoles);
            if(opsRole){
                strOpsRole = " ("+opsRole.opsRole+")";
            }
        }

        let triggeredDesc:string = triggeredStatus.createUserName+strOpsRole+" triggered an event of type '"+$getincidentres.incident.incidentType+"'";

        if(triggeredStatus.description){
            triggeredDesc+=" with the comments: “"+triggeredStatus.description+"”";
        }else{
            triggeredDesc+=".";
        }

        
        let triggered:ITimelineItem = {
            date:new Date(Number(triggeredStatus.createDts)*1000),
            title:"Event Triggered",
            value:triggeredDesc
        }
        timeline.unshift(triggered);
        
    }

    let checklistFirstAssignedDts:number = -1;
    let checklistAssignedCount:number = $getincidentres.checklists.reduce(($prev,$checklist)=>{

        let checklistCount:number=countIncidentChecklistStats($checklist).total;

        if(checklistFirstAssignedDts===-1){
            checklistFirstAssignedDts=$checklist.firstAssignedDts;
        }

        return $prev+checklistCount;
    },0);
    
    if(checklistAssignedCount>0){

        //Checklists Assigned
        let checklistsAssigned:ITimelineItem = {
            date:new Date(Math.abs(checklistFirstAssignedDts)*1000),
            title:"Checklists Assigned",
            value:checklistAssignedCount+" checklists have been assigned"
        }
        timeline.unshift(checklistsAssigned);

    }


    if(closedStatus){


        let strOpsRole:string = "";
        if(closedStatus.opsRoleId){
            let opsRole = getOpsRole(closedStatus.opsRoleId, User.state.opsRoles);
            if(opsRole){
                strOpsRole = " ("+opsRole.opsRole+")";
            }
        }

        let dateClosed:Date = new Date(Number(closedStatus.createDts)*1000);

        let closedDesc:string = closedStatus.createUserName+strOpsRole+" closed the event";
        if(closedStatus.description){
            closedDesc = closedStatus.description;
            closedDesc+=" with the comments: “"+closedStatus.description+"”"

        }else{
            closedDesc+=".";
        }

        let eventClosed:ITimelineItem = {
            date:dateClosed,
            title:"Event Closed",
            value:closedDesc
        }
    
        timeline.unshift(eventClosed);
    }
    



    return timeline;
}





export function getIncidentTypeIconOrFontLetter($iconInfo:string, $fontLetter:boolean=false){

    let value;
    switch($iconInfo){
        case "/icons-whh/gun":
            value = gunIcon;
            if($fontLetter) value = "G";
        break;
        case "/icons-mdi/spray":
            value = sprayIcon;
            if($fontLetter) value = "S";
        break;
        case "/icons-emojione-monotone/question-mark":
            value = questionMark;
            if($fontLetter) value = "Q";
        break;
        case "/icons-mdi/weather-hurricane":
            value = weatherHurricane;
            if($fontLetter) value = "W";
        break;
        case "/icons-emojione-monotone/tornado":
            value = tornadoIcon;
            if($fontLetter) value = "T";
        break;
        case "/icons-mdi/fire":
            value = fireIcon;
            if($fontLetter) value = "F";
        break;
        case "/icons-mdi/biohazard":
            value = biohazardIcon;
            if($fontLetter) value = "H";
        break;
        case "/icons-mdi/bomb":
            value = bombIcon;
            if($fontLetter) value = "B";
        break;
        case "/icons-mdi/clipboard-list":
            value = clipboardList;
            if($fontLetter) value = "C";
        break;
        case "/icons-uil/bolt-slash":
            value = boltSlash;
            if($fontLetter) value = "P";
        break;
        case "/icons-fa/crosshairs":
            value = crosshairs;
            if($fontLetter) value = "A";
        break;



        //THESE ARE NOT INCIDENT TYPES BUT WE PUT IT HERE TO KEEP IT IN THE SAME PLACE AS THE REST OF THE LETTER DELEGATIONS
        case "org":
            if($fontLetter) value = "E";
        break;
        case "account":
            if($fontLetter) value = "D";
        break;
        case "move":
            if($fontLetter) value = "M";
        break;
        case "rotate":
            if($fontLetter) value = "R";
        break;
        case "scale":
            if($fontLetter) value = "s";//lowercase
        break;
    }

    return value;        
}