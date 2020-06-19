import UserRights, {IRightGroup, createRightGroup } from "./UserRights";
import User from "./User";
import ISecRole, { getSecRole } from "./SecRole";
import IOpsRole, { getOpsRole } from "./OpsRole";
import { IECData } from "./ECData";
import AppData, {ITerminologyLanguageList} from "./AppData";
import FloorPlansData from "./FloorPlansData";
import { IAssetTypeData } from "./AssetData";
import ERPData from "./ERPData";
import { IBroadcastData, IBroadcastListData } from "./BroadcastData";
import { IAlert_ACTIVE_INCIDENT, IAlert_ASSIGNED_CHECKLIST, IAlert_PENDING_INCIDENT_REPORT, IAlert_SCHEDULED_DRILL } from "./AlertData";
import UIMapUtil from "../ui/map/UIMapUtil";
import { getIncidentTypeById } from "./IncidentData";



export interface IOrgSetting{
    settingId:string;
    value:any;
}




export class Organization{

    rawData!:IRawOrganization;

    isMasterAdmin:boolean=false;
    isRootAdmin:boolean=false;
    isOrgAdmin:boolean=false;

    hasIncidentControl:boolean=false;

    rgUsers:IRightGroup = createRightGroup();
    rgFloorPlans:IRightGroup = createRightGroup();
    rgERPs:IRightGroup = createRightGroup();
    rgChecklists:IRightGroup = createRightGroup();
    rgMyChecklists:IRightGroup = createRightGroup();
    rgOrgs:IRightGroup = createRightGroup();
    
    rgDrills:IRightGroup = createRightGroup();
    rgOrgSettings:IRightGroup = createRightGroup();
    rgEC:IRightGroup = createRightGroup();
    rgBroadcasts:IRightGroup = createRightGroup();
    

    children:Organization[] = [];
    childrenDepth:number = 0;

    orgSettings:IOrgSetting[] = [];

    accountsExpanded:boolean=false;

    isFilterMatching:boolean=false;
    isFilterMatchingChild:boolean=false;
    hasFilterMatchingChildren:boolean=false;

    terminologyList!:ITerminologyLanguageList;

    mapPosition?:google.maps.LatLng;
    mapIcon?:google.maps.Icon;
    mapLabel?:google.maps.MarkerLabel;

    ecData?:IECData;

    broadcasts?:IBroadcastData[];
    broadcastList?:IBroadcastListData[];
    broadcastListAsUIOptions?:{label:string, value:string}[];
    broadcastListDate?:Date;

    orgPolygon:google.maps.LatLng[] = [];
    
    alerts_ACTIVE_INCIDENT:IAlert_ACTIVE_INCIDENT[] = [];
    alerts_ASSIGNED_CHECKLIST:IAlert_ASSIGNED_CHECKLIST[] = [];
    alerts_PENDING_INCIDENT_REPORT:IAlert_PENDING_INCIDENT_REPORT[] = [];
    alerts_SCHEDULED_DRILL:IAlert_SCHEDULED_DRILL[] = [];

    constructor(){

    }


    populate($data:IRawOrganization){
        this.rawData = $data;

        this.terminologyList = AppData.terminologyLanguage[this.rawData.orgTypeId] || AppData.terminologyLanguage.default;



        if(this.primaryAddress){

            let numLat:number=0;
            let numLng:number=0;

            if(this.primaryAddress?.lat){
                numLat = this.primaryAddress.lat;
            }
            if(this.primaryAddress?.lon){
                numLng = this.primaryAddress.lon;
            }

            this.mapPosition = new google.maps.LatLng(numLat,numLng);
        }

        if(this.orgId===AppData.masterOrgID){
            this.isMasterAdmin=true;
        }

        this.updateMapDetails();
        

        this.setupRights();
    }


