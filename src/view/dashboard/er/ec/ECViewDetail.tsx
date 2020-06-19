import React from 'react';
import UIViewFields, { UIViewFieldsItem } from '../../../../ui/UIViewFields';

import Api, { IErrorType } from '../../../../api/Api';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import UIView from '../../../../ui/UIView';
import ECView from './ECView';
import User from '../../../../data/User';
import { IECDataUser, IECData, convertIECDataUserToSimple } from '../../../../data/ECData';
import { UIDeleteButton } from '../../../../ui/UIButton';

import ECEditFields from './ECEditFields';
import LoadingOverlay from '../../../../overlay/LoadingOverlay';
import { RouteComponentProps } from 'react-router-dom';
import AlertOverlay from '../../../../overlay/AlertOverlay';
import ConfirmOverlay from '../../../../overlay/ConfirmOverlay';

import deleteIcon from '@iconify/icons-mdi/delete';
import FormatUtil from '../../../../util/FormatUtil';
import { UserData } from '../../../../data/UserData';

export interface IECViewDetailProps extends RouteComponentProps{
    mode:string;
    userId?:string;
}

export interface IECViewDetailState {
    loading:boolean;
    error?:IErrorType;
}

export default class ECViewDetail extends React.Component<IECViewDetailProps, IECViewDetailState> {
    static ID:string = "ecDetail";



    editFields:React.RefObject<ECEditFields> =  React.createRef();

    _saving:boolean=false;

    _unmounting:boolean=false;

    constructor(props: IECViewDetailProps) {
        super(props);


        this.state = {
            loading:true,
        }
    }
    componentDidMount(){        
        this._loadData();
    }
    componentWillUnmount(){
        this._unmounting=true;
    }
    componentDidUpdate($prevProps:IECViewDetailProps){
        if(this.props.userId && this.props.userId!==$prevProps.userId){
            this._loadData();
        }
    }
    _loadData=()=>{
        this.setState({
            loading:true,
            error:undefined
        },()=>{

            let countDone = 0;

            const tryLoadingDone = ()=>{
                if(countDone===2){
                    if(!this._unmounting){
                        this.setState({loading:false});
                    }
                }
            }
            Api.userManager.getUsers(($success:boolean, $results:any)=>{
                if($success){

                }else{
                    if(!this._unmounting){
                        this.setState({error:$results});
                    }
                }
                countDone++;
                tryLoadingDone();
            });


            Api.settingsManager.getOrgEmergencyContacts(($success:boolean, $results:any)=>{
                if($success){
                }else{
                    if(!this._unmounting){
                        this.setState({error:$results});
                    }
                }
                countDone++;
                tryLoadingDone();
            });

        });
    }


    _save=()=>{

        let isValid:boolean = false;
        if(this.editFields.current){
            isValid = this.editFields.current.validate();

            //we let a force update to happen so the above "validate" has time to finish setting its state.
            this.forceUpdate(()=>{


                if(isValid && !this._saving && this.editFields.current && User.selectedOrg.ecData){
                    this._saving=true;

                    
                    let {validationError, ...newItem} = this.editFields.current.state;

                    const hideLoading = LoadingOverlay.show("saveEC","Saving Emergency Contact...","Loading Please Wait");

                    let savingUsers:{userId:string, emergencyPhone:string}[] = convertIECDataUserToSimple(User.selectedOrg.ecData.users);
                    

                    let name:string = "";
                    let matchingUser:UserData | undefined;

                    switch(this.props.mode){
                        case UIDetailFrame.MODE_NEW:
                            //add to the end
                            savingUsers.push(newItem);

                            matchingUser = User.state.allPeopleData.find(($user:UserData)=>{
                                return $user.userId===newItem.userId;
                            });

                            if(matchingUser){
                                name = matchingUser.fullName;
                            }


                        break;
                        case UIDetailFrame.MODE_EDIT:
                            //replace its spot
                            let curIndex = User.selectedOrg.ecData.users.findIndex(($value)=>{
                                let match:boolean=false;
                                if($value.userId===this.props.userId){
                                    match=true;
                                    name = $value.firstName+" "+$value.lastName;
                                }
                                return match;
                            });
                            if(curIndex!==-1){
                                savingUsers.splice(curIndex,1,newItem);
                            }
                        break;
                    }
                    
                    
                    Api.settingsManager.setOrgEmergencyContacts({users:savingUsers},($success:boolean, $results:any)=>{
                        hideLoading();
                        if($success){
                            

                            switch(this.props.mode){
                                case UIDetailFrame.MODE_NEW:
                                    User.setSuccessAddedNewNotification("emergencycontact","Emergency Contact",name);

                                break;
                                case UIDetailFrame.MODE_EDIT:
                                    User.setSuccessEditedNotification("emergencycontact","Emergency Contact",name);

                                    
                                break;
                            }

                            if(!this._unmounting){
                                this.props.history.push(ECView.PATH);

                            }
                        }else{
                            AlertOverlay.show("errorSavingEC","Error Saving");
                        }
                    });
                    
                    

                }

            });
        }

    }

