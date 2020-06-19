import { IIncidentTypeData, IIncidentReportData, getIncidentTypeById, ALERT_ALT_TYPE_INCIDENT_REPORT_DATA, ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA } from "./IncidentData";
import { IAlert_ACTIVE_INCIDENT, ALERT_TYPE_ACTIVE_INCIDENT } from "./AlertData";
import User from "./User";
import UIMapUtil from "../ui/map/UIMapUtil";
import FormatUtil from "../util/FormatUtil";



export function getMapInitialLocation(){
    
    let bounds = new google.maps.LatLngBounds();

    User.state.userOrgsFlat.forEach(($org)=>{
        if($org.mapPosition){
            bounds.extend($org.mapPosition);
        }
    });

    if(User.state.mapIncidents.length>0){
        bounds = new google.maps.LatLngBounds();
        User.state.mapIncidents.forEach(($incident)=>{
            if($incident.mapPosition){
                bounds.extend($incident.mapPosition);
            }
        });      
    }     

    return bounds;
}

export default class MapIncidentData{

    id:string = "";
    alertType:string = "";
    orgId:string = "";
    orgName:string = "";
    incidentTypeId:string = "";
    incidentType!:IIncidentTypeData;
    datetime:number=0;
    date!:Date;

    data?:IAlert_ACTIVE_INCIDENT | IIncidentReportData;
    dataActiveIncident?:IAlert_ACTIVE_INCIDENT;
    dataIncidentReport?:IIncidentReportData;
    
    childMapReports:MapIncidentData[] = [];
    parentMapReport?:MapIncidentData;

    title:string = "";
    actionBy:string = "";

    isSelected:boolean=false;
    proofOfExistence:boolean=true;

    lat:number=0;
    lng:number=0;
    mapPosition!:google.maps.LatLng;
    mapIcon!:google.maps.Icon;
    mapLabel!:google.maps.MarkerLabel;
    
    zIndex:number=0;

    clusterPosition?:google.maps.LatLng;

    constructor(){

    }



    populateWithActiveIncident($data:IAlert_ACTIVE_INCIDENT){
        this.dataActiveIncident = $data;
        this.data = $data;

        let incidentType = getIncidentTypeById($data.incidentTypeId)!;
        let title = $data.title;
        let actionBy = $data.triggeredByName;
        
        let lat:number = 0;
        let lng:number = 0;

        if(lat===0 && lng===0){
            let matchingOrg = User.state.userOrgsFlat.find(($org)=>{
                return $org.orgId===$data.orgId;
            });
            if(matchingOrg?.mapPosition){
                lat = matchingOrg.mapPosition.lat();
                lng = matchingOrg.mapPosition.lng();
            }
        }

        
        if($data.reportingDeviceInfo && $data.reportingDeviceInfo.device_info && $data.reportingDeviceInfo.device_info.length>0){
            let firstDevInfo = $data.reportingDeviceInfo.device_info[0];
            lat = firstDevInfo.latitude;
            lng = firstDevInfo.longitude;
        }

        this.mapIcon = UIMapUtil.getIcon(UIMapUtil.ICON_COLOR_RED,1,true);
        this.mapLabel = UIMapUtil.getSSIconAsLabel(incidentType.iconInfo);


        
        this.populate($data.incidentId!, ALERT_TYPE_ACTIVE_INCIDENT, $data.orgId, $data.orgName,incidentType,title,actionBy,Number($data.datetime),lat,lng);
    }

    populateWithPendingIncidentReport($data:IIncidentReportData){
        this.populateWithIncidentReport($data,ALERT_ALT_TYPE_INCIDENT_REPORT_DATA,UIMapUtil.ICON_COLOR_ORANGE);

    }

    populateWithRolledIncidentReport($data:IIncidentReportData){
        
        this.populateWithIncidentReport($data,ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA,UIMapUtil.ICON_COLOR_ORANGE_REDDOT);
    }

    populateWithIncidentReport($data:IIncidentReportData, $type:string, $color:string){
        this.dataIncidentReport = $data;
        this.data = $data;

        let datetime:number = Number($data.createDts);
        if($data.updateDts){
            datetime = Number($data.updateDts);
        }
        let incidentType = getIncidentTypeById($data.incidentTypeId)!;
        let title = incidentType.incidentType;
        let actionBy = $data.createUserName;

        if($data.createUserId===User.state.userInfo?.userId){
            actionBy+=" (me)";
        }

        let lat:number = 0;
        let lng:number = 0;
        if($data.reportingDeviceInfo && $data.reportingDeviceInfo.device_info && $data.reportingDeviceInfo.device_info.length>0){
            let firstDevInfo = $data.reportingDeviceInfo.device_info[0];
            lat = firstDevInfo.latitude;
            lng = firstDevInfo.longitude;
        }

        

        this.mapIcon = UIMapUtil.getIcon($color,1,true);
        this.mapLabel = UIMapUtil.getSSIconAsLabel(incidentType.iconInfo);


        this.populate($data.incidentReportId, $type, $data.orgId,$data.orgName,incidentType,title,actionBy,datetime, lat,lng);
    }
    populate($id:string, $type:string, $orgId:string, $orgName:string, $incidentType:IIncidentTypeData, $title:string, $actionBy:string, $datetimeSecs:number, $lat:number, $lng:number){
        this.id = $id;
        this.alertType = $type;
        this.orgId = $orgId;
        this.orgName = $orgName;
        this.incidentType = $incidentType;
        this.title = $title;
        this.actionBy = $actionBy;

        this.datetime = Number($datetimeSecs*1000);
        this.date = new Date(this.datetime);

        this.lat = $lat;
        this.lng = $lng;
        this.mapPosition = new google.maps.LatLng($lat,$lng);

        this.setProofOfExistence(true);
    }

    setProofOfExistence=($value:boolean)=>{
        this.proofOfExistence = $value;
    }
    setSelected=($value:boolean)=>{
        this.isSelected = $value;
    }


    toggleSelected=()=>{

        let wasAlreadySelected:boolean = this.isSelected;

        //deselect the current
        User.setSelectedMapIncident(undefined);

        //select this
        if(!wasAlreadySelected){
            User.setSelectedMapIncident(this);
        }
    }


    getElapsedTime=($roundedToSingle:boolean=true, $short:boolean=false):string=>{

        let elapsedTimeSecs = Math.round((Date.now()-this.datetime)/1000);
        return FormatUtil.timerHMSForReading(elapsedTimeSecs,$short,$roundedToSingle)+" ago";
    }
    

    setMapZIndex=($zindex:number)=>{
        this.zIndex = $zindex;
    }

    setClusterPosition=($position?:google.maps.LatLng)=>{
        this.clusterPosition = $position;
    }


    resetChildMapReports=()=>{
        this.childMapReports.length=0;
    }
    addChildMapReport=($childMapReport:MapIncidentData)=>{
        this.childMapReports.push($childMapReport);
    }
    setParentMapReport=($parentMapReport:MapIncidentData | undefined)=>{
        this.parentMapReport = $parentMapReport;
    }

}
