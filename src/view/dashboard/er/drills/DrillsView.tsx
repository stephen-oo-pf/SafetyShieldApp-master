import * as React from 'react';

import baselineAccessTime from '@iconify/icons-ic/baseline-access-time';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';
import TitleUtil from '../../../../util/TitleUtil';
import User from '../../../../data/User';
import { RouteComponentProps } from 'react-router-dom';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import DrillsMasterView from './DrillsMasterView';
import DrillsDetailView from './DrillsDetailView';


export interface IDrillsViewProps {
}

export interface IDrillsViewState {
}


export default class DrillsView extends React.Component<IDrillsViewProps, IDrillsViewState> {

    static ID:string = "drills";
    static PATH:string =  "/event-response/drills";
    static ICON:object = baselineAccessTime;

    constructor(props: IDrillsViewProps) {
        super(props);

        this.state = {

        }
    }
    
    componentDidMount(){
        
        TitleUtil.setPageTitle("Drills");
    }

    _curDetailID:string = "";
    
    _onSetDetailID=($id:string)=>{
        this._curDetailID = $id;
    }

    
    _master=($props:RouteComponentProps)=>{
        return(
            <DrillsMasterView
                {...$props}
            />
        )
    }


    _detail=($props:RouteComponentProps)=>{
        return (
            <DrillsDetailView
                drillId={this._curDetailID}
                mode={UIDetailFrame.MODE_VIEW}
                {...$props}
            />
        );
    }

    _edit=($props:RouteComponentProps)=>{
        return (
            <DrillsDetailView
                drillId={this._curDetailID}
                mode={UIDetailFrame.MODE_EDIT}
                {...$props}
            />
        );
    }

    _new=($props:RouteComponentProps)=>{
        return (
            <DrillsDetailView
                {...$props}
                mode={UIDetailFrame.MODE_NEW}
            />
        )
    }


    render() {
        return (
            <MasterDetailSwitch
                basePath={DrillsView.PATH}
                rg={User.selectedOrg.rgDrills}
                detailComp={this._detail}
                editComp={this._edit}
                masterComp={this._master}
                newComp={this._new}
                onSetDetailID={this._onSetDetailID}            
            />            
        );
    }
}