    updateMapDetails=()=>{

        let lbl:string = "";

        let color:string = UIMapUtil.ICON_COLOR_BLUE;
        let iconInfo:string = "org";
        if(this.isAccount){
            iconInfo = "account";
        }

        let useIconLabel:boolean=true;
        let incidentType;


        if(this.alerts_PENDING_INCIDENT_REPORT.length>0){
            color = UIMapUtil.ICON_COLOR_ORANGE;
            iconInfo = "";
            useIconLabel=false;

            if(this.alerts_PENDING_INCIDENT_REPORT.length===1){
                useIconLabel=true;
                incidentType = getIncidentTypeById(this.alerts_PENDING_INCIDENT_REPORT[0].incidentTypeId);
                if(incidentType){
                    iconInfo = incidentType.iconInfo;
                }
            }else{
                lbl = ""+this.alerts_PENDING_INCIDENT_REPORT.length;
            }
        }
        
        if(this.alerts_ACTIVE_INCIDENT.length>0){
            color = UIMapUtil.ICON_COLOR_RED;
            iconInfo = "";
            useIconLabel=false;

            if(this.alerts_ACTIVE_INCIDENT.length===1){
                useIconLabel=true;
                incidentType = getIncidentTypeById(this.alerts_ACTIVE_INCIDENT[0].incidentTypeId);
                if(incidentType){
                    iconInfo = incidentType.iconInfo;
                }
            }else{
                lbl = ""+this.alerts_ACTIVE_INCIDENT.length;
            }
        }



        if(useIconLabel){
            this.mapIcon = UIMapUtil.getIcon(color,1,true);
            this.mapLabel = UIMapUtil.getSSIconAsLabel(iconInfo);
            
        }else{
            this.mapIcon = UIMapUtil.getIcon(color,1);
            this.mapLabel = UIMapUtil.getLabel(lbl);
        }

    }


    // this is called after the first validate and subsequent init 
    setupRights=()=>{

        //"userRights" only shows up for USER Orgs Not the Orgs on the Accounts page.
        //user right shortcuts
        
        if(this.rawData.userRights){
            this.rawData.userRights.forEach(($value)=>{

                switch($value){      
                    //Root/Master             
                    case UserRights.ROOT_ADMIN:
                        this.isRootAdmin=true;
                    break;                    
                    //Orgs
                    case UserRights.ORG_ADMIN:
                        this.isOrgAdmin=true;
                    break; 
                    case UserRights.ORGS_VIEW:
                        this.rgOrgs.canView=true;
                    break;
                    case UserRights.ORGS_CREATE:
                        this.rgOrgs.canAdd=true;
                    break;
                    case UserRights.ORGS_EDIT:
                        this.rgOrgs.canEdit=true;
                    break;
                    case UserRights.ORGS_DELETE:
                        this.rgOrgs.canDelete=true;
                    break;
                    //Users
                    case UserRights.USER_ADMIN:
                        this.rgUsers.canView=true;
                        this.rgUsers.canAdd=true;
                        this.rgUsers.canDelete=true;
                        this.rgUsers.canEdit=true;
                    break;
                    //Checklists
                    case UserRights.CHECKLIST_MY_VIEW:
                        this.rgMyChecklists.canView=true;
                    break;
                    case UserRights.CHECKLIST_VIEW:
                        this.rgChecklists.canView=true;
                    break;
                    case UserRights.CHECKLIST_CREATE:
                        this.rgChecklists.canAdd=true;
                    break;
                    case UserRights.CHECKLIST_EDIT:
                        this.rgChecklists.canEdit=true;
                    break;
                    case UserRights.CHECKLIST_DELETE:
                        this.rgChecklists.canDelete=true;
                    break;
                    //Emergency Contacts
                    case UserRights.MANAGE_EC:
                        this.rgEC.canView=true;
                        this.rgEC.canEdit=true;
                        this.rgEC.canAdd=true;
                        this.rgEC.canDelete=true;
                    break;
                    case UserRights.MANAGE_BROADCASTS:
                        this.rgBroadcasts.canView=true;
                        this.rgBroadcasts.canAdd=true;
                        this.rgBroadcasts.canEdit=true;
                        this.rgBroadcasts.canDelete=true;
                    break;
                    //Incident Control
                    case UserRights.INCIDENT_CONTROL:
                        this.hasIncidentControl=true;
                        this.rgDrills.canView=true;
                        this.rgDrills.canAdd=true;
                        this.rgDrills.canDelete=true;
                        this.rgDrills.canEdit=true;
                        
                    break;     
                    //Edit Org Settings
                    case UserRights.EDIT_ORG_SETTINGS:
                        this.rgOrgSettings.canView=true;
                        this.rgOrgSettings.canAdd=true;
                        this.rgOrgSettings.canDelete=true;
                        this.rgOrgSettings.canEdit=true;
                    break;                    
                }
            });
            
            



            if(User.state.allAssetTypes.length>0){
                //this wont run the first time but on subsequent when the assetTypes are loaded.
                this.setupAssetRights();
            }
        }
        
    }

