import Api, { ApiCallback, ApiData } from "./Api";
import { IAlertData } from "../data/AlertData";
import User from "../data/User";
import { IIncidentReportData } from "../data/IncidentData";

export default class ApiAlertsManager{

    URL_GET_ALERTS:string = "getAlerts";
    URL_DISMISS_UI_NOTIFICATIONS:string = "dismissUiNotifications";
        
    
    async dismissUINotifications($alertIds:string[], $complete:ApiCallback){
        
        try{
            let strURL:string = Api.strBaseURL+this.URL_DISMISS_UI_NOTIFICATIONS;

            let request:any = {};
            request.authorization = Api.getAuthBlock();
            request.alertId = $alertIds;

            const response = await Api.fetchAsyncJSON(strURL, "POST", request,false);
            
            if(response?.summary?.success){
                $complete(true,response);
            }else{
                $complete(false,ApiData.ERROR_LOADING);
            }

        }catch($error){

            $complete(false,ApiData.ERROR_LOADING);
        }

    }

    
    async getAlertsPromise(){
        
        let request:any = {};
        request.authorization = Api.getAuthBlock();

        let strURL:string = Api.strBaseURL+this.URL_GET_ALERTS;

        const response:any = await Api.fetchAsyncJSON(strURL,"POST",request);


        return response;
    }

    
    async getAlerts($complete:ApiCallback){
        
        //make sure to clear them on each try.
        let alerts:IAlertData[] = [];
        let pendingIncidentReports:IIncidentReportData[] = [];
        let rolledIncidentReports:IIncidentReportData[] = [];
        
        
        let successCount:number=0;
        let results:any;

        let requests = [
            this.getAlertsPromise(), // index0
        ];

        if(User.state.checkIncidentReports){            
            requests.push(Api.incidentManager.getPendingIncidentReportsPromise(false)); // index1
            requests.push(Api.incidentManager.getRolledIncidentReportsPromise(false)); // index2

        }


        try{
            
            const responses =  await Promise.all(requests);
            
            let alertsResponse = responses[0];
            let pendingIncidentReportsResponse:any = undefined;
            let rolledIncidentReportsResponse:any = undefined;
            if(User.state.checkIncidentReports){
                pendingIncidentReportsResponse = responses[1];
                rolledIncidentReportsResponse = responses[2];
            }

            results = {}

            if(alertsResponse?.summary?.success){
                if(alertsResponse.data){
                    alerts = alertsResponse.data;
                }
                results.alertsResponse = alertsResponse;
                successCount++;
            }

            if(pendingIncidentReportsResponse && pendingIncidentReportsResponse?.summary?.success){
                if(pendingIncidentReportsResponse.data){
                    pendingIncidentReports = pendingIncidentReportsResponse.data;
                }
                results.pendingIncidentReportsResponse = pendingIncidentReportsResponse;
                successCount++;
            }

            if(rolledIncidentReportsResponse && rolledIncidentReportsResponse?.summary?.success){
                if(rolledIncidentReportsResponse.data){
                    rolledIncidentReports = rolledIncidentReportsResponse.data;
                }
                results.rolledIncidentReportsResponse = rolledIncidentReportsResponse;
                successCount++;
            }


        }catch($error){

            results = ApiData.ERROR_LOADING;
        }

        if(User.state.checkIncidentReports){
            User.setPendingIncidentReports(pendingIncidentReports);
            User.setRolledIncidentReports(rolledIncidentReports);
        }
        User.setAlerts(alerts);
        
        $complete(successCount===requests.length,results);

    }
}