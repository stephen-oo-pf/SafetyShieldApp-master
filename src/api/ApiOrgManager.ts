import Api, { ApiCallback, ApiData } from "./Api";
import IRawOrganization, { IOrganizationType } from "../data/Organization";
import User from "../data/User";
import { IBroadcastListData, IBroadcastData } from "../data/BroadcastData";

export default class ApiOrgManager{


    URL_GET_ORGS:string = "getOrgs";
    URL_GET_ORG:string = "getOrg";
    URL_GET_ORG_TYPES:string = "getOrgTypes";
    URL_ADD_ORG:string =  "addOrg";
    URL_UPDATE_ORG:string =  "updateOrg";
    URL_DELETE_ORG:string =  "deleteOrg";

    URL_GET_ORG_BROADCAST_CONFIGURATION:string = "getOrgBroadcastConfiguration";
    URL_SET_ORG_BROADCAST_CONFIGURATION:string = "setOrgBroadcastConfiguration";
    URL_VALIDATE_ORG_BROADCAST_CONFIGURATION:string = "validateOrgBroadcastConfiguration";
    
    URL_ADD_ORG_BROADCAST:string = "addOrgBroadcast";
    URL_UPDATE_ORG_BROADCAST:string = "updateOrgBroadcast";
    URL_DELETE_ORG_BROADCAST:string = "deleteOrgBroadcast";
    URL_GET_ORG_BROADCAST:string = "getOrgBroadcast";
    URL_GET_ORG_BROADCASTS:string = "getOrgBroadcasts";
    URL_GET_ORG_BROADCAST_LIST:string = "getOrgBroadcastList";
    URL_TRIGGER_ORG_BROADCAST:string = "triggerOrgBroadcast";
    
    async getOrgTypesPromise(){
        
        let request:any = {};
        request.authorization = Api.getAuthBlock();

        let strURL:string = Api.strBaseURL+this.URL_GET_ORG_TYPES;

        const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
        if(response?.summary?.success){
            
            let arrIOrgs:IOrganizationType[] = [];
            
            if(response.data){
                arrIOrgs = response.data;
            };

            User.setOrgTypes(arrIOrgs);
        }
        return response;
    }
    
