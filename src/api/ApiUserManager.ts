import Api, { ApiCallback, ApiData, IErrorType } from "./Api";
import IUserData, { UserData } from "../data/UserData";
import User from "../data/User";

export default class ApiUserManager{
    

    static ERROR_CANT_ADD_ROOT_USER:IErrorType = {id:"cantAddRootUser", desc:"Can't add due to root user."};
    static ERROR_CANT_ADD_ALREADY_IN_ORG:IErrorType = {id:"cantAddAlreadyInOrg", desc:"Can't add due to already in organization."};
    static ERROR_CANT_ADD_ALREADY_IN_ANOTHER_ORG:IErrorType = {id:"cantAddAlreadyInAnotherOrg", desc:"User already exists in another account."};
    static ERROR_CANT_ADD_SECURITY_PERMISSION:IErrorType = {id:"cantAddSecurityPermission", desc:"The existing user you have requested to add has security permissions that exceed the level you are able to administer."};


    URL_GET_USERS:string = "getUsers";
    URL_GET_USER:string = "getUser";
    URL_INVITE_USER:string = "inviteUser";
    URL_UPDATE_USER:string = "updateUser";
    URL_INVITE_USER_PRECHECK:string = "addUserPreCheck";
    URL_GET_USER_INVITATION:string = "getUserInvitation";
    URL_GET_USER_SETTINGS:string = "getUserSettings";
    URL_GET_USER_ORG_ACTIVITY:string = "getUserOrgActivity";
    
    



    async getUsers($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;

            let strURL:string = Api.strBaseURL+this.URL_GET_USERS;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){

                let arrIUsers:IUserData[] = [];
                
                if(response.user){
                    arrIUsers = response.user;
                }

                let arrUsers:UserData[] = arrIUsers.map(($value)=>{
                    let userD:UserData = new UserData();
                    userD.populate($value);
                    return userD;
                });




                User.setAllPeopleData(arrUsers);
                

                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async getUserPromise($userId:string, $allOrgsEvenIfAllAreReadOnly?:boolean){
        
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.userId = $userId;
        if($allOrgsEvenIfAllAreReadOnly){
            request.allOrgsEvenIfAllAreReadOnly=true;
        }

        let strURL:string = Api.strBaseURL+this.URL_GET_USER;
        return await Api.fetchAsyncJSON(strURL,"POST",request);
    }
    async getUser($userId:string, $complete:ApiCallback, $allOrgsEvenIfAllAreReadOnly?:boolean){
        
        try{
            const response:any = await this.getUserPromise($userId, $allOrgsEvenIfAllAreReadOnly);

            if(response?.summary?.success && response?.user){

                $complete(true,response.user);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async inviteUserPreCheck($email:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;
            request.email = $email;
            
            let strURL:string = Api.strBaseURL+this.URL_INVITE_USER_PRECHECK;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response.data){

                let canAdd:boolean=false;
                let errorAddCode:number = -1;

                if(response.data.addCode){
                    errorAddCode = response.data.addCode;
                }
                if(response.data.canAdd){
                    canAdd=true;
                }


                if(canAdd){
                   $complete(true,response);

                }else{

                    switch(errorAddCode){
                        case 1:
                            $complete(false,ApiUserManager.ERROR_CANT_ADD_ROOT_USER);
                        break;
                        case 2:
                            $complete(false,ApiUserManager.ERROR_CANT_ADD_ALREADY_IN_ORG);
                        break;
                        case 3:
                            $complete(false,ApiUserManager.ERROR_CANT_ADD_ALREADY_IN_ANOTHER_ORG);
                        break;
                        case 4:
                            $complete(false,ApiUserManager.ERROR_CANT_ADD_SECURITY_PERMISSION);
                        break;
                        default:
                            $complete(false,ApiData.ERROR_LOADING);
                    }
                }


            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async inviteUser($newUserDetails:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                client:Api.getClientBlock(),
                user:$newUserDetails
            }
            
            let strURL:string = Api.strBaseURL+this.URL_INVITE_USER;

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
    async updateUser($userDetails:any, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                user:$userDetails
            }
            
            let strURL:string = Api.strBaseURL+this.URL_UPDATE_USER;

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
    async getInvitation($invitationId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                client:Api.getClientBlock(),
                id:$invitationId
            };

            
            let strURL:string = Api.strBaseURL+this.URL_GET_USER_INVITATION;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response?.data){

                User.setAccessToken(response.data.accessToken);

                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    

    async getUserOrgSettings($complete:ApiCallback){
        try{

            let response = await this.getUserOrgSettingsPromise();

            if(response?.summary?.success){
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async getUserOrgSettingsPromise(){
        
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        request.userId = User.state.userInfo?.userId;
        request.orgId = User.selectedOrg.orgId;

        let strURL:string = Api.strBaseURL+this.URL_GET_USER_SETTINGS;

        let response = await Api.fetchAsyncJSON(strURL,"POST",request);

        if(response?.summary?.success && response?.data?.settings){
            User.selectedOrg.setOrgSettings(response.data.settings);
        }
        return response;
    }

    
    
    async getUserOrgActivity($complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId=User.selectedOrg.orgId;
            //request.numDays = 7


            
            let strURL:string = Api.strBaseURL+this.URL_GET_USER_ORG_ACTIVITY;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response?.data){

                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    
    



}