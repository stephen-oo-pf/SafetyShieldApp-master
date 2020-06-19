import * as React from 'react';
import bullhornIcon from '@iconify/icons-mdi/bullhorn';
import { RouteComponentProps } from 'react-router-dom';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import User from '../../../../data/User';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';
import BNViewDetail from './BNViewDetail';
import BNMasterView from './BNViewMaster';
import TitleUtil from '../../../../util/TitleUtil';

export interface IBNViewProps extends RouteComponentProps{
}

export default class BNView extends React.Component<IBNViewProps> {


    static ID:string = "broadcastNotifications";
    static PATH:string = "/event-response/broadcast-notifications";
    static ICON:object = bullhornIcon;

    
    _curDetailID:string = "";

    componentDidMount(){
        
        TitleUtil.setPageTitle("Broadcast Notifications");
    }
    
    _onSetDetailID=($id:string)=>{
        this._curDetailID = $id;
    }
    
    _detail=($props:RouteComponentProps)=>{
        return (
            <BNViewDetail
                incidentBroadcastId={this._curDetailID}
                mode={UIDetailFrame.MODE_VIEW}
                {...$props}
            />
        );
    }

    _edit=($props:RouteComponentProps)=>{
        return (
            <BNViewDetail
                incidentBroadcastId={this._curDetailID}
                mode={UIDetailFrame.MODE_EDIT}
                {...$props}
            />
        );
    }
    _master=($props:RouteComponentProps)=>{
        return(
            <BNMasterView
                {...$props}
            />
        )
    }

    _new=($props:RouteComponentProps)=>{
        return (
            <BNViewDetail
                {...$props}
                mode={UIDetailFrame.MODE_NEW}
            />
        )
    }


    render() {
        return (
            <MasterDetailSwitch
                basePath={BNView.PATH}
                rg={User.selectedOrg.rgBroadcasts}
                detailComp={this._detail}
                editComp={this._edit}
                masterComp={this._master}
                newComp={this._new}
                onSetDetailID={this._onSetDetailID}            
            />
        );
    }
}