    async getOrgs($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();

            let strURL:string = Api.strBaseURL+this.URL_GET_ORGS;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response?.summary?.success){
                let arrIOrgs:IRawOrganization[] = [];
                
                if(response.data){
                    arrIOrgs = response.data;
                };

                User.setAllOrgs(arrIOrgs);
                $complete(true,response);
            }else{
                User.setAllOrgs([]);
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING)
        }
    }



    async getOrgPromise($orgId:string){
        
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.orgId = $orgId;

        let strURL:string = Api.strBaseURL+this.URL_GET_ORG;

        const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
        
        return response;
    }


    async getSelectedOrgPromise(){        
        const response:any = await this.getOrgPromise(User.selectedOrg.orgId);
        
        if(response?.summary?.success && response?.data){
        
            User.selectedOrg.addAdvancedDetails(response.data);

        }
        
        return response;
    }
    async getOrg($orgId:string,$complete:ApiCallback){
        
        try{            
            const response:any = await this.getOrgPromise($orgId);

            if(response?.summary?.success && response?.data){

                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async addOrg($addDetails:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = $addDetails;

            let strURL:string = Api.strBaseURL+this.URL_ADD_ORG;
            
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            
            if(response?.summary?.success && response?.data){
                let newOrgID:string = response.data.orgId;
                $complete(true,newOrgID);
            }else{

                let error = ApiData.ERROR_LOADING;
                if(response?.summary?.code===513){
                    error = {id:"orgAlreadyExists", desc:response.summary.message}
                }                
                $complete(false,error);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    
    async updateOrg($updateDetails:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = $updateDetails;

            let strURL:string = Api.strBaseURL+this.URL_UPDATE_ORG;
            
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){
                $complete(true,response);
            }else{
                let error = ApiData.ERROR_LOADING;
                if(response?.summary?.code===513){
                    error = {id:"orgAlreadyExists", desc:response.summary.message}
                }                
                $complete(false,error);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    
    async deleteOrg($orgId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:$orgId,
                reason:"cause I do what I want girlfriend!"
            };

            let strURL:string = Api.strBaseURL+this.URL_DELETE_ORG;
            
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


    checkBroadcastError=($complete:ApiCallback, $response:any)=>{

        if($response.summary.success){
            $complete(true,$response);
        }else{


            let error = ApiData.ERROR_LOADING;
            
            switch($response.summary.code){
                case 505:
                case 506:
                case 507:
                case 508:
                    error = {id:"broadcastError", desc:$response.summary.message, code:$response.summary.code};
                break;
            }
            $complete(false,error);

        }

    }


    async validateOrgBroadcastConfiguration($customerURL:string, $usernames:string[], $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data={
                customerUrl:$customerURL,
                usernames:$usernames
            }
            
            let strURL:string = Api.strBaseURL+this.URL_VALIDATE_ORG_BROADCAST_CONFIGURATION;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response?.summary){    

                this.checkBroadcastError($complete,response);

            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async setOrgBroadcastConfiguration($orgId:string,$customerURL:string, $usernames:string[], $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data={
                orgId:$orgId,
                customerUrl:$customerURL,
                usernames:$usernames
            }
            
            let strURL:string = Api.strBaseURL+this.URL_SET_ORG_BROADCAST_CONFIGURATION;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response?.summary){
                this.checkBroadcastError($complete,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async getOrgBroadcastConfiguration($orgId:string,$complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = $orgId;
            
            let strURL:string = Api.strBaseURL+this.URL_GET_ORG_BROADCAST_CONFIGURATION;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            
            if(response?.summary){
                this.checkBroadcastError($complete,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
        
    }


    async addOrgBroadcast($details:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                ...$details
            };

            let strURL:string = Api.strBaseURL+this.URL_ADD_ORG_BROADCAST;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary){

                this.checkBroadcastError($complete,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    
    async updateOrgBroadcast($incidentBroadcastId:string, $details:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                incidentBroadcastId:$incidentBroadcastId,
                ...$details
            };

            let strURL:string = Api.strBaseURL+this.URL_UPDATE_ORG_BROADCAST;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary){
                this.checkBroadcastError($complete,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async deleteOrgBroadcast($incidentBroadcastId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                incidentBroadcastId:$incidentBroadcastId,
            }
            
            let strURL:string = Api.strBaseURL+this.URL_DELETE_ORG_BROADCAST;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary){
                this.checkBroadcastError($complete,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    
    async getOrgBroadcast($incidentBroadcastId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;
            request.incidentBroadcastId=$incidentBroadcastId;

            let strURL:string = Api.strBaseURL+this.URL_GET_ORG_BROADCAST;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary){
                this.checkBroadcastError($complete,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }


    async getOrgBroadcasts($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;
            
            let strURL:string = Api.strBaseURL+this.URL_GET_ORG_BROADCASTS;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary){
                let arrData:IBroadcastData[] = [];
                if(response.data){
                    arrData = response.data;
                    User.setCurOrgBroadcasts(arrData);
                }
                this.checkBroadcastError($complete,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    
    async getOrgBroadcastListPromise(){
        
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.orgId = User.selectedOrg.orgId;

        let strURL:string = Api.strBaseURL+this.URL_GET_ORG_BROADCAST_LIST;

        const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
        
        if(response?.summary){
            
            let arrData:IBroadcastListData[] = [];
            
            if(response.data){
                arrData = response.data;
            };
            User.setCurOrgBroadcastList(arrData);
        }
        return response;
    }
    


    async triggerBroadcast($broadcastId:string, $username:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                broadcastId:$broadcastId,
                username:$username,
            };

            let strURL:string = Api.strBaseURL+this.URL_TRIGGER_ORG_BROADCAST;
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary.success){
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }


}