import Api, { ApiCallback, ApiData } from "./Api";
import User from "../data/User";
import Dispatcher, { dispatch } from "../dispatcher/Dispatcher";
import WorkerEvent from "../event/WorkerEvent";
import { IAssetData } from "../data/AssetData";

export class ApiAssetManager{
    
    URL_ADD_ASSET:string = "addAsset";
    URL_UPDATE_ASSET:string = "updateAsset";
    URL_DELETE_ASSET:string = "deleteAsset";
    URL_GET_ASSET_CONTENT:string = "requestAsset";
    URL_GET_ASSET:string = "getAsset";
    URL_GET_ASSETS:string = "getAssets";
    URL_GET_ASSET_TYPES:string = "getAssetTypes";

    constructor(){
        
        this.uploadWorker.onmessage = this._onUploadWorkerMessage;
    }


    async getAssetContentURL($assetId:string, $version:number, $inline:boolean,  $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.assetId = $assetId;
            request.orgId = User.selectedOrg.orgId;
            request.version = $version;
            
            let strURL:string = Api.strBaseURL+this.URL_GET_ASSET_CONTENT;
            if($inline){
                strURL+="?inline"
            }

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response?.url){
                $complete(true,response.url);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async getAsset($assetId:string, $complete:ApiCallback){

        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.assetId = $assetId;
            request.orgId = User.selectedOrg.orgId;
            
            let strURL:string = Api.strBaseURL+this.URL_GET_ASSET;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success && response?.data){
                $complete(true,response.data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    };

   

    async getAssets($assetTypeId:string, $complete:ApiCallback){
        
        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.orgId = User.selectedOrg.orgId;
            request.options = {
                getPriorVersions:true
            }
            request.filtering = {
                fields:[
                    {
                        fieldName:"assetTypeId",
                        matchType:"equals",
                        values:[
                            $assetTypeId
                        ]
                    }
                ]
            }

            let strURL:string = Api.strBaseURL+this.URL_GET_ASSETS;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){
                let data:IAssetData[] = [];
                if(response.data){
                    data = response.data;
                }
                $complete(true,data);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }
        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    }

    async getAssetTypesPromise(){
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        let strURL:string = Api.strBaseURL+this.URL_GET_ASSET_TYPES;

        const response = await Api.fetchAsyncJSON(strURL, "POST",request);
        if(response?.summary?.success && response?.data){
            User.setAssetTypes(response.data);
        }

        return response;
    }



    uploadWorker:Worker = new Worker("./upload-worker.js");
    //These static WORKER_ACTIONs match what is inside upload-worker.js
    WORKER_ACTION_UPLOAD = "UPLOAD";
    WORKER_ACTION_UPLOAD_ERROR = "UPLOAD_ERROR";
    WORKER_ACTION_UPLOAD_PROGRESS = "UPLOAD_PROGRESS";
    WORKER_ACTION_UPLOAD_COMPLETE = "UPLOAD_COMPLETE";

    saveAsset($assetTypeId:string, $workerID:string, $metaDetails:any, $file:File | null, $existingAssetId?:string){

        let strURL:string = Api.strBaseURL+this.URL_ADD_ASSET;

        let payload:any = {};
        payload.authorization = Api.getAuthBlock();
        payload.orgId = User.selectedOrg.orgId;
        payload.asset = {
            assetTypeId:$assetTypeId
        };
        if($existingAssetId){
            payload.asset.assetId = $existingAssetId;
            strURL = Api.strBaseURL+this.URL_UPDATE_ASSET;
        }
         
        payload.assetMeta = $metaDetails;

        if($file){
            payload.assetContent = {
                contentType:$file.type,
                contentSize:$file.size,
                fileName:$file.name
            }
        }


        let workerInstructions:any = {
            id:$workerID,
            action:this.WORKER_ACTION_UPLOAD,
            file:$file,
            url:strURL,
            payload:payload
        }

        this.uploadWorker.postMessage(workerInstructions);

    }

    _onUploadWorkerMessage=($event:MessageEvent)=>{
        dispatch(new WorkerEvent(WorkerEvent.WORKER_RESPONSE, $event.data));          
    }


 
    async deleteAsset($assetId:string, $complete:ApiCallback){

        try{
            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.assetId = $assetId;
            request.orgId = User.selectedOrg.orgId;
            
            let strURL:string = Api.strBaseURL+this.URL_DELETE_ASSET;

            const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);

            if(response?.summary?.success){
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){
            $complete(false,ApiData.ERROR_LOADING);
        }
    };

}