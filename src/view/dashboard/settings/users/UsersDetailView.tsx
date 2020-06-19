import React from 'react';
import UIView from '../../../../ui/UIView';

import UIDetailFrame from '../../../../ui/UIDetailFrame';
import UsersView from './UsersView';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import Api, { IErrorType } from '../../../../api/Api';
import IUserData, { UserData, IUserDataEmail, IUserDataPhone } from '../../../../data/UserData';
import UIButton, { UIDeleteButton, UIPhoneButton } from '../../../../ui/UIButton';

import UIViewFields, { UIViewFieldsItem } from '../../../../ui/UIViewFields';

import UsersEditFields, {IUsersEditFieldsState} from './UsersEditFields';
import ConfirmOverlay from '../../../../overlay/ConfirmOverlay';
import deleteIcon from '@iconify/icons-mdi/delete';

import LoadingOverlay from '../../../../overlay/LoadingOverlay';
import User from '../../../../data/User';
import AlertOverlay from '../../../../overlay/AlertOverlay';
import UIStatusBanner from '../../../../ui/UIStatusBanner';
import MyAccountView from '../../myaccount/MyAccountView';
import UIIcon from '../../../../ui/UIIcon';

import launchIcon from '@iconify/icons-mdi/launch';
import { Organization } from '../../../../data/Organization';
import accountOff from '@iconify/icons-mdi/account-off';



export interface UsersDetailViewProps extends RouteComponentProps{
    userId?:string;
    mode:string;
    myAccount?:boolean;
    
}

export interface UsersDetailViewState {
    addError?:IErrorType;
    loading:boolean;
    error?:IErrorType;
    data?:UserData;
    step:string;
    userAlreadyExists:boolean;
    userDeactivated:boolean;
    redirectToList:boolean;
    statusInfo?:string;
}

export default class UsersDetailView extends React.Component<UsersDetailViewProps, UsersDetailViewState> {
    static ID:string = "usersDetail";

    
    static STEP_EMAIL:string = "step-email";
    static STEP_DETAILS:string = "step-details";


    editFields:React.RefObject<UsersEditFields> = React.createRef();

    _isUnmounting:boolean=false;
    
    _saving:boolean=false;

