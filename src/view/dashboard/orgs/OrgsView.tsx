import React from 'react';


import {RouteComponentProps } from 'react-router-dom';
import OrgsMasterView from './OrgsMasterView';

import OrgsDetailView from './OrgsDetailView';

import baselineAccountTree from '@iconify/icons-ic/baseline-account-tree';

import User from '../../../data/User';
import TitleUtil from '../../../util/TitleUtil';
import MasterDetailSwitch from '../../../util/MasterDetailSwitch';
import UIDetailFrame from '../../../ui/UIDetailFrame';
import AppData from '../../../data/AppData';


export interface IOrgsViewProps {
}

export interface OrgsParams{
    id:string;
}


export default class OrgsView extends React.Component<IOrgsViewProps> {
    static ID:string = "orgs";
    static PATH:string = "/accounts";
    
    static ICON:object =  baselineAccountTree;
    

    _curOrgID:string = "";
    componentDidMount(){
        
        TitleUtil.setPageTitle(User.selectedOrg.terminologyList.parent_org.plural);
        
    }



    _getOrgsDetailView=($props:RouteComponentProps)=>{
        return (
            <OrgsDetailView
                mode={UIDetailFrame.MODE_VIEW}
                orgId={this._curOrgID}
                {...$props}
            />
        )
    }
    _getOrgsDetailEdit=($props:RouteComponentProps)=>{
        return (
            <OrgsDetailView
                mode={UIDetailFrame.MODE_EDIT}
                orgId={this._curOrgID}
                {...$props}
            />
        )
    }
    _getOrgsDetailNew=($props:RouteComponentProps)=>{
        return (
            <OrgsDetailView
                mode={UIDetailFrame.MODE_NEW}
                orgId={this._curOrgID}
                {...$props}
            />
        )
    }
    _getOrgsNew=($props:RouteComponentProps)=>{
        return (
            <OrgsDetailView
                mode={UIDetailFrame.MODE_NEW}
                {...$props}
            />
        )
    }

    _onSetDetailID=($id:string)=>{
        this._curOrgID = $id;
    }


    _getOrgsList=($props:RouteComponentProps)=>{
        return (
            <OrgsMasterView
                {...$props}
            />
        );
    }
    render() {

        let rg = User.selectedOrg.rgOrgs;

        let alteredRG = {...rg};
        if(alteredRG.canView){         
            //only allowed if rootAdmin and MasterORG
            if(User.selectedOrg.isRootAdmin && User.selectedOrg.orgId===AppData.masterOrgID){
                
            }else{
                alteredRG.canView=false;
                alteredRG.canAdd=false;
                alteredRG.canEdit=false;
                alteredRG.canDelete=false;
            }
        }

        return (
            <MasterDetailSwitch
                onSetDetailID={this._onSetDetailID}
                rg={alteredRG}
                basePath={OrgsView.PATH}
                masterComp={this._getOrgsList}
                newComp={this._getOrgsNew}
                editComp={this._getOrgsDetailEdit}
                detailComp={this._getOrgsDetailView} 
                detailAddComp={this._getOrgsDetailNew}
            />
        );
    }
}
