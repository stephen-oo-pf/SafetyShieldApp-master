import * as React from 'react';
import cogIcon from '@iconify/icons-mdi/cog';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import GeneralDetailView from './GeneralDetailView';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import TitleUtil from '../../../../util/TitleUtil';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';

export interface IGeneralViewProps {
}

export interface IGeneralViewState {
}

export default class GeneralView extends React.Component<IGeneralViewProps, IGeneralViewState> {

    static ID:string = "general";
    static ICON:object = cogIcon;
    static PATH:string = "/settings/general";

    constructor(props: IGeneralViewProps) {
        super(props);

        this.state = {

        }
    }
    
    componentDidMount(){
        
        TitleUtil.setPageTitle("General Settings");

    }

    _detailView=($props:RouteComponentProps)=>{
        return (
            <GeneralDetailView
                key={"viewDetail"+Date.now()}
                mode={UIDetailFrame.MODE_VIEW}
                {...$props}
            />
        );
    }
    _detailEdit=($props:RouteComponentProps)=>{
        return (
            <GeneralDetailView
                mode={UIDetailFrame.MODE_EDIT}
                {...$props}
            />
        );
    }

    render() {
        return (
            <Switch>
                <Route exact path={GeneralView.PATH} component={this._detailView}/>
                <Route exact path={GeneralView.PATH+MasterDetailSwitch.PATH_EDIT} component={this._detailEdit}/>
            </Switch>
        );
    }
}
