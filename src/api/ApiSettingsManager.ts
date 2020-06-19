import Api, { ApiCallback, ApiData } from "./Api";
import User from "../data/User";


export default class ApiSettingsManager{
    
    GET_ORG_EMERGENCY_CONTACTS_WIDGET:string = "getOrgEmergencyContactWidget";
    GET_ORG_EMERGENCY_CONTACTS:string = "getOrgEmergencyContacts";
    SET_ORG_EMERGENCY_CONTACTS:string = "setOrgEmergencyContacts";


    async getOrgEmergencyContactWidget($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;

            let strURL:string = Api.strBaseURL+this.GET_ORG_EMERGENCY_CONTACTS_WIDGET;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request,false);
            if(response?.summary?.success){               
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    
    async getOrgEmergencyContacts($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;

            let strURL:string = Api.strBaseURL+this.GET_ORG_EMERGENCY_CONTACTS;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){

                User.setCurOrgEC(response.data);
                
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    
    async setOrgEmergencyContacts($details:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                ...$details
            }

            let strURL:string = Api.strBaseURL+this.SET_ORG_EMERGENCY_CONTACTS;

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