import React from 'react';
import UIEditFields from '../../../../ui/UIEditFields';
import { IECDataUser } from '../../../../data/ECData';
import UIInput from '../../../../ui/UIInput';
import UIInputAutoSearch from '../../../../ui/UIInputAutoSearch';
import { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import User from '../../../../data/User';
import IUserData, { UserData } from '../../../../data/UserData';
import FormatUtil from '../../../../util/FormatUtil';

export interface IECEditFieldsProps {
    data?:IECDataUser;
}
export interface IECEditFieldsState {
    validationError:string;
    userId:string;
    emergencyPhone:string;

}

export default class ECEditFields extends React.Component<IECEditFieldsProps,IECEditFieldsState> {

    constructor($props:IECEditFieldsProps){
        super($props);


        let userId:string = "";
        let emergencyPhone:string = "";
        if(this.props.data){
            userId = this.props.data.userId;
            emergencyPhone = this.props.data.emergencyPhone;
        }

        this.state = {
            validationError:"",
            userId:userId,
            emergencyPhone:emergencyPhone
        }
    }

    validate(){
        if(this.state.userId===""){
            
            this.setState({validationError:"You must enter a User."});
            return false;
        }
        if(this.state.emergencyPhone===""){
            this.setState({validationError:"You must enter an Emergency Contact Phone Number."});
            return false;
        }

        return true;
    }

    _onValidationErrorClose=()=>{
        this.setState({validationError:""});
    }
    
    _onEmPhoneChange=($value:string, $name?:string)=>{
        
        if($value==="" || FormatUtil.isNumber($value)){
            this.setState({emergencyPhone:$value});

        }
    }
    _onAutoSearchSelected=($id:string)=>{

        let selectedUser = User.state.allPeopleData.find(($value)=>{
            return $value.userId===$id;
        });

        let strEmergencyPhone:string = "";
        if(selectedUser){
            if(selectedUser.phones && selectedUser.phones.length>0){
                let primaryPhone = selectedUser.phones.find(($value)=>{
                    return $value.primary;
                });
                if(primaryPhone){
                    strEmergencyPhone = ""+primaryPhone.number;
                }else{
                    strEmergencyPhone = ""+selectedUser.phones[0].number;
                }
            }
        }


        let stateDetails:any = {
            userId:$id,
            emergencyPhone:strEmergencyPhone
        }

        this.setState(stateDetails);


    }

    render() {


        let selectedUser = User.state.allPeopleData.find(($value)=>{
            return $value.userId===this.state.userId;
        });

        let strPhoneNumber:string = "";
        let strPermissions:string = "";
        let strOpsRole:string = "";

        if(selectedUser){
           
            let selectedUserOrg = selectedUser.organizations?.find(($org)=>{
                return $org.orgId===User.selectedOrg.orgId;
            })
            if(selectedUserOrg?.secRole){
                strPermissions = selectedUserOrg.secRole;
            }
            if(selectedUserOrg?.opsRole){
                strOpsRole = selectedUserOrg.opsRole;
            }

            if(selectedUser.phones && selectedUser.phones.length>0){

                //look for primary phone
                let primaryPhone = selectedUser.phones.find(($value)=>{
                    return $value.primary;
                });

                if(primaryPhone){
                    strPhoneNumber = FormatUtil.phoneNumber(""+primaryPhone.number);
                }else{
                    strPhoneNumber = FormatUtil.phoneNumber(""+selectedUser.phones[0].number);
                }
            } 
        }

        //get only people data that have at least 1 org that matches the selected org
        let peopleData:UserData[] = User.state.allPeopleData.filter(($person)=>{
            let isOk:boolean=false;
            if($person.organizations){
                isOk = $person.organizations.some(($org)=>{
                    return $org.orgId===User.selectedOrg.orgId;
                });
            }
            return isOk;
        });


        return (
            <UIEditFields validationError={this.state.validationError} onValidationErrorClose={this._onValidationErrorClose}>                
                <UIViewFieldsItem
                    title={(
                        <>
                            User <span className="required">*</span>
                        </>
                    )}
                    value={(
                        <>
                            <UIInputAutoSearch placeholder="Enter a name to search" onItemSelected={this._onAutoSearchSelected} selectedID={this.state.userId} tabIndex={101} data={peopleData.map(($value)=>{
                                return {
                                    id:$value.userId,
                                    label:$value.lastCommaFirst
                                }
                            })}/>
                        </>
                    )}
                />
                {selectedUser && (
                    <>
                        <UIInput fieldItem tabIndex={102} extraClassName="emergencyPhone" isRequired showTitleAsLabel type="textfield" name="emergencyPhone" title="Emergency Contact Phone Number" value={this.state.emergencyPhone} onChange={this._onEmPhoneChange}/>
                        <div className="divider"/>
                        <UIViewFieldsItem title="Email" value={selectedUser.primaryEmail}/>
                        <UIViewFieldsItem title="Phone Number" value={strPhoneNumber}/>
                        <UIViewFieldsItem title="First Name" value={selectedUser.firstName}/>
                        <UIViewFieldsItem title="Last Name" value={selectedUser.lastName}/>
                        <UIViewFieldsItem title="Permissions" value={strPermissions}/>
                        <UIViewFieldsItem title="Operational Role" value={strOpsRole}/>
                    </>
                )}
            </UIEditFields>
        );
    }
}