    setupAssetRights(){
        //we have to setup Asset rights seperately because they depend on the AssetTypeData

        let floorPlansType!:IAssetTypeData;
        let erpType!:IAssetTypeData;

        User.state.allAssetTypes.forEach(($type)=>{
            if($type.assetTypeId===FloorPlansData.TYPE){
                floorPlansType = $type;
            }
            if($type.assetTypeId===ERPData.TYPE){
                erpType = $type;
            }
        });
        
        if(this.rawData.userRights){
            this.rawData.userRights.forEach(($value)=>{
                
                switch($value){
                    //Floorplans
                    case floorPlansType.viewRightId:
                        this.rgFloorPlans.canView=true;
                    break;
                    case floorPlansType.editRightId:
                        this.rgFloorPlans.canEdit=true;
                    break;
                    case floorPlansType.addRightId:
                        this.rgFloorPlans.canAdd=true;
                    break;
                    case floorPlansType.deleteRightId:
                        this.rgFloorPlans.canDelete=true;
                    break;
                    //ERPS
                    case erpType.viewRightId:
                        this.rgERPs.canView=true;
                    break;
                    case erpType.editRightId:
                        this.rgERPs.canEdit=true;
                    break;
                    case erpType.addRightId:
                        this.rgERPs.canAdd=true;
                    break;
                    case erpType.deleteRightId:
                        this.rgERPs.canDelete=true;
                    break;
                }
            });
        }
        
    }

    countChildrenDepth($depth:number){


        if(this.children.length>0){
            $depth++;
            this.children.forEach(($value)=>{
                $depth = $value.countChildrenDepth($depth);
            });
        }
        return $depth;
    }

    sortChildren(){
        this.children.sort(sortOrgs);
    }



    addAdvancedDetails=($data:IRawOrganization)=>{
        this.rawData.landmarks = $data.landmarks;

        let parsedPolygon = parseOrgLandmarkPolygon(this);

        if(parsedPolygon){
            this.orgPolygon = parsedPolygon.initPoints;
        }
    }



    get isAccount(){
        return this.rawData.parentOrgId===null;
    }

    get orgTypeId(){
        return this.rawData.orgTypeId;
    }
    get orgId(){
        return this.rawData.orgId;
    }
    get orgName(){
        return this.rawData.orgName;
    }
    get parentOrgId(){
        return this.rawData.parentOrgId;
    }
    get logoIMGURL(){
        return "https://laaserimages.s3.amazonaws.com/TrojanHeadJake.png";
    }
    get description(){
        return this.rawData.description;
    }
    get readonly(){
        return this.rawData.readOnly;
    }
    get userRights(){
        return this.rawData.userRights;
    }

    get addresses(){
        return this.rawData.addresses;
    }

    _primaryAddress:IOrganizationAddress | null = null;
    _primaryAddressStreet:string | null = null;
    _primaryAddressCityStateZip:string | null = null;
    get primaryAddress(){
        if(this._primaryAddress===null && this.addresses && this.addresses.length>0){
            
            let address = this.addresses.find(($address)=>{
                return $address.primaryFlag;
            });
            if(address===undefined){
                address = this.addresses[0];
            }

            this._primaryAddress = address;
        }

        return this._primaryAddress;
    }

