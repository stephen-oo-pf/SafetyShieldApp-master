import React from 'react';

import accountMultiple from '@iconify/icons-mdi/account-multiple';

import { RouteComponentProps } from 'react-router-dom';
import UsersMasterView from './UsersMasterView';

import UsersDetailView from './UsersDetailView';
import TitleUtil from '../../../../util/TitleUtil';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import Api from '../../../../api/Api';
import User from '../../../../data/User';



export interface UsersViewProps {
}



export interface PeopleParams{
    id:string;
}

export default class UsersView extends React.Component<UsersViewProps> {

    static ID:string = "users";
    static PATH:string = "/settings/users";
    static ICON:object = accountMultiple;
    

    _curDetailID:string = "";


    componentDidMount(){
        
        TitleUtil.setPageTitle(User.selectedOrg.terminologyList.user.plural);

        Api.access.validateToken(($success:boolean, $results:any)=>{

        });
    }
    _peopleDirectory=($props:RouteComponentProps)=>{
        return (
            <UsersMasterView 
                {...$props}
            />
        )
    }
    _peopleAddNew=($props:RouteComponentProps)=>{
        return (
            <UsersDetailView
                mode={UIDetailFrame.MODE_NEW}
                {...$props}
            />
        )
    }


    _peopleDetailView=($props:RouteComponentProps)=>{
        return (            
            <UsersDetailView
                userId={this._curDetailID}
                mode={UIDetailFrame.MODE_VIEW}
                {...$props}
            />
        );
    }
    _peopleDetailEdit=($props:RouteComponentProps)=>{
        return (
            <UsersDetailView
                userId={this._curDetailID}
                mode={UIDetailFrame.MODE_EDIT}
                {...$props}
            />
        )
    }

    _onSetDetailID=($id:string)=>{
        this._curDetailID = $id;
    }

    render() {

        return (
            <MasterDetailSwitch
                onSetDetailID={this._onSetDetailID}
                rg={User.selectedOrg.rgUsers}
                basePath={UsersView.PATH}
                masterComp={this._peopleDirectory}
                newComp={this._peopleAddNew}                
                detailComp={this._peopleDetailView} 
                editComp={this._peopleDetailEdit}
            />
        );
    }
}
