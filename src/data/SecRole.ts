export default interface ISecRole{
    description:string;
    priority:number;
    secRole:string;
    secRoleId:string;
    rootFlag?:boolean;
}


export function getSecRole($secRoleId:string, $roles:ISecRole[]){

    return $roles.find(($value)=>{
        return $value.secRoleId===$secRoleId;
    })
}