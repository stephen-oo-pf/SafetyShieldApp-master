import * as React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch'

import icon3rdPartyConnected from '@iconify/icons-carbon/3rd-party-connected';
import TitleUtil from '../../../../util/TitleUtil';
import IntegrationsDetailView from './IntegrationsDetailView';
import UIDetailFrame from '../../../../ui/UIDetailFrame';

export interface IIntegrationsViewProps {

}

export interface IIntegrationsViewState {

}

export default class IntegrationsView extends React.Component<IIntegrationsViewProps, IIntegrationsViewState> {
    
    static ID:string = "integrations";
    static ICON:object = icon3rdPartyConnected;
    static PATH:string = "/settings/integrations";

    constructor(props: IIntegrationsViewProps) {
        super(props);

        this.state = {
        }
    }

    componentDidMount(){        
        TitleUtil.setPageTitle("Integrations");
    }


    _detailView=($props:RouteComponentProps)=>{
        return (
            <IntegrationsDetailView
                key={"integrationsViewDetail"+Date.now()}
                mode={UIDetailFrame.MODE_VIEW}
                {...$props}
            />
        );
    }
    _detailEdit=($props:RouteComponentProps)=>{
        return (
            <IntegrationsDetailView
                mode={UIDetailFrame.MODE_EDIT}
                {...$props}
            />
        );
    }

    render() {
        return (
            <Switch>
                <Route exact path={IntegrationsView.PATH} component={this._detailView}/>
                <Route exact path={IntegrationsView.PATH+MasterDetailSwitch.PATH_EDIT} component={this._detailEdit}/>                
            </Switch>
        );
    }
}
