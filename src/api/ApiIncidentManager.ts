import Api, { ApiCallback, ApiData, IErrorType } from "./Api";
import User from "../data/User";
import { IIncidentTypeData, IIncidentStatusData, IIncidentChecklistUserChecklist, IIncidentReportData } from "../data/IncidentData";
import LocationUtil from "../util/LocationUtil";
import AlertOverlay from "../overlay/AlertOverlay";
import LoadingOverlay from "../overlay/LoadingOverlay";

export class ApiIncidentManager{
    

    static ERROR_SM_NOT_AVAILABLE:IErrorType = {id:"smNotAvailable", desc:"Not available - School Messenger Integration is not configured."};

    static ERROR_INCIDENT_ALREADY_UNDERWAY:IErrorType = {id:"errorIncidentUnderway", desc:"Error: Event of this type is already underway."};

    URL_GET_INCIDENT_TYPES:string = "getIncidentTypes";
    URL_GET_INCIDENT_STATUSES:string = "getIncidentStatuses";
    URL_GET_PENDING_INCIDENT_REPORTS:string = "getPendingIncidentReports";
    URL_GET_ACTIVE_INCIDENT_REPORTS:string = "getActiveIncidentReports";
    
    URL_GET_INCIDENT_SUMMARY:string = "getIncidentSummary";
    URL_GET_INCIDENT:string = "getIncident";
    URL_GET_INCIDENT_CHECKLISTS:string = "getIncidentChecklists";
    URL_REPORT_INCIDENT:string = "reportIncident";
    URL_UPDATE_INCIDENT_STATUS:string = "updateIncidentStatus";
    URL_DISMISS_INCIDENT_REPORT:string = "dismissIncidentReport";




