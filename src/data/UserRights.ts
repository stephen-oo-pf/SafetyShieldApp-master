export default class UserRights{
    static ROOT_ADMIN:string = "right-root-admin";
    static USER_ADMIN:string = "right-user-admin";
    static ORG_ADMIN:string =  "right-org-admin";

    
    static WIDGET_ORG_SUMMARY:string = "right-widget-org-summary";

    static ORGS_VIEW:string = "right-view-orgs";
    static ORGS_EDIT:string = "right-edit-orgs";
    static ORGS_CREATE:string = "right-create-orgs";
    static ORGS_DELETE:string = "right-delete-orgs";

    
    static CHECKLIST_VIEW:string = "right-view-checklist";
    static CHECKLIST_MY_VIEW:string = "right-view-my-checklists";
    static CHECKLIST_EDIT:string = "right-edit-checklist";
    static CHECKLIST_CREATE:string = "right-create-checklist";
    static CHECKLIST_DELETE:string = "right-delete-checklist";

    static MANAGE_EC:string =  "right-manage-emergency-contacts";
    static MANAGE_BROADCASTS:string =  "right-manage-incident-broadcasts";
    static INCIDENT_CONTROL:string = "right-incident-control";
    static EDIT_ORG_SETTINGS:string = "right-edit-org-settings";
    
    
}

export interface IRightGroup{
    canView:boolean;
    canEdit:boolean;
    canAdd:boolean;
    canDelete:boolean;
}
export const createRightGroup = ():IRightGroup=>{
    return {
        canView:false,
        canEdit:false,
        canAdd:false,
        canDelete:false,
    }
}



export function hasUserRight($right:string,$rights:string[]){
    return $rights.indexOf($right)!==-1;
}