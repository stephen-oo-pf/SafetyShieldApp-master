import Api, { ApiCallback, ApiData } from "./Api";
import { IChecklistData } from "../data/ChecklistData";
import User from "../data/User";

export default class ApiChecklistManager{
    
    URL_GET_USER_CHECKLISTS:string = "getUserChecklists";
    URL_GET_USER_CHECKLIST:string = "getUserChecklist";

    URL_GET_CHECKLISTS:string = "getChecklists";
    URL_GET_CHECKLIST:string = "getChecklist";

    URL_ADD_CHECKLIST:string = "addChecklist";
    URL_UPDATE_CHECKLIST:string = "updateChecklist";
    URL_DELETE_CHECKLIST:string = "deleteChecklist";


    async getUserChecklists($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;
            request.userId = User.state.userInfo?.userId;

            let strURL:string = Api.strBaseURL+this.URL_GET_USER_CHECKLISTS;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){
                
                let arrChecklist:IChecklistData[] = [];
                if(response.data){
                    arrChecklist = response.data;
                }

                $complete(true,arrChecklist);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async getChecklists($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;

            let strURL:string = Api.strBaseURL+this.URL_GET_CHECKLISTS;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){                
                let arrChecklist:IChecklistData[] = [];
                if(response.data){
                    arrChecklist = response.data;
                }
                $complete(true,arrChecklist);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }


        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async getChecklist($checklistId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;
            request.checklistId = $checklistId;

            let strURL:string = Api.strBaseURL+this.URL_GET_CHECKLIST;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response.data){
                
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async getUserChecklist($checklistId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;
            request.checklistId = $checklistId;
            request.userId = User.state.userInfo?.userId;

            let strURL:string = Api.strBaseURL+this.URL_GET_USER_CHECKLIST;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response.data){
                
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    
    async addChecklist($checklistDetails:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                ...$checklistDetails
            }
            let strURL:string = Api.strBaseURL+this.URL_ADD_CHECKLIST;

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
    
    async updateChecklist($checklistId:string, $checklistDetails:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                checklistId:$checklistId,
                ...$checklistDetails
            }
            let strURL:string = Api.strBaseURL+this.URL_UPDATE_CHECKLIST;

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

    async deleteChecklist($checklistId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                orgId:User.selectedOrg.orgId,
                checklistId:$checklistId
            }
            let strURL:string = Api.strBaseURL+this.URL_DELETE_CHECKLIST;

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