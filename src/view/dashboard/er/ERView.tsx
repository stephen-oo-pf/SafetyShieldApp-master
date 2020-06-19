import React from 'react';

import alarmLight from '@iconify/icons-mdi/alarm-light';


import { Route, Switch, Redirect } from 'react-router-dom';
import ECView from './ec/ECView';
import TitleUtil from '../../../util/TitleUtil';


import User from '../../../data/User';

import ChecklistsView from './checklists/ChecklistsView';
import BNView from './bn/BNView';
import DrillsView from './drills/DrillsView';
import EventMapView from './eventMap/EventMapView';


export interface IERViewProps {

}
export default class ERView extends React.Component<IERViewProps> {
    
    static ID:string = "eventResponse";
    static ICON:object = alarmLight;
    static PATH:string = "/event-response";


    render() {


        let defaultPath:string = "";
        if(User.selectedOrg.hasIncidentControl){
            defaultPath = EventMapView.PATH;
        }else if(User.selectedOrg.rgChecklists.canView){
            defaultPath = ChecklistsView.PATH;
        }else if(User.selectedOrg.rgMyChecklists.canView){
            defaultPath = ChecklistsView.PATH_USER;
        }else if(User.selectedOrg.rgEC.canView){
            defaultPath = ECView.PATH;
        }else if(User.selectedOrg.rgBroadcasts.canView){
            defaultPath = BNView.PATH;
        }else if(User.selectedOrg.hasIncidentControl){
            defaultPath = DrillsView.PATH;
        }


        return (
            <Switch>
                
                {User.selectedOrg.hasIncidentControl && (
                    <Route path={EventMapView.PATH} component={EventMapView}/>
                )}
                {(User.selectedOrg.rgChecklists.canView) && (
                    <Route path={ChecklistsView.PATH} component={ChecklistsView}/>
                )}                
                {(User.selectedOrg.rgMyChecklists.canView) && (
                    <Route path={ChecklistsView.PATH_USER} component={ChecklistsView}/>
                )}
                {User.selectedOrg.rgEC.canView && (
                    <Route path={ECView.PATH} component={ECView}/>
                )}
                {User.selectedOrg.rgBroadcasts.canView && (
                    <Route path={BNView.PATH} component={BNView}/>
                )}
                {User.selectedOrg.hasIncidentControl && (
                    <Route path={DrillsView.PATH} component={DrillsView}/>
                )}
                <Redirect to={defaultPath}/>
            </Switch>
        );
    }
}
