import React from 'react';
import { Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';
import DashboardView from '../view/dashboard/DashboardView';
import { IRightGroup } from '../data/UserRights';
import { createDrillDetailPath } from '../data/DrillData';

export interface IMasterDetailSwitchProps {
    basePath:string;
    
    rg:IRightGroup;
    masterComp:any;
    newComp:any;
    detailComp:any;
    editComp:any;
    onSetDetailID:($detailID:string)=>void;
    detailAddComp?:any;
}


export interface DetailParams{
    id:string;
}

export default class MasterDetailSwitch extends React.Component<IMasterDetailSwitchProps> {

    static PATH_EDIT:string = "/edit";
    static PATH_NEW:string = "/new";

    _curDetailId:string = "";

    _getDetail=($props:RouteComponentProps<DetailParams>)=>{

        this._curDetailId = $props.match.params.id;

        this.props.onSetDetailID(this._curDetailId);


        let detailPath:string = this.props.basePath+"/"+this._curDetailId;
        return (
            <Switch>
                <Route exact path={detailPath} component={this.props.detailComp}/>
                {this.props.rg.canEdit && (
                    <Route exact path={detailPath+MasterDetailSwitch.PATH_EDIT} component={this.props.editComp}/>
                )}
                {this.props.rg.canAdd && this.props.detailAddComp && (
                    <Route exact path={detailPath+MasterDetailSwitch.PATH_NEW} component={this.props.detailAddComp}/>
                )}
            </Switch>
        )
    }

    render() {


        if(!this.props.rg.canView){
            return <Redirect to={DashboardView.PATH}/>
        }

        return (
            <Switch>
                <Route exact path={this.props.basePath} component={this.props.masterComp}/>
                {this.props.rg.canAdd && (
                    <Route exact path={this.props.basePath+MasterDetailSwitch.PATH_NEW} component={this.props.newComp}/>
                )}    
                <Route path={this.props.basePath+"/:id"} component={this._getDetail}/>
            </Switch>
        )
    }
}