    get primaryAddressStreet(){
        if(this._primaryAddressStreet===null){
            
            let street = "";
            if(this.primaryAddress?.address1){
                street += this.primaryAddress.address1;
            }
            if(this.primaryAddress?.address2){
                street += " "+this.primaryAddress.address2;
            }
            this._primaryAddressStreet = street;
        }
        return this._primaryAddressStreet;
    }
    get primaryAddressCityStateZip(){
        if(this._primaryAddressCityStateZip===null){
            
            let cityStateZip = "";
            if(this.primaryAddress?.city){
                cityStateZip += this.primaryAddress.city;
            }
            if(this.primaryAddress?.state){
                cityStateZip += ", "+this.primaryAddress.state;
            }
            if(this.primaryAddress?.zip){
                cityStateZip += " "+this.primaryAddress.zip;
            }
            this._primaryAddressCityStateZip = cityStateZip;
        }
        return this._primaryAddressCityStateZip;
    }


    get landmarks(){
        return this.rawData.landmarks;
    }

    _secRole:ISecRole | null =null;
    get secRole(){        
        if(this._secRole===null && this.rawData.secRoleId){
            this._secRole = getSecRole(this.rawData.secRoleId,User.state.secRoles)!;
        }
        return this._secRole; 
    }
    
    _opsRole:IOpsRole | null =null;
    get opsRole(){        
        if(this._opsRole===null && this.rawData.opsRoleId){
            this._opsRole = getOpsRole(this.rawData.opsRoleId,User.state.opsRoles)!;
        }
        return this._opsRole; 
    }


    setECData($value:IECData){
        this.ecData = $value;
    }
    setBroadcasts($value:IBroadcastData[]){
        this.broadcasts = $value;
    }
    setBroadcastList($value:IBroadcastListData[]){
        this.broadcastList = $value;
        this.broadcastListDate = new Date();

        let uiOptions = $value.map(($item)=>{
            return {
                label:$item.name + " ["+$item.username+"]",
                value:$item.broadcastId
            }
        });

        uiOptions.unshift({
            label:"Select",
            value:""
        });

        this.broadcastListAsUIOptions = uiOptions;
    }

    setOrgSettings($value:IOrgSetting[]){
        this.orgSettings = $value;
    }

    setAccountsExpanded($value:boolean){
        this.accountsExpanded=$value;
    }
    setIsFilterMatching($value:boolean){
        this.isFilterMatching=$value;
    }
    setIsAFilterMatchingChild($value:boolean){
        this.isFilterMatchingChild = $value;
    }
    setHasFilterMatchingChildren($value:boolean){
        this.hasFilterMatchingChildren = $value;
    }


    getBroadcastListItem=($id:string)=>{
        return this.broadcastList?.find(($broadcast)=>{
            return $broadcast.broadcastId+""===""+$id;
        });
    }

    detailsMatchFilters($filters:string[]){

        let numFilterMatchs:number=0;

        $filters.forEach(($filter:string)=>{
            let filterWordFound:boolean=false;
            if(this.orgName.toLowerCase().indexOf($filter)!==-1){
                filterWordFound=true;
            }
            if(filterWordFound){
                numFilterMatchs++;
            }
        });


        return numFilterMatchs===$filters.length;




    }

    

    setAlerts($activeIncients:IAlert_ACTIVE_INCIDENT[],$assignedChecklists:IAlert_ASSIGNED_CHECKLIST[],$pendingIncidentReports:IAlert_PENDING_INCIDENT_REPORT[], $scheduledDrills:IAlert_SCHEDULED_DRILL[]){
        this.alerts_ACTIVE_INCIDENT = $activeIncients;
        this.alerts_ASSIGNED_CHECKLIST = $assignedChecklists;
        this.alerts_PENDING_INCIDENT_REPORT = $pendingIncidentReports;
        this.alerts_SCHEDULED_DRILL = $scheduledDrills;
        this.updateMapDetails();

    }

}



export function getOrgType($orgTypeId:string, $types:IOrganizationType[]){

    return $types.find(($value)=>{
        return $value.orgTypeId===$orgTypeId;
    });
}