    async getIncidentSummary($orgId:string, $incidentId:string, $complete:ApiCallback){
        try{
            let strURL:string = Api.strBaseURL+this.URL_GET_INCIDENT_SUMMARY;

            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = $orgId;
            request.incidentId = $incidentId;

            const response = await Api.fetchAsyncJSON(strURL, "POST",request,false);
            
            if(response?.summary?.success){
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }


    async getIncidentChecklistsPromise($orgId:string, $incidentId:string, $checklistId:string){
        
        let strURL:string = Api.strBaseURL+this.URL_GET_INCIDENT_CHECKLISTS;

        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.data = {
            orgId:$orgId,
            incidentId:$incidentId,
            checklistId:$checklistId
        }
        
        const response = await Api.fetchAsyncJSON(strURL, "POST",request);

        return response;
    }

    async getIncidentChecklists($orgId:string, $incidentId:string, $checklistId:string, $complete:ApiCallback){
        try{

            const response = await this.getIncidentChecklistsPromise($orgId,$incidentId,$checklistId);
            
            if(response?.summary?.success){
                let userChecklists:IIncidentChecklistUserChecklist[] = [];
                if(response.data && response.data.userChecklists){
                    userChecklists = response.data.userChecklists;
                }
                $complete(true,userChecklists);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }


    async getIncidentPromise($orgId:string, $incidentId:string){
        
        let strURL:string = Api.strBaseURL+this.URL_GET_INCIDENT;

        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.orgId = $orgId;
        request.incidentId = $incidentId;

        const response = await Api.fetchAsyncJSON(strURL, "POST",request);

        return response;
    }

    async getIncident($orgId:string, $incidentId:string, $complete:ApiCallback){
        try{

            const response = await this.getIncidentPromise($orgId,$incidentId);
            
            if(response?.summary?.success){
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    
    async getRolledIncidentReportsPromise($updateUserHere:boolean=true){


        //so "Rolled Incident Report" is our own lingo for "Active Incident Report"... we do this for our sanity of not mixing it up with "Active Incidents"
        let strURL:string = Api.strBaseURL+this.URL_GET_ACTIVE_INCIDENT_REPORTS;

        let request:any = {};
        request.authorization = Api.getAuthBlock();
        
        const response = await Api.fetchAsyncJSON(strURL, "POST",request,false);

        if($updateUserHere && response?.summary?.success){

            let incidentReports:IIncidentReportData[] = [];
            if(response.data){
                incidentReports = response.data;
            }
            //User.setIncidentReports(incidentReports);
        }

        return response;
    }

    async getPendingIncidentReportsPromise($updateUserHere:boolean=true){


        let strURL:string = Api.strBaseURL+this.URL_GET_PENDING_INCIDENT_REPORTS;

        let request:any = {};
        request.authorization = Api.getAuthBlock();
        
        const response = await Api.fetchAsyncJSON(strURL, "POST",request,false);

        if($updateUserHere && response?.summary?.success){

            let incidentReports:IIncidentReportData[] = [];
            if(response.data){
                incidentReports = response.data;
            }
            User.setPendingIncidentReports(incidentReports);
        }

        return response;
    }

    async getPendingIncidentReports($complete:ApiCallback){
        try{
            
            const response = await this.getPendingIncidentReportsPromise();
            
            if(response?.summary?.success){

                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    
    async getIncidentStatusesPromise(){
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.orgId = User.selectedOrg.orgId;
        let strURL:string = Api.strBaseURL+this.URL_GET_INCIDENT_STATUSES;

        const response = await Api.fetchAsyncJSON(strURL, "POST",request);
        if(response?.summary?.success && response?.data){

            let data:IIncidentStatusData[] = response.data;

            User.setIncidentStatuses(data);
        }

        return response;
    }

    async getIncidentTypesPromise(){
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.orgId = User.selectedOrg.orgId;
        let strURL:string = Api.strBaseURL+this.URL_GET_INCIDENT_TYPES;

        const response = await Api.fetchAsyncJSON(strURL, "POST",request);
        if(response?.summary?.success && response?.data){

            let data:IIncidentTypeData[] = [];
            if(response.data){
                data = response.data;
            }

            User.setIncidentTypes(data);
        }

        return response;
    }

    async getIncidentTypes($complete:ApiCallback){
        try{

            let response = await this.getIncidentTypesPromise();
            
            if(response?.summary?.success){
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }


    async getBNBasic($complete:ApiCallback){
        try{
            
            let requests = [];

            //if(Api.isExpired(User.state.incidentStatusesDate)){
                requests.push(this.getIncidentStatusesPromise());
            //}

            //if(Api.isExpired(User.selectedOrg.broadcastListDate)){
                requests.push(Api.orgManager.getOrgBroadcastListPromise());
            //}

            if(requests.length>0){

                const results = await Promise.all(requests);
            
                let success:boolean=true;

                let error:IErrorType = ApiData.ERROR_LOADING;
    
                results.forEach(($response)=>{
                    if($response?.summary?.success){
    
                    }else{

                        if($response?.summary?.code===505){
                            error = ApiIncidentManager.ERROR_SM_NOT_AVAILABLE;
                        }

                        success=false;
                    }
                });
                
                if(success){
                    $complete(true,{});
                }else{
                    $complete(false,error);
                }
            }else{                
                $complete(true,{});
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async dismissIncidentReport($orgId:string, $incidentReportId:string, $complete:ApiCallback, $reason:string=""){
        try{
            let strURL:string = Api.strBaseURL+this.URL_DISMISS_INCIDENT_REPORT;

            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = $orgId;
            request.incidentReportId = $incidentReportId;
            request.dismissReason = $reason;

            const response = await Api.fetchAsyncJSON(strURL, "POST",request,false);
            
            if(response?.summary?.success){
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async updateIncidentStatus($orgId:string, $incidentId:string, $incidentStatusId:string, $complete:ApiCallback, $description:string=""){
        try{
            let strURL:string = Api.strBaseURL+this.URL_UPDATE_INCIDENT_STATUS;

            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = $orgId;
            request.incidentId = $incidentId;
            request.incidentStatusId = $incidentStatusId;
            request.description = $description;

            const response = await Api.fetchAsyncJSON(strURL, "POST",request,false);
            
            if(response?.summary?.success){
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }


    
    async reportIncident($orgId:string, $incidentTypeId:string, $comments:string, $complete:ApiCallback, $title:string="", $autoTrigger:boolean=false, $isDrill:boolean=false, $calendarId:string=""){
        try{

            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = $orgId;
            request.incidentTypeId = $incidentTypeId;
            request.comments = $comments;

            if($autoTrigger){
                request.autoTriggerResponse=true;
            }
            if($isDrill){
                request.isDrill=true;
            }
            if($title){
                request.title = $title;
            }
            if($calendarId){
                request.calendarId = $calendarId;
            }


            if(LocationUtil.myLocation){
                let position = LocationUtil.myLocation;

                let device_info:any = {
                    source:"gps",
                    latitude:position.coords.latitude,
                    longitude:position.coords.longitude,
                    accuracy_ring_radius:position.coords.accuracy,
                    timestamp:position.timestamp
                }
                if(position.coords.speed){
                    device_info.speed = position.coords.speed;
                }
                if(position.coords.altitude){
                    device_info.altitude = position.coords.altitude;
                }
                if(position.coords.heading){
                    device_info.bearing = position.coords.heading;
                }

                request.reportingDeviceInfo = {
                    device_info:[
                        device_info
                    ]
                }
            }

            let strURL:string = Api.strBaseURL+this.URL_REPORT_INCIDENT;

            const response = await Api.fetchAsyncJSON(strURL, "POST",request);
            
            if(response?.summary?.success){
                $complete(true,response);
            }else{
                if(response?.summary && response.summary.code===511){
                    $complete(false,ApiIncidentManager.ERROR_INCIDENT_ALREADY_UNDERWAY);
                }else{
                    $complete(false,ApiData.ERROR_LOADING);
                }
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    

    FULLFLOW_ReportIncident=($info:{
        orgId:string,
        incidentIdType:string,
        title:string,
        desc:string,
        loadingTitle?:string,
        loadingMsg?:string,
        autoTrigger?:boolean,
        isDrill?:boolean,
        calendarId?:string,
    },$complete?:ApiCallback)=>{

        let loadingTitle:string = "Loading Please Wait...";
        if($info.loadingTitle){
            loadingTitle = $info.loadingTitle;
        }
        let loadingMsg:string = "Sending notifications and checklists";
        if($info.loadingMsg){
            loadingMsg = $info.loadingMsg;
        }

        const hideLoading = LoadingOverlay.show("loadReportIncident",loadingMsg,loadingTitle);
        LocationUtil.getMyLocation(()=>{
            Api.incidentManager.reportIncident($info.orgId, $info.incidentIdType, $info.desc,($success, $results)=>{
                hideLoading();
                if($success){                    
                    User.setCanCheckForAlerts(true);
                }else{
                    AlertOverlay.show("errorReportIncident",$results.desc);        
                }
                if($complete){
                    $complete($success,$results);
                }

            },$info.title,$info.autoTrigger,$info.isDrill, $info.calendarId);  
                    
        });

    }





}