export interface IECData{
    users:IECDataUser[];
    publishToADR:boolean;
}

export interface IECDataUser{
    userId:string;
    emergencyPhone:string;
    phone:string | null;
    firstName:string;
    lastName:string;
    email:string;
    opsRole:string;
    opsRoleId:string;
    secRole:string;
    secRoleId:string;
}


export interface IECDataWidgetTab{
    label:string;
    users:IECDataUser[];
}


export function convertIECDataUserToSimple($data:IECDataUser[]){
    return $data.map(($user)=>{
        return {
            userId:$user.userId,
            emergencyPhone:$user.emergencyPhone
        }
    });
}