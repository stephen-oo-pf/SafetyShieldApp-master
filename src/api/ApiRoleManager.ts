import Api from "./Api";
import IOpsRole from "../data/OpsRole";
import User from "../data/User";
import ISecRole from "../data/SecRole";

export default class ApiRoleManager{
   
    URL_GET_OPS_ROLES:string = "getOpsRoles";
    URL_GET_SEC_ROLES:string = "getSecRoles";
    

    async getSecRolesPromise(){
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        let strURL:string = Api.strBaseURL+this.URL_GET_SEC_ROLES;

        const response = await Api.fetchAsyncJSON(strURL, "POST",request);
        if(response?.summary?.success){
            let secRoles:ISecRole[] = [];
            if(response.data){
                secRoles = response.data;
            }
            User.setSecRoles(secRoles);
        }

        return response;
    }
    async getOpsRolesPromise(){
        let request:any = {};
        request.authorization = Api.getAuthBlock();
        let strURL:string = Api.strBaseURL+this.URL_GET_OPS_ROLES;

        const response = await Api.fetchAsyncJSON(strURL,"POST", request);
        if(response?.summary?.success){
            let opsRoles:IOpsRole[] = [];
            if(response.data){
                opsRoles = response.data;
            }
            User.setOpsRoles(opsRoles);
        }

        return response;
    }
    
}