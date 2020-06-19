import React from 'react';

import mapMarker from '@iconify/icons-mdi/map-marker';

import UsersDetailView from '../settings/users/UsersDetailView';
import UIDetailFrame from '../../../ui/UIDetailFrame';
import User from '../../../data/User';
import { RouteComponentProps } from 'react-router-dom';
import accountCircle from '@iconify/icons-mdi/account-circle';

export interface IMyAccountViewProps extends RouteComponentProps{

}

export default class MyAccountView extends React.Component<IMyAccountViewProps> {
    static ID:string = "main";
    static PATH:string = "/my-account";
    static LABEL:string = "User Profile";
    static ICON:object = accountCircle;

    render() {
        return (
            <UsersDetailView
                myAccount
                match={this.props.match}
                location={this.props.location}
                history={this.props.history}
                userId={User.state.userInfo!.userId}
                mode={UIDetailFrame.MODE_VIEW}
            />
        );
    }
}
