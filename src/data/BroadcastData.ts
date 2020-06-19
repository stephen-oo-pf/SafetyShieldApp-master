export interface IBroadcastData{
    broadcastId:string;
    createDts:number;
    createUserId:string;    
    incidentBroadcastId:string;
    incidentStatusId:string;
    incidentTypeId:string;
    lastInvocationDts:number;
    lastVerifiedDts:number;
    name:string;

    updateDts:number;
    updateUserId:string;
    username:string;
    verifiedFlag:number;
    [key:string]:any;
}

export interface IBroadcastListData{
    username:string;
    broadcastId:string;
    name:string;
    description:string;
}