import User from "../data/User";
import HashUtil from "../util/HashUtil";
import ApiAccessManager from "./ApiAccessManager";
import AppData from "../data/AppData";
import ApiOrgManager from "./ApiOrgManager";
import XMLUtil from "../util/XMLUtil";
import ApiUserManager from "./ApiUserManager";
import ApiRoleManager from "./ApiRoleManager";
import { ApiAssetManager } from "./ApiAssetManager";
import { ApiIncidentManager } from "./ApiIncidentManager";
import Dispatcher, { dispatch } from "../dispatcher/Dispatcher";
import AppEvent from "../event/AppEvent";
import ApiChecklistManager from "./ApiChecklistManager";
import ApiSettingsManager from "./ApiSettingsManager";
import IUserData from "../data/UserData";
import ApiGoogleMapsManager from "./ApiGoogleMapsManager";
import ApiAlertsManager from "./ApiAlertsManager";
import ApiCalendarManager from "./ApiCalendarManager";



export type ApiCallback  = ($success:boolean, $results:any)=>void;


export interface IErrorType{
    id:string;
    desc:string;
    code?:number;
}


interface IEnv{
    default:string;
    name:string;
    url:string;
}


export class ApiData{

    static ERROR_LOADING:IErrorType = {id:"errorLoading", desc:"Error Loading"};
    static ERROR_INVALIDTOKEN:IErrorType = {id:"invalidToken", desc:"Your session has expired or become invalid."};
    static ERROR_INVALIDCREDS:IErrorType = {id:"invalidCreds", desc:"Incorrect Credentials"};
    static ERROR_ACCESS:IErrorType = {id:"accessError", desc:"Access Permission Error"};
    static ERROR_UNKNOWNUSER:IErrorType = {id:"unknownUserError", desc:"Unknown User Error"};
    static ERROR_SYSTEM:IErrorType = {id:"systemError", desc:"System Error"};


    access:ApiAccessManager = new ApiAccessManager();
    orgManager:ApiOrgManager = new ApiOrgManager();
    userManager:ApiUserManager = new ApiUserManager();
    roleManager:ApiRoleManager = new ApiRoleManager();
    assetManager:ApiAssetManager = new ApiAssetManager();
    incidentManager:ApiIncidentManager = new ApiIncidentManager();
    checklistManager:ApiChecklistManager = new ApiChecklistManager();
    settingsManager:ApiSettingsManager = new ApiSettingsManager();
    alertsManager:ApiAlertsManager = new ApiAlertsManager();
    googleMapsManager:ApiGoogleMapsManager = new ApiGoogleMapsManager();
    calendarManager:ApiCalendarManager = new ApiCalendarManager();

    strBaseURL:string = "";
    curEnv!:IEnv;
    allEnvs:IEnv[] = [];


    cacheMaxAgeMS:number = 1000*60*5; 

    apiVersion:string = "4.0.1";

    apiKey:string = "SAFETYSHIELDDEV01";
    apiSecret:string = "st8903a90bu3y50by50vxlkzcrgjcn289cz4ozccnvh73m3b";


    strIdentifier:string = "3813874866";//random 10 digit number I made up

    URL_INIT:string = "init";

    constructor(){

    }
    
    isExpired=($date?:Date):boolean=>{
        let shouldGetAgain:boolean=true;
        if($date){
            let now:Date = new Date();
            let difference = now.getTime()-$date.getTime();
            if(difference<=this.cacheMaxAgeMS){
                shouldGetAgain=false;
            }
        }
        return shouldGetAgain;
    };

