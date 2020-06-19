import UIDrillStatusIcon from "../view/dashboard/er/drills/UIDrillStatusIcon";
import DrillsView from "../view/dashboard/er/drills/DrillsView";
import { INCIDENT_STATUS_TYPE_CLOSED } from "./IncidentData";

/*
Yikes to the structure of this object we recieve from the api :( .... wtf
*/
export interface IDrillData{
    calendarId?:string;
    entryDetails:{
        incidentTypeId:string;
        incidentId?:string;
    }
    entryDts:number;
    entryType:string;
    incidentStatusId?:string;
    orgId:string;
    orgName:string;
    userName:string;
    started:boolean;
    secRole:{
        secRole:string;
        secRoleId:string;
    }

    [key:string]:any;

}

export function getStatusFromDrillData($drill:IDrillData){

    let status:string = UIDrillStatusIcon.STATUS_CODE_NOT_STARTED;

    if($drill.started){
        status = UIDrillStatusIcon.STATUS_CODE_STARTED;
        if($drill.incidentStatusId===INCIDENT_STATUS_TYPE_CLOSED){
            status = UIDrillStatusIcon.STATUS_CODE_COMPLETED;
        }
    }
    return status;
}

const drillPathIncidentIDSeparater:string = "_INCIDENT_";
const drillPathOrgIDSeparater:string = "_ORG_";


export function createDrillDetailPath($data:IDrillData){

    let strPath:string = "";
    if($data.calendarId){
        strPath+=$data.calendarId;
    }
    if($data.entryDetails.incidentId){
        strPath+=drillPathIncidentIDSeparater+$data.entryDetails.incidentId;
    }
    
    strPath+=drillPathOrgIDSeparater+$data.orgId;

    return DrillsView.PATH+"/"+strPath;
}




export function parseDrillDetailPath($path:string){

    let calendarId="";
    let incidentId="";
    let orgId="";

    //first split org
    let orgSplit = $path.split(drillPathOrgIDSeparater);
    orgId = orgSplit[1];

    //then if exists... split on incident
    if(orgSplit[0].indexOf(drillPathIncidentIDSeparater)!==-1){
        let incidentSplit = orgSplit[0].split(drillPathIncidentIDSeparater);

        if(incidentSplit[0]!==""){
            calendarId = incidentSplit[0];
        }
        incidentId = incidentSplit[1];

    }else{
        calendarId = orgSplit[0];
    }


    return {
        orgId,
        calendarId,
        incidentId
    }
}