export default interface IRawOrganization{
    description:string;
    orgId:string;
    orgName:string;
    orgType:string;
    orgTypeId:string;
    parentOrgId:string | null;
    readOnly?:boolean;

    //these properties show if this was Account Section related...
    addresses?:IOrganizationAddress[];
    landmarks?:IOrganizationLandmark[];

    //these properties show if this was User Related...
    opsRoleId?:string;
    opsRole?:string;
    secRoleId?:string;
    secRole?:string;
    secRolePriority?:number;
    userRights?:string[];
}

export interface IOrganizationType{
    orgTypeId:string;
    orgType:string;
    description:string;
    hiddenFlag:number;
}


export interface IOrganizationAddress{
    address1:string;
    address2:string;
    city:string;
    country:string;
    label:string;
    primaryFlag:boolean,
    state:string;
    zip:string;
    lat:number;
    lon:number;
}
export interface IOrganizationLandmark{
    landmarkType:string;
    name:string;
    orgLandmarkId:string;
    positioningData:{
        polygon:string
    }
}


export function sortOrgs($orgA:Organization,$orgB:Organization){
    if($orgA.orgName.toLowerCase()===$orgB.orgName.toLowerCase()){
        return 0;
    }else{
        if($orgA.orgName.toLowerCase()>$orgB.orgName.toLowerCase()){
            return 1;
        }else{
            return -1;
        }
    }
}

export function assignOrgChildren($orgs:Organization[]){
    
    $orgs.forEach(($valueA)=>{        
        $orgs.forEach(($valueB)=>{
            if($valueA.orgId!==$valueB.orgId && $valueB.orgId===$valueA.parentOrgId){
                $valueB.children.push($valueA);
            }
        });
    });

    $orgs.forEach(($value)=>{
        $value.sortChildren();
        $value.countChildrenDepth(0);
    });
}

export function sortOrgsIntoHierarchy($orgs:Organization[]){

    assignOrgChildren($orgs);

    //districts are orgs with a parentOrgId of null
    let userDistricts:Organization[] = $orgs.filter(($org)=>{
        let isOk:boolean=false;
        if($org.parentOrgId===null){
            isOk=true;
        }
        
        //if it is a district... lets make sure its not a master org... we'll get those below
        if(isOk && $org.orgTypeId===AppData.masterOrgType){
            isOk=false;                
        }
        return isOk
    }).sort(sortOrgs);

    //now lets get master orgs
    let masterOrgs:Organization[] = $orgs.filter(($org)=>{
        let isOk:boolean=false;
        if($org.orgTypeId===AppData.masterOrgType && $org.parentOrgId===null){
            isOk=true;
        }
        return isOk;
    }).sort(sortOrgs);


    //now we have 
    let topLevelOrgs:Organization[];
    
    
    if(masterOrgs.length+userDistricts.length>0){
       topLevelOrgs = [...masterOrgs,...userDistricts];
    }else{
        topLevelOrgs = $orgs;
    }

    return topLevelOrgs;
}

export function parseOrgLandmarkPolygon($org:Organization){

    let initPoints;
    let initMapCenter;
    let firstLandmark;
    if($org.landmarks && $org.landmarks.length>0){
        firstLandmark = $org.landmarks[0];

        if(firstLandmark.positioningData.polygon){
            //to find the center we add all points to a bounds and check its center.
            let bounds:google.maps.LatLngBounds = new google.maps.LatLngBounds();

            let polygonPoints = firstLandmark.positioningData.polygon.split(";");
            //remove last item because the string ends in a ; so the last item is blank
            polygonPoints.pop();

            initPoints = polygonPoints.map(($point:string, $index)=>{
                let latLngs:string[] = $point.split(",");
                let lat:number = Number(latLngs[0]);
                let lng:number = Number(latLngs[1]);

                let latLng:google.maps.LatLng = new google.maps.LatLng(lat,lng);
                bounds.extend(latLng);
                return latLng;
            });
            initMapCenter = bounds.getCenter();
        }
    }

    if(initPoints && initMapCenter){
        return {
            initPoints:initPoints,
            initMapCenter:initMapCenter
        }
    }else{
        return undefined;
    }

}