    _onSaveNew=()=>{
        this._save();
    }
    _onSaveEdit=()=>{
        this._save();
    }



    _onClickDelete=()=>{

        let ecData:IECData | undefined;
        let ecDataUser:IECDataUser | undefined;

        let removingIndex:number = -1;
        if(User.selectedOrg.ecData){
            ecData = User.selectedOrg.ecData;

            if(ecData.users){
    
                ecDataUser = ecData.users.find(($value, $index)=>{

                    let isOk = false;
                    if($value.userId===this.props.userId){
                        isOk=true;
                        removingIndex = $index;
                    }

                    return isOk;
                });
            }
        }

        if(ecDataUser && ecData && removingIndex!==-1){

            ConfirmOverlay.show("confirmRemoveEC",()=>{
    
                if(ecData){
                    const hideLoading = LoadingOverlay.show("removeEC","Removing Emergency Contact...","Loading Please Wait");

                    let leftoverUsers = [...ecData.users];

                    leftoverUsers.splice(removingIndex,1);

                    Api.settingsManager.setOrgEmergencyContacts({users:leftoverUsers},($success:boolean, $results:any)=>{
                        hideLoading();
                        if($success){
                            if(!this._unmounting){
                                this.props.history.push(ECView.PATH);
                            }
                        }else{
                            AlertOverlay.show("errorRemovingEC","Error Removing");
                        }
                    });
                }

    
            },"Are you sure you want to remove "+ecDataUser.firstName+" "+ecDataUser.lastName+" as an Emergency Contact?", "Confirm Remove","Remove","Cancel",deleteIcon);
        }



    }

    render() {

        let canEdit:boolean=true;
        let canNew:boolean=true;
        let canDelete:boolean=true;
        
        let detailPath;        
        let detailName;
        let cancelPath;
        


        let ecDataUser:IECDataUser | undefined;
        
        if(!this.state.loading && !this.state.error && User.selectedOrg?.ecData?.users){



            ecDataUser = User.selectedOrg.ecData.users.find(($value)=>{
                return $value.userId===this.props.userId
            });

            if(ecDataUser){
                detailPath = "/"+this.props.userId;

                detailName = ecDataUser.firstName+" "+ecDataUser.lastName;
            }

        }



        let jsxContent:JSX.Element = <></>;
        switch(this.props.mode){
            case UIDetailFrame.MODE_NEW:
                //new mode only uses detailName/detailPath NOT parentDetailPath or parentDetailname, so apply what we originally set to parent to detail
                detailPath=undefined;
                jsxContent = (
                    <>
                        <ECEditFields ref={this.editFields}/> 
                    </>
                );
            break;
            case UIDetailFrame.MODE_VIEW:

                if(ecDataUser){

                    let strPhone:string = "";
                    if(ecDataUser.phone){
                        strPhone = FormatUtil.phoneNumber(ecDataUser.phone);
                    }
                    jsxContent = (
                        <UIViewFields>
                            <UIViewFieldsItem title={"Name"} value={(detailName as string)}/>
                            <UIViewFieldsItem title={"Emergency Contact Phone Number"} value={FormatUtil.phoneNumber(ecDataUser.emergencyPhone)}/>
                            <div className="divider"/>
                            <UIViewFieldsItem title="Email" value={ecDataUser.email}/>
                            <UIViewFieldsItem title="Phone Number" value={strPhone}/>
                            <UIViewFieldsItem title="First Name" value={ecDataUser.firstName}/>
                            <UIViewFieldsItem title="Last Name" value={ecDataUser.lastName}/>
                            <UIViewFieldsItem title="Permissions" value={ecDataUser.secRole}/>
                            <UIViewFieldsItem title="Operational Role" value={ecDataUser.opsRole}/>
                        </UIViewFields>                    
                    );
                }

            break;
            case UIDetailFrame.MODE_EDIT:
                if(ecDataUser){
                    cancelPath = ECView.PATH;

                    jsxContent = (
                        <>
                            <ECEditFields ref={this.editFields} data={ecDataUser}/>
                            <div className="footerOptions">
                                {canDelete && (
                                    <UIDeleteButton onClick={this._onClickDelete} />
                                )}
                            </div>
                        </>                    
                    );
                }
            break;
        }
        
        return (         
            <UIView id={ECViewDetail.ID} usePadding useScrollContainer>
                <UIDetailFrame
                    baseIcon={ECView.ICON}
                    basePath={ECView.PATH}
                    baseTitle="Emergency Contacts"
                    canEdit={canEdit}
                    canNew={canNew}
                    cancelPath={cancelPath}
                    loading={this.state.loading}
                    mode={this.props.mode}
                    detailPath={detailPath}
                    detailName={detailName}
                    singularLabel={"Emergency Contact"}
                    contentIsWhiteBox  
                    onSaveNew={this._onSaveNew}
                    onSaveEdit={this._onSaveEdit}              
                >
                    {jsxContent}
                </UIDetailFrame>
            </UIView>   
        );
    }
}
