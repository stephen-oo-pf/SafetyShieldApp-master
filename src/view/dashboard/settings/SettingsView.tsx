import * as React from 'react';
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';

import cogIcon from '@iconify/icons-mdi/cog';

import UIDetailFrame from '../../../ui/UIDetailFrame';
import UIView from '../../../ui/UIView';
import User from '../../../data/User';
import UsersView from './users/UsersView';
import GeneralView from './general/GeneralView';
import IntegrationsView from './integrations/IntegrationsView';

export interface ISettingsViewProps {
}

export interface ISettingsViewState {
}

export default class SettingsView extends React.Component<ISettingsViewProps, ISettingsViewState> {

    static ID:string = "settings";
    static ICON:object = cogIcon;
    static PATH:string = "/settings";

    constructor(props: ISettingsViewProps) {
        super(props);

        this.state = {
        }
    }

    render() {


        let orgSettings:boolean = User.selectedOrg.rgOrgSettings.canView

        let defaultPath:string = "";
        if(orgSettings){
            defaultPath = GeneralView.PATH;
            //defaultPath = IntegrationsView.PATH;
        }else if(User.selectedOrg.rgUsers.canView){
            defaultPath = UsersView.PATH;
        }

        

        return (
            <Switch>

                {User.selectedOrg.rgUsers.canView && (
                    <Route path={UsersView.PATH} component={UsersView}/>  
                )}
                {orgSettings && (
                    <Route path={IntegrationsView.PATH} component={IntegrationsView}/>
                )}
                {orgSettings && (
                    <Route path={GeneralView.PATH} component={GeneralView}/>
                )}
                <Redirect to={defaultPath}/>
            </Switch>
        );
    }
}
