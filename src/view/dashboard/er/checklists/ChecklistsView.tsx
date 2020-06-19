import React from 'react';
import MasterDetailSwitch, { DetailParams } from '../../../../util/MasterDetailSwitch';

import clipboardCheck from '@iconify/icons-mdi/clipboard-check';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import ChecklistsMasterView from './ChecklistsMasterView';
import User from '../../../../data/User';
import ChecklistsDetailView from './ChecklistsDetailView';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import TitleUtil from '../../../../util/TitleUtil';
import DashboardView from '../../DashboardView';


export interface IChecklistsViewProps {
}

export interface IChecklistsViewState {
}

export default class ChecklistsView extends React.Component<IChecklistsViewProps, IChecklistsViewState> {
    static ID:string = "checklists";
    static PATH:string = "/event-response/checklists";
    static PATH_USER:string = "/event-response/mychecklists";


    _isDetailUserChecklist:boolean=false;
    _curDetailId:string = "";

    static ICON:object = clipboardCheck;


    constructor(props: IChecklistsViewProps) {
        super(props);

        this.state = {
        }
    }
    componentDidMount(){
        
        TitleUtil.setPageTitle("Checklists");
    }

    _getMaster=($props:RouteComponentProps)=>{
        return (
            <ChecklistsMasterView
                {...$props}
            />
        );
    }
    
    _getNew=($props:RouteComponentProps)=>{
        return (
            <ChecklistsDetailView
                mode={UIDetailFrame.MODE_NEW}
                isDetailUserChecklist={this._isDetailUserChecklist}
                {...$props}
            />
        )
    }
    _getDetailsEdit=($props:RouteComponentProps)=>{
        
        return (
            <ChecklistsDetailView
                mode={UIDetailFrame.MODE_EDIT}
                checklistId={this._curDetailId}
                isDetailUserChecklist={this._isDetailUserChecklist}
                {...$props}
            />
        )

    }
    _getDetailsView=($props:RouteComponentProps)=>{
        
        return (
            <ChecklistsDetailView
                mode={UIDetailFrame.MODE_VIEW}
                checklistId={this._curDetailId}
                isDetailUserChecklist={this._isDetailUserChecklist}
                {...$props}
            />
        )

    }

    _getDetail=($props:RouteComponentProps<DetailParams>)=>{

        this._curDetailId = $props.match.params.id;
        this._isDetailUserChecklist = false;
        let detailPath:string = ChecklistsView.PATH+"/"+this._curDetailId;

        return (
            <Switch>
                <Route exact path={detailPath} component={this._getDetailsView}/>
                {User.selectedOrg.rgChecklists.canEdit && (
                    <Route exact path={detailPath+MasterDetailSwitch.PATH_EDIT} component={this._getDetailsEdit}/>
                )}
            </Switch>
        )
    }

    _getMyDetail=($props:RouteComponentProps<DetailParams>)=>{


        this._curDetailId = $props.match.params.id;
        this._isDetailUserChecklist = true;

        let detailPath:string = ChecklistsView.PATH_USER+"/"+this._curDetailId;
        return (
            <Switch>
                <Route exact path={detailPath} component={this._getDetailsView}/>
                {User.selectedOrg.rgChecklists.canEdit && (
                    <Route exact path={detailPath+MasterDetailSwitch.PATH_EDIT} component={this._getDetailsEdit}/>
                )}
            </Switch>
        )
    }



    render() {


        

        let canView = User.selectedOrg.rgChecklists.canView;
        let canAdd = User.selectedOrg.rgChecklists.canAdd;
        
        if(User.selectedOrg.rgMyChecklists.canView){
            canView=true;
        }
        

        
        if(!canView){
            return <Redirect to={DashboardView.PATH}/>;
        }

        return (
            <Switch>
                <Route exact path={ChecklistsView.PATH} component={this._getMaster}/>
                {canAdd && (
                    <Route exact path={ChecklistsView.PATH+MasterDetailSwitch.PATH_NEW} component={this._getNew}/>
                )}    
                <Route path={ChecklistsView.PATH+"/:id"} component={this._getDetail}/>
                <Route path={ChecklistsView.PATH_USER+"/:id"} component={this._getMyDetail}/>
            </Switch>
        );
    }
}