    async getInit($complete:ApiCallback){

        try{

            let strURL:string = this.strBaseURL+this.URL_INIT;

            let request:any = {};
            request.authorization = this.getAuthBlock();
            request.data = {
                client:Api.getClientBlock(),
            }
            
            const response:any = await this.fetchAsyncJSON(strURL,"POST",request);
            if(response?.summary?.success){
                AppData.setInitInfo(response);
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }


    async getConfig($complete:ApiCallback){
        try{
            let strConfigURL:string = "./config.xml?t="+Date.now();

            const response:any = await this.fetchAsyncText(strConfigURL,"GET",undefined,true);
            let strText:string = response;
            if(strText!==""){
                let objResponse = XMLUtil.parseStringXMLToObj(strText);
                if(objResponse?.data?.envs?.env){
                    let envs:IEnv[] = [];
                    if(Array.isArray(objResponse.data.envs.env)){
                        envs = objResponse.data.envs.env;
                    }else{
                        envs.push(objResponse.data.envs.env);
                    }

                    let defaultIndex:number=0;
                    for(let i:number=0; i<envs.length; i++){
                        if(envs[i].default==="true"){
                            defaultIndex=i;
                            break;
                        }
                    }

                    this.allEnvs = envs;
                    this.curEnv = envs[defaultIndex];
                    this.strBaseURL = this.curEnv.url;
                    $complete(true,envs);
                }
            }else{
                $complete(false,{});
            }
        }catch($error){
            $complete(false,$error);
        }
    }

    getClientBlock(){

        let deviceDetails:any = {}
        if(User.savedData.deviceId && User.savedData.deviceId!==""){
            deviceDetails.deviceId = User.savedData.deviceId;
        }
        return {
            appId:AppData.appID,
            appVersion:AppData.version,
            siteUrl:AppData.siteUrl,
            ...deviceDetails
        }
    }

    getAuthBlock($includeAssetTokens:boolean=true){

        let timestamp:number = Date.now();
        let sequenceNum:string = HashUtil.sha1(this.strIdentifier);
        let text:string = sequenceNum+(timestamp%10000);
        let validation:string = HashUtil.md5(text);

        let authBlock:any = {
            apikey:this.apiKey,
            apisecret:this.apiSecret,
            validation:validation,
            sequenceNum:sequenceNum,
            timestamp:timestamp
        }
        if($includeAssetTokens && User.state.accessToken!==null){
            let {tokenType, token} = User.state.accessToken;

            let accessTokens:{[key:string]:any} = {};
            accessTokens[tokenType] = token;
            authBlock.accessTokens = accessTokens;
        }else{
        }

        return authBlock;
    }


    getOrgPromises=()=>{

        let orgPromises = [
            Api.userManager.getUserOrgSettingsPromise(),
            Api.orgManager.getSelectedOrgPromise(),
            Api.roleManager.getOpsRolesPromise(),
            Api.roleManager.getSecRolesPromise(),
            Api.incidentManager.getIncidentTypesPromise(),
            Api.incidentManager.getIncidentStatusesPromise(),
            Api.orgManager.getOrgTypesPromise(),
        ];



        return orgPromises
    }


    async getSelectedOrgInfo($complete:ApiCallback){
        try{
            let success:boolean=true;
            const results = await Promise.all(this.getOrgPromises());
            
            results.forEach(($response)=>{
                if($response?.summary?.success){

                }else{
                    success=false;
                }
            });
            
            if(success){   
                $complete(true,{});
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING)
        }
    }


    async getInitInfo($complete:ApiCallback){
        
        try{

            let userId:string = "";
            if(User.state.userInfo?.userId){
                userId = User.state.userInfo?.userId;
            }
            const results = await Promise.all([
                Api.userManager.getUserPromise(userId),
                Api.assetManager.getAssetTypesPromise(),
                ...this.getOrgPromises()
            ]);

            let success:boolean=true;

            results.forEach(($response)=>{
                if($response?.summary?.success){

                }else{
                    success=false;
                }
            });

            let userResult = results[0];
            if(userResult?.summary?.success && userResult?.user){
                let userPeopleData:IUserData = userResult.user;
                User.setUserPeopleData(userPeopleData);
            }

            User.state.userOrgsFlat.forEach(($org)=>{
                $org.setupAssetRights();
            });
            
            if(success){   
                User.setLoggedIn();
                $complete(true,{});
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING)
        }
    } 


    async fetchAsyncJSON($url:string, $method:string="POST", $data:any=null, $canCheckAlerts:boolean=true){

        let strPayload:string = "";
        if($data){
            strPayload = JSON.stringify($data);
        }        
        let reqInit:RequestInit = {
            method:$method
        };
        if(strPayload!==""){
            reqInit.body = strPayload;
        }

        if(User.isDebug) console.log(">>>"+$url+" requ: ",strPayload);        
        try{
            const response:Response = await fetch($url,reqInit);
            
            let apiError:IErrorType | null = null;

            //HTTP STATUS CODES
            switch(response.status){
                case 404:
                    //loading error
                    apiError = ApiData.ERROR_LOADING;
                break;
                case 503:
                    //system error
                    apiError = ApiData.ERROR_SYSTEM;
                break;
            }

            if(apiError===null){//ok
                const json:any = await response.json();

                let forceLogoutApiError;

                let alertsAvailable:boolean=false;

                //SUMMARY STATUS CODES
                if(json && json.summary){

                    if(json.summary.alertsAvailable){
                        alertsAvailable = true;
                    }


                    if(json.summary.code){

                        switch(json.summary.code){
                            case 501: //access denied, no permissions to do this
                                forceLogoutApiError = ApiData.ERROR_ACCESS;
                            break;
                            case 502: //unknown user
                                forceLogoutApiError = ApiData.ERROR_UNKNOWNUSER;
                            break;
                            case 503: //invalid token/expired token
                                forceLogoutApiError = ApiData.ERROR_INVALIDTOKEN;
                            break;
                        }
                    }

                }

                if(forceLogoutApiError){
                    dispatch(new AppEvent(AppEvent.FORCE_LOGOUT, forceLogoutApiError));
                    
                }

                if(User.isDebug) console.log("<<<"+$url+" resp: ",json);               
                return json;
            }else{//error
                return Promise.reject(apiError);
            }

        }catch($error){
            if(User.isDebug) console.log("<<<ERROR:",$error);            
            return Promise.reject($error.toString());
        }
    }
    
    async fetchAsyncText($url:string,$method:string="POST",$data:any=null, $silent:boolean=false){
        let strPayload:string = "";
        if($data){
            strPayload = $data;
        }        
        let reqInit:RequestInit = {
            method:$method
        };
        if(strPayload!==""){
            reqInit.body = strPayload;
        }

        if(User.isDebug && !$silent) console.log(">>>"+$url);        
        try{
            const response:Response = await fetch($url,reqInit);
            const text:any = await response.text();
            if(User.isDebug && !$silent) console.log("<<<"+$url+" resp: ",text);               
            return text;
        }catch($error){
            if(User.isDebug && !$silent) console.log("<<<ERROR:",$error);            
            return Promise.reject(new Error("Error loading: "+$url));
        }
    }

}

const Api:ApiData = new ApiData();
export default Api;