    constructor(props: UsersDetailViewProps) {
        super(props);
        

        let step:string = UsersDetailView.STEP_EMAIL;
        let isLoading:boolean=false;
        if(this.props.userId){
            isLoading=true;
            step = UsersDetailView.STEP_DETAILS;
        }

        this.state = {
            userDeactivated:false,
            userAlreadyExists:false,
            loading:isLoading,
            step:step,
            redirectToList:false,
        }
    }
    componentDidMount(){
        

        if(this.props.userId){
            this._loadData(this.props.userId);
        }
    }
    componentDidUpdate($prevProps:UsersDetailViewProps){
        if(this.props.userId && this.props.userId!==$prevProps.userId){
            this._loadData(this.props.userId);
        }
    }
    componentWillUnmount(){
        this._isUnmounting=true;
    }
    _loadData=($userId:string,$allOrgsEvenIfAllAreReadOnly?:boolean)=>{
        if(!this._isUnmounting){
            this.setState({
                loading:true,  
                error:undefined,
                data:undefined,
            },()=>{

                let doneCount:number=0;
                let successCount:number=0; 

                let thingsToDo:number = 1;
                const checkDone=()=>{
                    if(doneCount===thingsToDo){
                        if(successCount===thingsToDo){
                            if(!this._isUnmounting){
                                this.setState({loading:false});
                            }
                        }
                    }
                }

                Api.userManager.getUser($userId,($success:boolean, $results:any)=>{


                    if($success){
                        let iuser:IUserData = $results as IUserData;   
                        
                        let user:UserData = new UserData();
                        user.populate(iuser);

                        
                        if(!this._isUnmounting){

                            //If editing, and this user is NOT allowed to be editted... Redirect
                            if(this.props.mode===UIDetailFrame.MODE_EDIT && !user.canEditForSelectedOrg){
                                this.setState({redirectToList:true});
                            }else{
                                successCount++;   

                                let statusInfo;
                                if(user.editMustHappenAtDistrictLvl && !user.canEditForSelectedOrg && !this.props.myAccount){
                                    

                                    statusInfo = User.selectedOrg.terminologyList.user.singular+" can only be modified at the "+User.selectedOrg.terminologyList.parent_org.singular+" level";
                                }
                                this.setState({data:user, statusInfo:statusInfo});   
                            }
 
                        }    
                    }else{
                        if(!this._isUnmounting){
                            this.setState({loading:false, error:$results});
                        }
                    }
                    doneCount++;
                    checkDone();
                },$allOrgsEvenIfAllAreReadOnly);
            });
            
        }
        
    }
    _onClickSave=()=>{
        this._trySaveDetails();
    }
    _trySaveDetails=()=>{
        //we need to check if we're attempting to save this user as "deactivated" (unchecking all orgs and they dont have any readonly orgs)... if so we show a confirm.
        if(this.editFields.current){

            let readonlyOrgs:boolean=false;

            if(this.state?.data?.orgsFlat){
                
                this.state.data.orgsFlat.forEach(($org)=>{
                    if($org.readonly && $org.parentOrgId!==null){
                        readonlyOrgs=true;
                    }
                });
            }

            let {childOrgs, isParentOrgChecked, firstName, lastName} = this.editFields.current.state;

            let allOrgsUnchecked:boolean=false;

            if(User.selectedOrg.isAccount){
                if(childOrgs.length===0 && !isParentOrgChecked){
                    allOrgsUnchecked=true;
                }
            }else{
                if(childOrgs.length===0){
                    allOrgsUnchecked=true;
                }
            }

            if(this.props.mode===UIDetailFrame.MODE_EDIT && allOrgsUnchecked && !readonlyOrgs){
                ConfirmOverlay.show("confirmDeactivate",()=>{
                    this._saveDetails(true);
                },"Are you sure you want to deactivate "+firstName+" "+lastName+"? This will remove the user's access to all accounts and organizations.","Confirm Deactivate");
            }else{
                this._saveDetails();
            }


        }
    }
    _saveDetails=($deactivate:boolean=false)=>{

        let isValid:boolean = false;
        if(this.editFields.current){ 
            isValid = this.editFields.current.validate();
        }

        if(isValid){


            if(!this._saving){
                this._saving=true;
                const hideLoading = LoadingOverlay.show("peopleSave","Saving User...","Loading Please Wait");
                window.setTimeout(()=>{

                    if(this.editFields.current){


                        let {firstName, lastName, validationError, childOrgs, email, mobilePhone, statusInfo, secRoleId, opsRoleId, isParentOrgChecked, ...rest} = this.editFields.current.state;

                        let strFullName:string = firstName+" "+lastName;

                        //we need to remove the readonly orgs from the childOrgs list...
                        this.state?.data?.orgsFlat.forEach(($org)=>{
                            if($org.readonly && $org.parentOrgId!==null){
                                let index = childOrgs.findIndex(($childOrgId)=>{
                                    return $childOrgId===$org.orgId;
                                });
                                if(index!==-1){
                                    childOrgs.splice(index,1);
                                }
                            }
                        });


                        let orgs = [...childOrgs];

                        if(isParentOrgChecked && User.selectedOrg.isAccount){
                            orgs.unshift(User.selectedOrg.orgId);
                        }
                        
                        let emails:IUserDataEmail[] = [];
                        let phones:IUserDataPhone[] = [];

                        emails.push({
                            email:email,
                            label:"primary",
                            primary:true
                        });

                        if(mobilePhone){
                            phones.push({
                                extension:null,
                                label:"cell",
                                mobileFlag:true,
                                number:Number(mobilePhone),
                                primary:true,
                            });
                        }

                        

                        let userDetails:any = {
                            firstName,
                            lastName,
                            emails:emails,
                            phones:phones,
                            orgId:User.selectedOrg.orgId,
                            organizations:orgs.map(($orgId)=>{
                                return {
                                    orgId:$orgId,
                                    secRoleId:secRoleId,
                                    opsRoleId:opsRoleId,
                                }
                            })                
                        }
                        
                        if($deactivate){
                            userDetails.removeFromAllOrgs=true;
                        }


                        const loadingDone = ($success:boolean)=>{
                            hideLoading();
                            this._saving=false;
                            if($success){

                            }else{
                                
                                AlertOverlay.show("errorSaving","Error Saving");
                            }

                        }

                        if(this.props.mode===UIDetailFrame.MODE_NEW){

                            if((this.state.userAlreadyExists || this.state.userDeactivated) && this.state.data){
                                userDetails.userId = this.state.data.userId;
                                
                                Api.userManager.updateUser(userDetails,($success:boolean, $results:any)=>{
                                    loadingDone($success);
        
                                    if($success){ 

                                        User.setSuccessAddedNewNotification("user",User.selectedOrg.terminologyList.user.singular,strFullName);

                                        this.props.history.push(UsersView.PATH);
                                    }
                                });
                            }else{

                                Api.userManager.inviteUser(userDetails,($success:boolean, $results:any)=>{
                                    
                                    loadingDone($success);
                                    if($success){
                                        User.setSuccessAddedNewNotification("user",User.selectedOrg.terminologyList.user.singular,strFullName);
                                        
                                        this.props.history.push(UsersView.PATH);
                                    }    
                                });
                            }
                        }else{
                            userDetails.userId = this.props.userId!;
                            Api.userManager.updateUser(userDetails,($success:boolean, $results:any)=>{
                                loadingDone($success);

                                if($success){ 
                                    if($deactivate){
                                        User.setSuccessNotification("user","Deactivated","",strFullName);  
                                    }else{
                                        User.setSuccessEditedNotification("user",User.selectedOrg.terminologyList.user.singular,strFullName);    
                                    }
                                    this.props.history.push(UsersView.PATH);
                                }
                            });
                        }
                        
                    }
                },300);

            }
        }
    }

