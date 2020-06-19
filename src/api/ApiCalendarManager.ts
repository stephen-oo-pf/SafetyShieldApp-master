import Api, { ApiCallback, ApiData } from "./Api";
import User from "../data/User";
import { IDrillData } from "../data/DrillData";
import { IGetIncidentResponse } from "../data/IncidentData";


export default class ApiCalendarManager{

    URL_GET_LIST:string = "getCalendarList";
    URL_GET_ENTRY:string = "getCalendarEntry";
    URL_ADD_ENTRY:string = "addCalendarEntry";
    URL_UPDATE_ENTRY:string = "updateCalendarEntry";
    URL_DELETE_ENTRY:string = "deleteCalendarEntry";

    async getDrillDetails($orgId:string, $calendarId:string, $incidentId:string, $complete:ApiCallback){
        
        try{
         
            let entryResponse:any = undefined;
            let incidentResponse:any = undefined;



            if($calendarId){
                entryResponse = await this.getCalendarEntryPromise($orgId, $calendarId);
            }
            if($incidentId){
                incidentResponse = await Api.incidentManager.getIncidentPromise($orgId,$incidentId);
            }

            let success:boolean=false;

            let getIncidentResponse:IGetIncidentResponse | undefined = undefined;
            let drillEntry:IDrillData | undefined = undefined;


            if(entryResponse){

                if(entryResponse?.summary?.success){
                    success=true;
    
                    if(entryResponse.entry){
                        drillEntry = entryResponse.entry as IDrillData;
                    }
    
                }else{
                    success=false;
                }
            }

            

            if(incidentResponse){

                if(incidentResponse?.summary?.success){
                    success=true;
    
                    if(incidentResponse.data){
                        getIncidentResponse = incidentResponse.data as IGetIncidentResponse;
                    }
    
                }else{
                    success=false;
                }
            }


            if(success){            
                
                $complete(true,{calendarEntryData:drillEntry, incidentData:getIncidentResponse});
                
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    
    async getCalendarEntryPromise($orgId:string, $calendarId:string){
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.data = {
            orgId:$orgId,
            calendarId:$calendarId
        }
        let strURL:string = Api.strBaseURL+this.URL_GET_ENTRY;

        const response = await Api.fetchAsyncJSON(strURL, "POST",request);
        
        return response;
    }

    async getList($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                startDts:(Date.now()-(1000*60*60*24*7*10))/1000,//4 weeks ago
            }

            let strURL:string = Api.strBaseURL+this.URL_GET_LIST;

            
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);


            if(response?.summary?.success){            
                
                let arrDrills:IDrillData[] = [];
                if(response.entries){
                    arrDrills = response.entries;
                }
                $complete(true,arrDrills);
                
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    
    async addDrill($incidentTypeId:string, $date:Date, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                entryDts:$date.valueOf()/1000,
                entryType:"DRILL",
                entryDetails:{
                    incidentTypeId:$incidentTypeId
                }
            }

            let strURL:string = Api.strBaseURL+this.URL_ADD_ENTRY;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);


            if(response?.summary?.success && response?.data){ 
                
                $complete(true,response.data.calendarId);
                
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async editDrill($calendarId:string, $incidentTypeId:string, $date:Date, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                calendarId:$calendarId,
                orgId:User.selectedOrg.orgId,
                entryDts:$date.valueOf()/1000,
                entryType:"DRILL",
                entryDetails:{
                    incidentTypeId:$incidentTypeId
                }
            }

            let strURL:string = Api.strBaseURL+this.URL_UPDATE_ENTRY;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){ 
                
                $complete(true,response);
                
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async deleteDrill($orgId:string, $calendarId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:$orgId,
                calendarId:$calendarId,
            }

            let strURL:string = Api.strBaseURL+this.URL_DELETE_ENTRY;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){ 
                
                $complete(true,response);
                
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
}