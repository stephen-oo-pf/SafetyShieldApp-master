import React from 'react';

import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';
import './ECView.scss';

import baselineContactPhone from '@iconify/icons-ic/baseline-contact-phone';
import User from '../../../../data/User';
import { RouteComponentProps } from 'react-router-dom';
import ECViewDetail from './ECViewDetail';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import ECMasterView from './ECMasterView';
import TitleUtil from '../../../../util/TitleUtil';


export interface IECViewProps extends RouteComponentProps{

}

export default class ECView extends React.Component<IECViewProps> {

    static ID:string = "emergencyContacts";
    static PATH:string =  "/event-response/emergency-contacts";
    static ICON:object = baselineContactPhone;

    
    
    componentDidMount(){
        
        TitleUtil.setPageTitle("Emergency Contacts");
    }


    _curDetailID:string = "";
    
    _onSetDetailID=($id:string)=>{
        this._curDetailID = $id;
    }
    _master=($props:RouteComponentProps)=>{
        return(
            <ECMasterView
                {...$props}
            />
        )
    }


    _detail=($props:RouteComponentProps)=>{
        return (
            <ECViewDetail
                userId={this._curDetailID}
                mode={UIDetailFrame.MODE_VIEW}
                {...$props}
            />
        );
    }

    _edit=($props:RouteComponentProps)=>{
        return (
            <ECViewDetail
                userId={this._curDetailID}
                mode={UIDetailFrame.MODE_EDIT}
                {...$props}
            />
        );
    }

    _new=($props:RouteComponentProps)=>{
        return (
            <ECViewDetail
                {...$props}
                mode={UIDetailFrame.MODE_NEW}
            />
        )
    }

    render() {
        return (
            <MasterDetailSwitch
                basePath={ECView.PATH}
                rg={User.selectedOrg.rgEC}
                detailComp={this._detail}
                editComp={this._edit}
                masterComp={this._master}
                newComp={this._new}
                onSetDetailID={this._onSetDetailID}            
            />
        )
    }
}