    _onNext=()=>{


        let isValid:boolean = false;
        if(this.editFields.current){ 
            isValid = this.editFields.current.validate();
        }

        if(isValid){

            this.setState({addError:undefined, userAlreadyExists:false},()=>{

                const hideLoader = LoadingOverlay.show("userEmailLoading","Checking Email Address...","Loading Please Wait");
                if(this.editFields.current){
    
                    let {email, ...rest} = this.editFields.current.state;
    
                    Api.userManager.inviteUserPreCheck(email,($success:boolean, $results:any)=>{
                        hideLoader();
    
                        if($success){

                            if($results.data && $results.data.hasOwnProperty("addCode") && $results.data.userId){
                                
                                let objState:any = {step:UsersDetailView.STEP_DETAILS}

                                switch($results.data.addCode){
                                    case 0:
                                        //user already exists... but we can still add.
                                        objState.userAlreadyExists = true;
                                    break;
                                    case 5:
                                        objState.userDeactivated = true;

                                    break;
                                }


                                this.setState(objState,()=>{
                                    this._loadData($results.data.userId,true);
                                });
                            }else{

                                this.setState({step:UsersDetailView.STEP_DETAILS});
                            }

                        }else{
                            this.setState({addError:$results});
                        }
                    });
    
                }
            });


        }

    }

    _onDeleteUser=()=>{        
        if(this.state.data){
            ConfirmOverlay.show("deleteUserConfirm",()=>{
                //we dont have a delete user api method :D
            },"Please confirm you want to delete "+this.state.data.fullName,"Confirm Delete","Delete","Cancel",deleteIcon);
        }
    }

    _onDeactivateUser=()=>{
        if(this.editFields.current){
            this.editFields.current.deactivate(()=>{
                this._trySaveDetails();
            });
        }
    }

