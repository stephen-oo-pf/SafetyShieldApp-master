import IRawOrganization, { Organization, sortOrgsIntoHierarchy as sortOrgsIntoHierarchy } from "./Organization";
import User from "./User";
import FormatUtil from "../util/FormatUtil";
import { FilterTagGroup } from "../overlay/FilterOverlay";
import AppData from "./AppData";

export interface IUserDataEmail{
    label:string;
    email:string;
    primary:boolean;
}
export interface IUserDataPhone{
    label:string;
    number:number;
    extension:string | null;
    primary:boolean;
    mobileFlag:boolean;
}
export default interface IUserData{
    userId:string;
    firstName:string;
    lastName:string;
    emails:IUserDataEmail[];
    orgIds:string[];
    createDts:number;
    updateDts:number;
    phones:IUserDataPhone[] | null;
    addresses:string | null;
    organizations?:IRawOrganization[] | null;
    [key:string]:any;
}

export class UserData{

    private _rawData!:IUserData;

    fullName:string = "";
    lastCommaFirst:string = "";

    firstSecRole:string = "";
    firstSecRoleId:string = "";

    firstOpsRole:string = "";
    firstOpsRoleId:string = "";


    updateDate:string = "";
    createdDate:string = "";

    primaryEmail:string = "";
    mobilePhone:string = "";

    canEditForSelectedOrg:boolean=false;
    editMustHappenAtDistrictLvl:boolean=false;

    orgHierarchy:Organization[] = [];
    orgsFlat:Organization[] = [];

    [key:string]:any;

    populate=($rawData:IUserData)=>{
        this._rawData = $rawData;

        

        this.fullName = this.firstName+" "+this.lastName;

        this.lastCommaFirst = this.lastName+", "+this.firstName;

        let canEditForSelectedOrg:boolean = false;
        let editMustHappenAtDistrictLevel:boolean = false;

        let selectedOrgsParentId:string = "";
        if(User.selectedOrg.parentOrgId){
            selectedOrgsParentId = User.selectedOrg.parentOrgId;
        }
        
        let strSecRole:string = "";
        let strSecRoleId:string = "";
        let numSecRolePriority:number = 0;
        
        let strOpsRole:string = "";
        let strOpsRoleId:string = "";

        if(this.organizations){

            let orgsAsClasses = this.organizations.map(($iorg)=>{
                let org:Organization = new Organization();
                org.populate($iorg);
                return org;
            })

            this.orgsFlat = orgsAsClasses;
            this.orgHierarchy = sortOrgsIntoHierarchy(orgsAsClasses);

            let selectedParentOrg;


            this.organizations.forEach(($org)=>{
                if($org.orgId===selectedOrgsParentId){
                    selectedParentOrg = $org;
                }
            })




            if(this.orgHierarchy.length>0){
                let firstOrg = this.orgHierarchy[0];
                
                if(firstOrg.secRole){
                    strSecRole = firstOrg.secRole.secRole;
                    strSecRoleId = firstOrg.secRole.secRoleId;
                    if(firstOrg.secRole.priority){
                        numSecRolePriority = firstOrg.secRole.priority;
                    }
                }                
                if(firstOrg.opsRole){
                    strOpsRole = firstOrg.opsRole.opsRole;
                    strOpsRoleId = firstOrg.opsRole.opsRoleId
                }
            }

            if(User.selectedOrg.secRole){
                if(numSecRolePriority<User.selectedOrg.secRole.priority || (numSecRolePriority===User.selectedOrg.secRole.priority && AppData.config.general.user_edit_same_permission==="Y")){
                    canEditForSelectedOrg=true;
                }
            }

            if(selectedParentOrg){
                editMustHappenAtDistrictLevel=true;
                canEditForSelectedOrg=false;
            }


        }

        this.firstSecRole = strSecRole;
        this.firstSecRoleId = strSecRoleId;

        this.firstOpsRole = strOpsRole;
        this.firstOpsRoleId = strOpsRoleId;

        this.editMustHappenAtDistrictLvl = editMustHappenAtDistrictLevel;
        this.canEditForSelectedOrg = canEditForSelectedOrg;


        if(this._rawData.createDts){

            if(isNaN(this._rawData.createDts)){
                this.createdDate = this._rawData.createDts+"";
            }else{
                this.createdDate = FormatUtil.dateHMSMDY(new Date(Number(this._rawData.createDts)*1000),true,false);
            }
        }
        
        if(this._rawData.updateDts){
            
            
            if(isNaN(this._rawData.updateDts)){
                this.updateDate = this._rawData.updateDts+"";
            }else{
                this.updateDate = FormatUtil.dateHMSMDY(new Date(Number(this._rawData.updateDts)*1000),true,false);

            }
        }

        //Email
        let email:string = "";
        let hasPrimaryEmail:boolean = false;
        this._rawData.emails.forEach(($email)=>{
            if($email.primary){
                hasPrimaryEmail=true;
                email = $email.email;
            }
        });
        if(!hasPrimaryEmail){
            email = this._rawData.emails[0].email;
        }
        this.primaryEmail = email;


        //Mobile Phone
        let strMobilePhone:string = "";
        let phone:IUserDataPhone | undefined = undefined;

        if(this._rawData.phones && this._rawData.phones.length>0){
            let mobilePhones:IUserDataPhone[];
            if(this._rawData.phones.length===1){
                //its all we have
                phone = this._rawData.phones[0];
            }else{
                //get only mobile phones
                mobilePhones = this._rawData.phones.filter(($phone)=>{
                    return $phone.mobileFlag;
                });
                if(mobilePhones.length===0){
                    //none were mobile... so just take first
                    phone = this._rawData.phones[0];

                }else{
                    //now look for primary
                    let primaryMobilePhone = mobilePhones.find(($mobilePhone)=>{
                        return $mobilePhone.primary;
                    });
                    if(primaryMobilePhone){
                        //got a primary mobile!
                        phone = primaryMobilePhone;
                    }else{
                        phone = mobilePhones[0];
                        //mobile phones but non primary... take first one
                    }
                }
            }
        }

        if(phone && phone.hasOwnProperty("number") && phone.number!==null){
            strMobilePhone = ""+phone.number;
        }

        this.mobilePhone = strMobilePhone;

    }
    get userId(){
        return this._rawData.userId;
    }
    get firstName(){
        return ""+this._rawData.firstName;
    }
    get lastName(){
        return ""+this._rawData.lastName;
    }
    get organizations(){
        return this._rawData.organizations;
    }
    get orgIds(){
        return this._rawData.orgIds;
    }
    get phones(){
        return this._rawData.phones;
    }

    
}



