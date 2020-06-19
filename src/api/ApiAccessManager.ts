import Api, { ApiCallback, IErrorType, ApiData } from "./Api";
import User from "../data/User";
import AppData from "../data/AppData";
import { dispatch } from "../dispatcher/Dispatcher";
import AppEvent from "../event/AppEvent";


export interface IAccessToken{
    expires:number;
    timeout:number;
    token:string;
    tokenType:string;
}



export interface ITFAMethod{
    tfaMethodId:string;
    type:string;
    value:string;
}

export interface ITFA{
    tfaId:string;
    tfaMethods:ITFAMethod[];
}



export default class ApiAccessManager{

    static ERROR_INVALID_CREDS:IErrorType = {id:"invalidCreds", desc:"Invalid user credentials provided. Please verify and resubmit."};
    static ERROR_INVALID_CODE:IErrorType = {id:"invalidCode", desc:"Invalid Code. Try again or resend code."};
    
    

    URL_DELETE_TOKEN:string = "deleteToken";
    URL_REQUEST_TOKEN:string = "requestToken";
    URL_VALIDATE_TOKEN:string = "validateToken";

    URL_SEND_USER_TFA:string = "sendUserTFA";
    URL_CONFIRM_USER_TFA:string = "confirmUserTFA";

    URL_SET_INIT_PASSWORD:string = "setInitialUserPassword";
    URL_SET_PASSWORD:string = "setUserPassword";
    
    URL_GENERATE_FORGOT_PW:string = "generateForgotUserPassword";
    URL_GET_FORGOT_PW:string = "getForgotUserPassword";
    
    URL_SET_FORGOT_PASSWORD:string = "setForgotUserPassword";
    

    constructor(){

    }

    
    async login($username:string, $password:string, $complete:ApiCallback){

        let success:boolean=false;
        let error:IErrorType = ApiData.ERROR_LOADING;//default

        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock(false);
            request.data = {
                client:Api.getClientBlock(),
                credentials:{
                    username:$username,
                    password:$password
                }
            }
            let strURL:string = Api.strBaseURL+this.URL_REQUEST_TOKEN;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response?.summary){
                if(response.summary.success){
                    success=true;
                    if(response.data?.accessToken){
                        User.setAccessInfo(response.data);
                    }
                    if(response.data?.tfa){
                        User.setTFAInfo(response.data);
                    }
                    if(response.data?.deviceId){
                        User.setDeviceId(response.data.deviceId);
                    }
                }else{
                    switch(response.summary.code){
                        case 500:
                            error = ApiAccessManager.ERROR_INVALID_CREDS;
                        break;
                        case 514:
                            //custom error to include product name
                            
                            error = {id:"deactivatedAccount", desc:"Your account has been deactivated. Please contact your "+AppData.config.general.product_name+" admin to reactivate your account."};
                    }
                }
                
                if(success){
                    $complete(true,response);
                }else{
                    $complete(false,error)
                }

            }else{
                $complete(false,error);
            }
        }catch($error){

            $complete(false,error);
        }
    }



    
    async validateToken($complete:ApiCallback){
                
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.extend=true;

            let strURL:string = Api.strBaseURL+this.URL_VALIDATE_TOKEN;
            
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response?.summary?.success){
                
                User.setAccessInfo(response.data);
                $complete(true,response);
                dispatch(new AppEvent(AppEvent.VALIDATED_TOKEN));
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    
    async sendUserTFA($tfaMethodId:string, $complete:ApiCallback){
                
        try{

            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                client:Api.getClientBlock(),
                tfaId:User.state.tfa?.tfaId,
                tfaMethodId:$tfaMethodId
            }

            let strURL:string = Api.strBaseURL+this.URL_SEND_USER_TFA;
            
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

    async confirmUserTFA($tfaCode:string, $complete:ApiCallback){
                
        try{

            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                client:Api.getClientBlock(),
                tfaId:User.state.tfa?.tfaId,
                tfaCode:$tfaCode
            }

            let strURL:string = Api.strBaseURL+this.URL_CONFIRM_USER_TFA;
            
            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response?.summary?.success && response?.data){
                
                User.setDeviceId(response.data.deviceId);
                User.setAccessToken(response.data.accessToken);

                $complete(true,response);
            }else{
                if(response?.summary){
                    switch(response.summary.code){
                        case 4:
                            $complete(false,ApiAccessManager.ERROR_INVALID_CODE);
                        break;
                        default:
                            $complete(false,ApiData.ERROR_LOADING);
                    }
                }else{
                    $complete(false,ApiData.ERROR_LOADING);
                }
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    

    async logout($complete:ApiCallback){

        let success:boolean=false;
        let error:IErrorType = ApiData.ERROR_LOADING;//default

        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            let strURL:string = Api.strBaseURL+this.URL_DELETE_TOKEN;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response.summary?.success){
                success=true;
            }
            
            //we allow fail
            User.setLoggedOut();

            if(success){
                $complete(true,response);                
            }else{
                $complete(false,error);
            }

        }catch($error){

            $complete(false,error);
        }
    }

    async setInitPassword($password:string, $complete:ApiCallback, $oldPassword?:string){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();

            let passwordData:any = {
                newPass:$password
            }
            request.data = passwordData;

            
            let strURL:string = Api.strBaseURL+this.URL_SET_INIT_PASSWORD;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response?.data){
                
                if(response.data.deviceId){
                    User.setDeviceId(response.data.deviceId);
                }
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    async setPassword($password:string, $oldPassword:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();

            let passwordData:any = {
                newPass:$password,
                oldPass:$oldPassword
            }

            request.data = passwordData;

            
            let strURL:string = Api.strBaseURL+this.URL_SET_PASSWORD;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }
    

    async generateForgotPW($email:string, $complete:ApiCallback){

        let success:boolean=false;
        let error:IErrorType = ApiData.ERROR_LOADING;//default

        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                client:Api.getClientBlock(),
                email:$email
            }

            let strURL:string = Api.strBaseURL+this.URL_GENERATE_FORGOT_PW;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response.summary?.success){
                success=true;
            }
            
            if(success){
                $complete(true,response);                
            }else{
                $complete(false,error);
            }

        }catch($error){

            $complete(false,error);
        }
    }

    async getForgotPW($complete:ApiCallback){

        let success:boolean=false;
        let error:IErrorType = ApiData.ERROR_LOADING;//default

        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.data = {
                id:User.state.forgotPWId
            }

            let strURL:string = Api.strBaseURL+this.URL_GET_FORGOT_PW;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);
            if(response.summary?.success && response.data){
                success=true;
            }
            
            if(success){
                $complete(true,response);                
            }else{
                $complete(false,error);
            }

        }catch($error){

            $complete(false,error);
        }
    }

    async setForgotPassword($password:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();

            let passwordData:any = {
                client:Api.getClientBlock(),
                id:User.state.forgotPWId,
                newPass:$password
            }

            request.data = passwordData;
            
            let strURL:string = Api.strBaseURL+this.URL_SET_FORGOT_PASSWORD;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response.data){
                if(response.data.accessToken){
                    User.setAccessToken(response.data.accessToken);
                }

                if(response.data.deviceId){
                    User.setDeviceId(response.data.deviceId);
                }
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }



    
}




