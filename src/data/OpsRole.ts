export default interface IOpsRole{
    opsRoleId:string;
    opsRole:string;
    description:string;
    orgTypeId:string;
    orgType:string;
}




export function getOpsRole($opsRoleId:string, $roles:IOpsRole[]){

    return $roles.find(($value)=>{
        return $value.opsRoleId===$opsRoleId;
    });
}