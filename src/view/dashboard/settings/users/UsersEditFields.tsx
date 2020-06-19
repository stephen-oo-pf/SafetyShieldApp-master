import React from 'react';
import UIEditFields from '../../../../ui/UIEditFields';
import UIInput from '../../../../ui/UIInput';
import { UserData } from '../../../../data/UserData';
import User from '../../../../data/User';
import UsersDetailView from './UsersDetailView';
import UIButton from '../../../../ui/UIButton';
import { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import UIInputCheckList from '../../../../ui/UIInputCheckList';
import ValidateUtil from '../../../../util/ValidateUtil';
import { IErrorType } from '../../../../api/Api';
import UIIcon from '../../../../ui/UIIcon';

import closeIcon from '@iconify/icons-mdi/close';





import UIDetailFrame from '../../../../ui/UIDetailFrame';
import FormatUtil from '../../../../util/FormatUtil';
import UICheckbox from '../../../../ui/UICheckbox';
export interface IUsersEditFieldsProps {
    step:string;
    mode:string;
    userAlreadyExists:boolean;
    userDeactivated:boolean;
    onNext:()=>void;
    data?:UserData;
    addError?:IErrorType;
    onClearAddError?:()=>void;
    onClearEmail?:()=>void;
}
export interface IUsersEditFieldsState {
    
    statusInfo:string;
    validationError:string;
    firstName:string;
    lastName:string;
    email:string;
    mobilePhone:string;
    secRoleId:string;
    opsRoleId:string;

    isParentOrgChecked:boolean;
    childOrgs:string[];


    [key:string]:any;
}

export default class UsersEditFields extends React.Component<IUsersEditFieldsProps,IUsersEditFieldsState> {

    _strStatusAlreadyAdded = "User already exists. Save the form to add them to your organization.";
    _strStatusDeactivated = "User has been deactivated. Save the form to add them to your organization.";
    _orgListOptions:{id:string, label:string, readonly?:boolean}[] = [];

    constructor($props:IUsersEditFieldsProps){
        super($props);

        let firstName:string = "";
        let lastName:string = "";
        let email:string = "";
        let secRoleId:string = "";
        let opsRoleId:string = "";
        let mobilePhone:string = "";
                
        if(User.selectedOrg.isAccount){
            //if the selected is an account
            User.selectedOrg.children.forEach(($orgChild)=>{
                this._orgListOptions.push({
                    id:$orgChild.orgId,
                    label:$orgChild.orgName
                });
            });
        }else{
            //if the selected is an org
            this._orgListOptions.push({
                id:User.selectedOrg.orgId,
                label:User.selectedOrg.orgName,
            });
        }


        let statusInfo:string = "";

        let childOrgs:string[] = [];

        if(this.props.data){
            firstName = this.props.data.firstName;
            lastName = this.props.data.lastName;

            email = this.props.data.primaryEmail;   
            mobilePhone = this.props.data.mobilePhone;


            //filter out accounts
            childOrgs = this.props.data.orgsFlat.filter(($org)=>{
                let isOk=true;
                if($org.isAccount){
                    isOk=false;
                }
                return isOk
            }).map(($org)=>{
                return $org.orgId;
            });


            /*
            if this is a new user for the selected org, we need to add the selected org to the childOrgs if its not an account.

            if this condition is met, the user was deactivated and we need to precheck the selected org. 
            For non-accounts that means the options show in the list of orgs with checkboxes, so let's add the selected org to that list, because you can't save a "NEW" user without an org.
            */
            if(this.props.mode===UIDetailFrame.MODE_NEW && !User.selectedOrg.isAccount){
                childOrgs.push(User.selectedOrg.orgId);
            }
            

                  
            secRoleId = this.props.data.firstSecRoleId;
            opsRoleId = this.props.data.firstOpsRoleId;



            //we also try to add the user's readonly orgs to the orgListOptions
            this.props.data.orgsFlat.forEach(($org)=>{
                if($org.parentOrgId!==null){
                    let alreadyExist = this._orgListOptions.find(($orgListItem)=>{
                        return $orgListItem.id===$org.orgId;
                    });
                    if(!alreadyExist){
                        this._orgListOptions.push({
                            id:$org.orgId,
                            label:$org.orgName,
                            readonly:$org.readonly
                        });
                    }
                }
            });

        }


        //now lets sort orgListOptions
        this._orgListOptions.sort(($a,$b)=>{
            if($a.label===$b.label){
                return 0;
            }else if($a.label>$b.label){
                return 1;
            }else{
                return -1;
            }
        });


        if(this.props.userAlreadyExists){
            statusInfo = this._strStatusAlreadyAdded;
        }
        if(this.props.userDeactivated){
            statusInfo = this._strStatusDeactivated;
        }

        this.state = {
            statusInfo:statusInfo,
            validationError:"",
            email:email,
            mobilePhone:mobilePhone,
            firstName:firstName,
            lastName:lastName,
            opsRoleId:opsRoleId,
            secRoleId:secRoleId,
            childOrgs:childOrgs,
            isParentOrgChecked:true,
        }


    }

    componentDidUpdate($prevProps:IUsersEditFieldsProps){
        if(this.props.step!==$prevProps.step){
            //if the step changes... reset the details
            this.setState({mobilePhone:"",firstName:"",lastName:"", opsRoleId:"", secRoleId:"", childOrgs:[]});
        }

    }

    _onInputChange=($value:string, $name?:string)=>{
        let data:{[key:string]:any} = {};
        data[$name!] = $value;
        this.setState(data);
    }
    _onInputNumberChange=($value:string, $name?:string)=>{
        

        if($value==="" || FormatUtil.isNumber($value)){
            
            let data:{[key:string]:any} = {};
            data[$name!] = $value;
            this.setState(data);
        }
    }

    _onParentCheckboxChange=($value:boolean, $name?:string)=>{
        this.setState({isParentOrgChecked:$value});
    }


    _onInputChecklistChange=($checked:string[])=>{
        this.setState({childOrgs:$checked});
    }
    _onErrorClose=()=>{
        this.setState({validationError:""});
        if(this.props.onClearAddError){
            this.props.onClearAddError();
        }
    }

    _onStatusInfoClose=()=>{
        this.setState({statusInfo:""});
    }

    _onEmailClear=()=>{
        this.setState({email:"", statusInfo:"", validationError:""});
        if(this.props.onClearEmail){
            this.props.onClearEmail();
        }
    }

    validateEmail(){

        if(this.state.email===""){
            this.setState({validationError:"You must enter an Email."});
            return false;
        }

        if(!ValidateUtil.email(this.state.email)){
            this.setState({validationError:"You must enter a valid email address."});
            return false;
        }



        this.setState({validationError:""});
        return true;
    }

    validateDetails(){


        if(this.state.firstName===""){
            this.setState({validationError:"You must enter a First Name."});
            return false;
        }
        if(this.state.lastName===""){
            this.setState({validationError:"You must enter a Last Name."});
            return false;
        }
        if(this.state.secRoleId===""){
            this.setState({validationError:"You must select permissions."});
            return false;
        }
        if(this.state.opsRoleId===""){
            this.setState({validationError:"You must select an Operational Role."});
            return false;
        }

        if(this.props.mode===UIDetailFrame.MODE_NEW){

            if(User.selectedOrg.isAccount){
                if(this.state.childOrgs.length===0 && !this.state.isParentOrgChecked){
                    //if its not an account and we're adding, there HAS to be a school selected.
                    this.setState({validationError:"You must select an organization."});
                    return false;
                }

            }else{
                if(this.state.childOrgs.length===0){
                    //if its not an account and we're adding, there HAS to be a school selected.
                    this.setState({validationError:"You must select an organization."});
                    return false;
                }
            }
        }




        this.setState({validationError:""});

        return true;
    }

    validate(){

        switch(this.props.step){
            case UsersDetailView.STEP_EMAIL:
                return this.validateEmail();
            break;
            case UsersDetailView.STEP_DETAILS:
                return this.validateDetails();
            break;
            default:
                return false;//this should be unreachable, but so the compiler wont complain.
        }

    }

    deactivate($complete:()=>void){
        this.setState({isParentOrgChecked:false, childOrgs:[]},$complete);
    }

    render() {


        let jsxContent:JSX.Element = <></>;


        switch(this.props.step){
            case UsersDetailView.STEP_EMAIL:
                jsxContent = (
                    <>
                        <UIInput fieldItem extraClassName="email" isRequired showTitleAsLabel type="textfield" name="email" title="Email" value={this.state.email} onChange={this._onInputChange}/>
                        <UIViewFieldsItem
                            title=" "
                            value={(<UIButton size={UIButton.SIZE_SMALL} label="NEXT" onClick={this.props.onNext} />)}
                        />
                    </>
                );
            break;
            case UsersDetailView.STEP_DETAILS:


                let showParentOrgCheckbox:boolean=false;
                if(User.selectedOrg.parentOrgId===null){
                    showParentOrgCheckbox=true;
                }
                //if we have any accounts, show the parentorgCheckbox
                let hasAccount = false;
                if(this.props.data){
                    hasAccount = this.props.data.orgsFlat.some(($org)=>{
                        return $org.isAccount;
                    });
                }
                if(hasAccount){
                    showParentOrgCheckbox=true;
                }
 
                let detailsDisabled:boolean = false;
                
                if(this.props.userAlreadyExists){
                    detailsDisabled=true;
                }
                jsxContent = (
                    <>
                        <UIInput fieldItem disabled={true} extraClassName="searchemail" isRequired showTitleAsLabel type="textfield" name="email" title="Email" value={this.state.email} onChange={this._onInputChange}>
                            {this.props.mode===UIDetailFrame.MODE_NEW &&  (
                                <UIIcon icon={closeIcon} onClick={this._onEmailClear}/>
                            )}
                        </UIInput>
                        <UIInput fieldItem disabled={detailsDisabled} extraClassName="phone"           showTitleAsLabel type="textfield" name="mobilePhone" title="Mobile Phone Number" value={this.state.mobilePhone} onChange={this._onInputNumberChange}/>
                        <UIInput fieldItem disabled={detailsDisabled} extraClassName="name" isRequired showTitleAsLabel type="textfield" name="firstName"   title="First Name" value={this.state.firstName} onChange={this._onInputChange}/>
                        <UIInput fieldItem disabled={detailsDisabled} extraClassName="name" isRequired showTitleAsLabel type="textfield" name="lastName"    title="Last Name" value={this.state.lastName} onChange={this._onInputChange}/>
                        <UIInput fieldItem disabled={detailsDisabled} options={User.state.secRolesAsUIOptions} extraClassName="secRoleId" isRequired showTitleAsLabel type="select" name="secRoleId" title="Permissions" value={this.state.secRoleId} onChange={this._onInputChange}/>
                        <UIInput fieldItem disabled={detailsDisabled} options={User.state.opsRolesAsUIOptions} extraClassName="opsRoleId" isRequired showTitleAsLabel type="select" name="opsRoleId" title="Operational Role" value={this.state.opsRoleId} onChange={this._onInputChange}/>
                        
                        {this._orgListOptions.length>0 && (
                            <>  
                                {showParentOrgCheckbox && (
                                    <UIViewFieldsItem
                                        fullWidth
                                        title={(<>{User.selectedOrg.terminologyList.parent_org.singular}</>)}
                                        value={(
                                            <UICheckbox disabled={detailsDisabled} name="districtChecked" label={User.selectedOrg.orgName} onChange={this._onParentCheckboxChange} checked={this.state.isParentOrgChecked} />
                                        )}
                                    />
                                )}
                                <UIViewFieldsItem
                                    fullWidth
                                    title={(<>{User.selectedOrg.terminologyList.child_org.plural}<span style={{marginLeft:"8px", fontWeight:400}}>( {this.state.childOrgs.length} selected )</span></>)}
                                    value={(
                                        <UIInputCheckList
                                            allOption
                                            disabled={detailsDisabled}
                                            onChange={this._onInputChecklistChange}
                                            checked={this.state.childOrgs}
                                            options={this._orgListOptions}
                                        />
                                    )}
                                />
                            </>
                        )}
                    </>
                );
            break;
        }

        
        let error:string = "";
        if(this.state.validationError){
            error = this.state.validationError;
        }

        if(this.props.addError){
            error = this.props.addError.desc;
        }

        return (
            <UIEditFields
                onValidationErrorClose={this._onErrorClose}
                validationError={error}
                statusInfo={this.state.statusInfo}
                onStatusInfoClose={this._onStatusInfoClose}
            >
                {jsxContent}

            </UIEditFields>
        );
    }
}