    _onClearAddError=()=>{
        this.setState({addError:undefined});
    }
    _onClearEmail=()=>{
        this.setState({step:UsersDetailView.STEP_EMAIL, userAlreadyExists:false});
    }
    _onClearStatusInfo=()=>{
        this.setState({statusInfo:undefined});
    }
    _onOrgClick=($org:Organization)=>{
        if(this.props.myAccount){
            User.setSelectedOrganizationById($org.orgId);
        }
    }
    render() {

        let strDetailName:string = "";

        let canEdit = false;
        if(this.state.data){
            strDetailName = this.state.data.firstName+" "+this.state.data.lastName;

            if(!this.props.myAccount){
                canEdit = this.state.data.canEditForSelectedOrg;
            }
        }

        let jsxContent:JSX.Element = <></>;
        let jsxExtraHeaderOptions:JSX.Element = <></>;

        let showDeactivateBtn:boolean=true;


        let saveDisabled:boolean=false;
        switch(this.state.step){
            case UsersDetailView.STEP_EMAIL:
                saveDisabled=true;

            break;
            case UsersDetailView.STEP_DETAILS:

            break;
        }
        
        switch(this.props.mode){
            case UIDetailFrame.MODE_VIEW:

                if(this.state.data){

                    let createdDate = this.state.data.createdDate;
                    let updateDate = this.state.data.updateDate;

                    jsxContent = (
                        <>
                            {this.state.statusInfo &&  (
                                <UIStatusBanner type={UIStatusBanner.STATUS_INFO} text={this.state.statusInfo} onClose={this._onClearStatusInfo} />
                            )}
                            <UIViewFields>
                                <UIViewFieldsItem title="Email" value={(<a href={"mailto:"+this.state.data.primaryEmail}>{this.state.data.primaryEmail}</a>)}/>
                                <UIViewFieldsItem title="Mobile Phone" extraClassName="mobilePhone" value={
                                    <>
                                        {this.state.data.mobilePhone}
                                        {this.state.data.mobilePhone && !this.props.myAccount &&  (
                                            <UIPhoneButton number={this.state.data.mobilePhone}/>
                                        )}
                                    </>
                                }/>
                                <UIViewFieldsItem title="First Name" value={this.state.data.firstName} />
                                <UIViewFieldsItem title="Last Name" value={this.state.data.lastName} />                            
                                <UIViewFieldsItem title="Permissions" value={this.state.data.firstSecRole} />
                                <UIViewFieldsItem title="Operational Role" value={this.state.data.firstOpsRole} />
                                {createdDate && createdDate!=="" && (
                                    <UIViewFieldsItem title="Created" value={createdDate}/>
                                )}
                                {updateDate && updateDate!=="" && (
                                    <UIViewFieldsItem title="Last Updated" value={updateDate}/>
                                )}                           
                                {this.state.data.organizations && (
                                    <>
                                        <UIViewFieldsItem extraClassName="orgs" fullWidth value={(
                                            <>
                                            {this.state.data.orgHierarchy.map(($org,$orgIndex)=>{

                                                let strCN:string = "fieldItemOrg parent boxShadowLight";
                                                if(this.props.myAccount){
                                                    strCN+=" canClick";
                                                }

                                                return (
                                                    <div className={strCN} key={"org"+$org.orgId+$orgIndex}>
                                                        <div className="fieldItemOrgParent" onClick={()=>{
                                                            this._onOrgClick($org);
                                                        }}>
                                                            {$org.orgName}
                                                            {this.props.myAccount && (
                                                                <UIIcon icon={launchIcon}/>
                                                            )}
                                                        </div>
                                                        {$org.children.map(($childOrg,$childOrgIndex)=>{

                                                            let strChildCN:string = "fieldItemOrg child";
                                                            if(this.props.myAccount){
                                                                strChildCN+=" canClick";
                                                            }
                                                            return (
                                                                <div key={"org"+$org.orgId+"_child"+$childOrg.orgId} className={strChildCN} onClick={()=>{
                                                                    this._onOrgClick($childOrg);
                                                                }}>
                                                                    {$childOrg.orgName}
                                                                    {this.props.myAccount && (
                                                                        <UIIcon icon={launchIcon}/>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )
                                            })}
                                            </>
                                        )} />
                                    </> 
                                )}                           
                            </UIViewFields>
                        </>
                    );
                }
            break;
            case UIDetailFrame.MODE_EDIT:
                if(this.state.data){


                    let deactivateDisabled:boolean = this.state.data.orgsFlat.some(($org)=>{
                        return $org.parentOrgId && $org.readonly
                    });


                    jsxContent = (
                        <>                    
                            <UsersEditFields 
                                userDeactivated={this.state.userDeactivated}
                                userAlreadyExists={this.state.userAlreadyExists}
                                onClearEmail={this._onClearEmail} 
                                onClearAddError={this._onClearAddError} 
                                addError={this.state.addError} 
                                onNext={this._onNext} 
                                step={this.state.step} 
                                mode={this.props.mode}
                                data={this.state.data} 
                                ref={this.editFields}/>
                                <div className="footerOptions">
                                    <UIButton size={UIButton.SIZE_SMALL} disabled={deactivateDisabled} onClick={this._onDeactivateUser} extraClassName={"deactivate"} color={UIButton.COLOR_TRANSPARENT_PURPLE} label="Deactivate" icon={accountOff}/>  
                                </div>
                        </>
                    );
                }
            break;
            case UIDetailFrame.MODE_NEW:
                jsxContent = (
                    <>                    
                        <UsersEditFields 
                            userDeactivated={this.state.userDeactivated}
                            userAlreadyExists={this.state.userAlreadyExists}
                            onClearEmail={this._onClearEmail} 
                            onClearAddError={this._onClearAddError} 
                            addError={this.state.addError} 
                            onNext={this._onNext}  
                            mode={this.props.mode}
                            data={this.state.data} 
                            step={this.state.step} 
                            ref={this.editFields}/>
                    </>
                );
            break;
        }


        let detailPath;

        if(this.props.userId){
            detailPath = "/"+this.props.userId;
        }


        let basePath:string = UsersView.PATH;
        let baseTitle:string = "";
        let baseIcon = UsersView.ICON;

        if(this.props.myAccount){
            detailPath = undefined;
            basePath = MyAccountView.PATH;
            
            if(this.state.data){
                baseTitle = this.state.data?.fullName;
            }
            baseIcon = MyAccountView.ICON;
        }

        return (
            <UIView id={UsersDetailView.ID} usePadding useScrollContainer>
                {this.state.redirectToList && (
                    <Redirect to={UsersView.PATH}/>
                )}
                
                <UIDetailFrame
                    baseIcon={baseIcon}
                    baseTitle={baseTitle}
                    basePath={basePath}
                    loading={this.state.loading}
                    error={this.state.error}
                    mode={this.props.mode}
                    
                    singularLabel={User.selectedOrg.terminologyList.user.singular}
                    detailPath={detailPath}
                    detailName={strDetailName}
                    contentIsWhiteBox
                    canEdit={canEdit}
                    canNew={true}
                    saveDisabled={saveDisabled}
                    onSaveEdit={this._onClickSave}
                    onSaveNew={this._onClickSave}
                >     
                    {jsxContent}
                </UIDetailFrame>
            </UIView>
        );
    }
}