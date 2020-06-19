import React from 'react';
import UIDropDown, { UIDDItemDataProps, UIDDItemData } from './UIDropDown';
import './UISwitchAccount.scss';
import User from '../data/User';
import { Organization } from '../data/Organization';
import subdirectoryArrowRight from '@iconify/icons-mdi/subdirectory-arrow-right';
import UIIcon from './UIIcon';
import AppData from '../data/AppData';

export interface IUISwitchAccountProps {
    onOpen?:()=>void;
    onClose?:()=>void;
}

interface AccountDDItem extends UIDDItemData{
    logoURL:string;
    name:string;
    childDepth:number;

}

export default class UISwitchAccount extends React.Component<IUISwitchAccountProps> {

    _listening:boolean=false;

    _onItemSelected=($data:UIDDItemData,$name:string)=>{

        User.setSelectedOrganizationById($data.id);
    }

    render() {

        let arrAccounts:AccountDDItem[] = [];

        const addAccountItem = ($org:Organization,$depth:number)=>{

            $depth++;
            arrAccounts.push({id:$org.orgId, name:$org.orgName, logoURL:$org.logoIMGURL, childDepth:$depth});

            $org.children.forEach(($value)=>{
                addAccountItem($value,$depth);
            });
        }

        User.state.userOrgsHierarchy.forEach(($value)=>{
            addAccountItem($value,-1);
        });


        
        let selectedName = User.selectedOrg.orgName;
        let selectedLogoURL = User.selectedOrg.logoIMGURL;


        let selectedLogo:JSX.Element = <></>;


        if(User.selectedOrg.orgId===AppData.masterOrgID){
            selectedLogo = <img className="psapLogo wider" alt={selectedName} src="./static/media/images/intrado-vector-logo.svg"/>;

        }

        if(User.state.isDashboardExpanded){
            selectedLogo = <img className="psapLogo" alt={selectedName} src="./static/media/images/intrado-vector-firefly-square.svg"/>;
        }

        /*
        
                        <img className="psapLogo" alt={selectedName} src={selectedLogoURL}/>
                        */
        return (
            <UIDropDown
                name="switchAccount"
                onItemSelected={this._onItemSelected}
                extraClassName="switchAccount"
                itemRenderer={UISwitchAccountItem}
                data={arrAccounts}
                onClose={this.props.onClose}
                onOpen={this.props.onOpen}
                label={(
                    <>
                        {selectedLogo}
                        <div className="psapName">{selectedName}</div>
                    </>
                )}
            />
        );
    }
}



interface UISwitchAccountItemProps extends UIDDItemDataProps {
    index:number;
}


class UISwitchAccountItem extends React.Component<UISwitchAccountItemProps> {

    _onItemClick=()=>{
        this.props.onItemSelected(this.props.data,this.props.name);
    }
    render() {
        let strCN:string = "switchAccountItem";

        let accData:AccountDDItem = this.props.data as AccountDDItem;


        let dirIcon:JSX.Element = <></>;

        if(accData.childDepth>0){
            dirIcon = <UIIcon icon={subdirectoryArrowRight} />
        }
        strCN+=" childDepth"+accData.childDepth;

        if(this.props.data.id===User.selectedOrg.orgId){
            strCN+=" selected";
        }
        let name:string = this.props.data.name;
        let strNameCN:string = "name";

        if(this.props.data.id===AppData.masterOrgID){
           name = "Back to Admin View"; 
           strNameCN+=" purple";
           //only purple if not selected
           if(this.props.data.id===User.selectedOrg.orgId){
               return null;
           }
        }
        /*
        
                <img alt={this.props.data.name} src={this.props.data.logoURL}/>*
                */

        return (
            <div className={strCN} onClick={this._onItemClick}>
                {dirIcon}
                <div className={strNameCN}>{name}</div>
            </div>
        );
    }
}

