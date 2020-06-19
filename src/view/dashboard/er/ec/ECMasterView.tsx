import * as React from 'react';
import UIPopupMenu from '../../../../ui/UIPopupMenu';
import { UITabBarItem } from '../../../../ui/UITabBar';
import { IECDataUser, convertIECDataUserToSimple, IECData } from '../../../../data/ECData';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';

import pencilIcon from '@iconify/icons-mdi/pencil';
import deleteIcon from '@iconify/icons-mdi/delete';
import UIWhiteBox from '../../../../ui/UIWhiteBox';
import { UIPhoneButton } from '../../../../ui/UIButton';
import FormatUtil from '../../../../util/FormatUtil';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import ECView from './ECView';
import Api, { IErrorType } from '../../../../api/Api';
import LoadingOverlay from '../../../../overlay/LoadingOverlay';
import AlertOverlay from '../../../../overlay/AlertOverlay';
import User, { IResultNotification } from '../../../../data/User';
import ConfirmOverlay from '../../../../overlay/ConfirmOverlay';
import UIView from '../../../../ui/UIView';
import UIMasterFrame from '../../../../ui/UIMasterFrame';
import { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import UIToggle from '../../../../ui/UIToggle';
import UILoadingBox from '../../../../ui/UILoadingBox';
import UIErrorBox from '../../../../ui/UIErrorBox';
import UINoData from '../../../../ui/UINoData';


export interface IECMasterViewProps extends RouteComponentProps{
}

export interface IECMasterViewState {
    error?:IErrorType;
    loading:boolean;
    resultNotification?:IResultNotification;
}

export default class ECMasterView extends React.Component<IECMasterViewProps, IECMasterViewState> {
    constructor(props: IECMasterViewProps) {
        super(props);

       
        this.state = {
            loading:true
        }
    }

    
    componentDidMount(){
        this._loadData();
    }
    _loadData=()=>{
        this.setState({loading:true, error:undefined},()=>{
            Api.settingsManager.getOrgEmergencyContacts(($success:boolean, $results:any)=>{


                User.checkResultNotification("emergencycontact",($notif)=>{
                    this.setState({resultNotification:$notif});
                });

                if($success){
                    this.setState({loading:false});
                }else{
                    this.setState({loading:false, error:$results});
                }
            });
        });
    }

    _onTogglePublic=($value:boolean)=>{

        const hideLoading = LoadingOverlay.show("togglePublic","Make Available to Public Safety...","Saving...");
        window.setTimeout(()=>{
            Api.settingsManager.setOrgEmergencyContacts({publishToADR:$value},($success:boolean, $results:any)=>{
                hideLoading();
                if($success){
                    this._loadData();
                }else{
                    AlertOverlay.show("errorTogglePublic","Error Saving");
                }
            });
        },300);
    }

    _onItemRemove=($data:IECDataUser)=>{

        if(User.selectedOrg.ecData){


            let removeUser = User.selectedOrg.ecData.users.find(($value)=>{
                return $value.userId===$data.userId;
            });


            if(removeUser){
                

                ConfirmOverlay.show("confirmRemoveEC",()=>{
                    

                    const hideLoading = LoadingOverlay.show("removeEC","Removing Emergency Contact...","Loading Please Wait");
                    window.setTimeout(()=>{

                        if(User.selectedOrg.ecData){


                            let removeIndex = User.selectedOrg.ecData.users.findIndex(($value)=>{
                                return $value.userId===$data.userId;
                            })
                            

                            let users = convertIECDataUserToSimple(User.selectedOrg.ecData.users)

                            users.splice(removeIndex,1);


                            Api.settingsManager.setOrgEmergencyContacts({users:users},($success:boolean, $results:any)=>{
                                hideLoading();
                                if($success){
                                    this._loadData();
                                }else{
                                    AlertOverlay.show("errorTogglePublic","Error Saving");
                                }
                            });
                        }


                    },300);
                
                },"Are you sure you want to remove "+removeUser.firstName+" "+removeUser.lastName+" as an Emergency Contact?", "Confirm Remove","Remove","Cancel",deleteIcon);

            }
        }
    }

    _onClearResultNotification=()=>{
        this.setState({resultNotification:undefined});
    }
    
    render() {
       

        let isPublic:boolean=false;
        let ecData:IECData;
        let ecUsers:IECDataUser[] = [];
        if(User.selectedOrg.ecData){
            ecData = User.selectedOrg.ecData;
            isPublic = ecData.publishToADR;
            ecUsers = ecData.users;
        }

        let isOk:boolean = (!this.state.error && !this.state.loading);

        return (
            <UIView id={ECView.ID} usePadding useScrollContainer>
                <UIMasterFrame
                    baseIcon={ECView.ICON}
                    basePath={ECView.PATH}                    
                    baseTitle="Emergency Contacts"
                    addBtn={{path:ECView.PATH+MasterDetailSwitch.PATH_NEW, label:"Add New Contact"}}
                    additionalOptions={(
                        <>
                            {isOk && (
                            <UIViewFieldsItem
                                    title="Make Available to Public Safety?"
                                    value={(
                                        <>
                                            <UIToggle enabled={isPublic} onClick={this._onTogglePublic}/>
                                        </>
                                    )}
                                />
                            )}
                        </>
                    )}
                    resultNotification={this.state.resultNotification}
                    onClearResultNotification={this._onClearResultNotification}
                >
                    {isOk && (                            
                        <div className="ecContent">
                            {ecUsers.map(($value)=>{
                                return (
                                    <ECViewItem onRemove={this._onItemRemove} key={"ecitem"+$value.userId} data={$value}/>
                                )
                            })}
                        </div>
                    )}
                        
                    {this.state.loading && (
                        <UILoadingBox/>
                    )}
                    {this.state.error && (
                        <UIErrorBox error={this.state.error.desc}/>
                    )}
                    {isOk && ecUsers.length===0 && (
                        <UINoData customMsg="No Emergency Contacts Added"/>
                    )}
                    


                </UIMasterFrame>

            </UIView>
        );
    }
    
}




interface ECCoreItemProps{
    data:IECDataUser;
    useWhiteBox?:boolean;
    showLink?:boolean;

}

export class ECCoreItem extends React.Component<ECCoreItemProps>{

    render(){

        let content:JSX.Element = (
            <>
                <div className="name">
                    {this.props.showLink && (
                        <NavLink to={ECView.PATH+"/"+this.props.data.userId}>{this.props.data.firstName+" "+this.props.data.lastName}</NavLink>                    
                    )}
                    {!this.props.showLink && (
                        <>
                            {this.props.data.firstName+" "+this.props.data.lastName}
                        </>
                    )}
                </div>
                <div className="opsRole">
                    {this.props.data.opsRole}    
                </div>          
                <div className="emPhone">
                    <UIPhoneButton number={this.props.data.emergencyPhone}/>
                    {FormatUtil.phoneNumber(this.props.data.emergencyPhone)}
                </div>
                {this.props.children}
            </>
        );

        let wrapper:JSX.Element;

        if(this.props.useWhiteBox){
            wrapper = (
                <UIWhiteBox extraClassName="ecItem">
                    {content}
                </UIWhiteBox>
            );
        }else{
            wrapper = (
                <div className="ecItem">
                    {content}
                </div>
            )
        }

        return wrapper;
    }
}


interface ECViewItemProps {
    data:IECDataUser;
    onRemove:($data:IECDataUser)=>void;
}

export class ECViewItem extends React.Component<ECViewItemProps> {
    _menuOptions:UITabBarItem[];

    constructor($props:ECViewItemProps){
        super($props);


        let editURL:string = ECView.PATH+"/"+this.props.data.userId+MasterDetailSwitch.PATH_EDIT;

        let edit:UITabBarItem = {
            id:"edit",
            label:"Edit",
            url:editURL,
            icon:pencilIcon
        }
        let remove:UITabBarItem = {
            id:"remove",
            label:"Remove",            
            icon:deleteIcon
        }

        this._menuOptions = [
            edit,
            remove
        ];

    }
    _onMenuItemClicked=($id:string)=>{
        switch($id){
            case "remove":
                this.props.onRemove(this.props.data);
            break;
        }
    }
    render() {
        return (    
            <ECCoreItem showLink useWhiteBox data={this.props.data}>
                <UIPopupMenu onItemClicked={this._onMenuItemClicked} options={this._menuOptions}/>
            </ECCoreItem>
        );
    }
}