export function UserDataFilter($manualFilter:string,$filterTagGroups:FilterTagGroup[], $ppl:UserData[]){

    let arrManualFilter:string[] = $manualFilter.toLowerCase().split(" ");


    let doesAnyGroupHaveTags = $filterTagGroups.some(($group)=>{
        return $group.tags.length>0;
    });

    return $ppl.filter(($person:UserData,$personIndex:number)=>{

        let isUserOk:boolean=false;

        //Manual Search Filter
        let manualOk:boolean=false;
        let countManualOk:number=0;
        arrManualFilter.forEach(($curFilter)=>{
            
            let isOk:boolean=false;
            if($person.firstName && $person.firstName.toLowerCase().indexOf($curFilter)!==-1){
                isOk=true;
            }
            if($person.lastName && $person.lastName.toLowerCase().indexOf($curFilter)!==-1){
                isOk=true;
            }
            if($person.primaryEmail && $person.primaryEmail.toLowerCase().indexOf($curFilter)!==-1){
                isOk=true;
            }
            if(isOk) countManualOk++;
        });

        if(countManualOk===arrManualFilter.length){
            manualOk=true;
        }




        //Filter Tags
        let filterTagsOk:boolean=true;
        let countFilterTagOk:number=0;
        if(doesAnyGroupHaveTags){
            filterTagsOk=false;
            $filterTagGroups.forEach(($group)=>{
                let groupOk:boolean=true;

                if($group.tags.length>0){
                    groupOk=false;
                }

                switch($group.property){
                    case "firstSecRoleId":
                        $group.tags.forEach(($tag)=>{
                            if($person.firstSecRole===$tag){
                                groupOk=true;
                            }
                        });
                    break;
                    case "firstOpsRoleId":
                        $group.tags.forEach(($tag)=>{
                            if($person.firstOpsRole===$tag){
                                groupOk=true;
                            }
                        });
                    break;
                }
                if(groupOk){
                    countFilterTagOk++;
                }
            });

            if(countFilterTagOk===$filterTagGroups.length){
                filterTagsOk=true;
            }
        }

        isUserOk = filterTagsOk && manualOk;


        return isUserOk;
    });

}