import IOpsRole, { getOpsRole } from "./OpsRole";
import User from "./User";
import FormatUtil from "../util/FormatUtil";
import { IIncidentTypeData } from "./IncidentData";


export default class ChecklistData{
    static APPLIES_TO_SELF:string = "S";
    static APPLIES_TO_SELF_CHILD:string = "Schild";
    static APPLIES_TO_CHILDREN:string = "C";
    static APPLIES_TO_BOTH:string = "B";

    static OPTIONS_FOR_APPLIES_TO = [
        {label:"", value:ChecklistData.APPLIES_TO_SELF},
        {label:"", value:ChecklistData.APPLIES_TO_SELF_CHILD},
        {label:"", value:ChecklistData.APPLIES_TO_BOTH},
        {label:"", value:ChecklistData.APPLIES_TO_CHILDREN}
    ];

    static SET_CHECKLIST_TERMINOLOGY($parentSingular:string,$childSingular:string, $childPlural:string){
        this.OPTIONS_FOR_APPLIES_TO[0].label = $parentSingular;
        this.OPTIONS_FOR_APPLIES_TO[1].label = $childSingular;
        this.OPTIONS_FOR_APPLIES_TO[2].label = $parentSingular+" and all "+$childPlural;
        this.OPTIONS_FOR_APPLIES_TO[3].label = "All "+$childPlural;
    }

    static getAppliesTo($valueID:string, $isChild:boolean=false){

        let searchValue = $valueID;
        if($isChild){
            searchValue+="child";
        }

        let appliesTo = this.OPTIONS_FOR_APPLIES_TO.find(($value)=>{
            return $value.value===searchValue;
        });

        return appliesTo;
    }



    rawData!:IChecklistData;


    firstIncidentType?:IIncidentTypeData;
    firstIncidentTypeId!:string;
    firstOpRole!:IOpsRole;
    dateCreated!:string;
    dateModified?:string;

    lastCompleted!:string;

    appliesToLabel?:string;
    [key:string]:any;
    
    populate=($data:IChecklistData)=>{
        this.rawData = $data;

        this.firstOpRole = getOpsRole(this.rawData.opsRoleIds[0],User.state.opsRoles)!;
        this.firstIncidentTypeId = this.rawData.incidentTypeIds[0];

        this.firstIncidentType = User.state.allIncidentTypes.find(($value)=>{
            return $value.incidentTypeId===this.firstIncidentTypeId;
        })!;


        if(this.rawData.lastCompletedDts){
            this.lastCompleted = FormatUtil.dateHMSMDY(new Date(this.rawData.lastCompletedDts*1000));
        }else{
            this.lastCompleted = "N/A";
        }


        this.dateCreated = FormatUtil.dateHMSMDY(new Date(this.rawData.createDts*1000));
        if(this.rawData.updateDts){
            this.dateModified = FormatUtil.dateHMSMDY(new Date(this.rawData.updateDts*1000));
        }


        let matchingOrg = User.state.userOrgsFlat.find(($org)=>{
            return $org.orgId===this.rawData.orgId;
        });

        
        
        let isChild:boolean=false;
        if(matchingOrg?.parentOrgId){
            isChild=true;
        }

        this.appliesToLabel = ChecklistData.getAppliesTo(this.rawData.appliesTo,isChild)?.label;

    }
    get createdBy(){
        return this.rawData.createUserName;
    }
    get updatedBy(){
        return this.rawData.updateUserName;
    }

    get checklistItems(){
        return this.rawData.checklistItems;
    }
    get orgId(){
        return this.rawData.orgId;
    }
    
    get name(){
        return this.rawData.checklist;
    }
    get appliesTo(){
        return this.rawData.appliesTo;
    }
    get checklistId(){
        return this.rawData.checklistId;
    }

    get firstOpRoleName(){
        let strName:string = "";
        if(this.firstOpRole){
            strName = this.firstOpRole.opsRole;
        }
        return strName;
    }


}




export interface IChecklistData{
    /**
     * The name/label of the checklist
     */
    appliesTo:string;
    checklist:string;
    checklistId:string;
    incidentTypeIds:string[];
    createDts:number;
    createUserName:string;
    orgId:string;
    checklistItems:IChecklistItemData[];
    opsRoleIds:string[];
    lastCompletedDts:number;
    updateDts:number;
    updateUserName:string;
    [key:string]:any;

}


export interface IChecklistItemData{
    /**
     * The name/label of the checklist item
     */
    checklistItem:string;
    checklistItemId:string;
}