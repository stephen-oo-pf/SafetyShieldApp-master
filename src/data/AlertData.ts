import { IIncidentReportData, IPerOrgPerTypeIncidentReportGroup, IReportingDeviceInfo } from "./IncidentData";

export const ALERT_TYPE_ACTIVE_INCIDENT:string = "ACTIVE_INCIDENT";
export const ALERT_TYPE_ASSIGNED_CHECKLIST:string = "ASSIGNED_CHECKLIST";
export const ALERT_TYPE_PENDING_INCIDENT_REPORTS:string = "PENDING_INCIDENT_REPORTS";
export const ALERT_TYPE_INCIDENT_NOTIFICATION:string = "INCIDENT_NOTIFICATION";
export const ALERT_TYPE_INCIDENT_REPORT_NOTIFICATION:string = "INCIDENT_REPORT_NOTIFICATION";
export const ALERT_TYPE_CHECKLIST_NOTIFICATION:string = "CHECKLIST_NOTIFICATION";
export const ALERT_TYPE_SCHEDULED_DRILL:string = "SCHEDULED_DRILL";




export const ALERT_ALT_TYPE_PER_ORG_INCIDENT_TYPE:string = "perOrgIncidentType";

export interface IAlertData{
    alertType:string;
    alertId?:string;
    importance:string;
    orgId:string;
    orgName:string;  
    datetime?:number;
    description?:string; 
}
export interface IAlertIncidentData extends IAlertData{

    incidentTypeId:string;
    incidentId?:string;
    incidentStatusId?:string;
}

export type IAlertEventData = IAlertIncidentData | IIncidentReportData | IPerOrgPerTypeIncidentReportGroup;


export function createIDFromAlerts_ACTIVE_INCIDENT($data:IAlertData[]){
    let len = $data.length;
    let id:string = "";
    for(let i:number=0; i<len; i++){
        id+=$data[i].alertId;
    }
    return id;
}


export function createIDFromAlerts_SCHEDULED_DRILL($data:IAlert_SCHEDULED_DRILL[]){
    let len = $data.length;
    let id:string = "";
    for(let i:number=0; i<len; i++){
        id+=$data[i].calendarId;
    }
    return id;
}


//ACTIVE INCIDENT
export interface IAlert_ACTIVE_INCIDENT extends IAlertIncidentData{
    title:string;
    isDrill:boolean;
    triggeredByEmail:string;
    triggeredByName:string;
    triggeredByOpsRole:string;
    triggeredByUserId:string;
    reportingDeviceInfo:{
        device_info:IReportingDeviceInfo[]
    }
    numReports?:number;
}
//INCIDENT NOTIFICATION
export interface IAlert_INCIDENT_NOTIFICATION extends IAlertIncidentData{
    title:string;
    isDrill:boolean;
    triggeredByEmail:string;
    triggeredByName:string;
    statusChangeEmail?:string;
    statusChangeName?:string;
    statusChangeDescription?:string;

}
//INCIDENT REPORT NOTIFICATION
export interface IAlert_INCIDENT_REPORT_NOTIFICATION extends IAlertIncidentData{
    reportedByEmail:string;
    reportedByName:string;
    reportedDts:number;
    incidentReportId:string;
}


//PENDING INCIDENT REPORT
export interface IAlert_PENDING_INCIDENT_REPORT extends IAlertIncidentData{
    numItems:number;
    newest:number;
    oldest:number;
}

export type IAlert_INCIDENT = IAlert_INCIDENT_NOTIFICATION | IAlert_ACTIVE_INCIDENT;


//SCHEDULED DRILL
export interface IAlert_SCHEDULED_DRILL extends IAlertIncidentData{
    calendarId?:string;
}


//ASSIGNED CHECKLIST
export interface IAlert_ASSIGNED_CHECKLIST extends IAlertIncidentData{
    status:string;
    numItems:number;
    userChecklistId:string;
}

//CHECKLIST NOTIFICATION
export interface IAlert_CHECKLIST_NOTIFICATION extends IAlertIncidentData{
    status:string;
    numItems:number;
    userChecklistId:string;
}
export type IAlert_CHECKLIST = IAlert_CHECKLIST_NOTIFICATION | IAlert_ASSIGNED_CHECKLIST;

