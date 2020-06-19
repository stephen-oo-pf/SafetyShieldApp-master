import * as React from 'react';
import UILoginFrame from './UILoginFrame';
import UIButton from './UIButton';
import UIStatusBanner from './UIStatusBanner';

export interface IUIReloadAppProps {
    title:string;
    statusTextError:string;
}

export default class UIReloadApp extends React.Component<IUIReloadAppProps> {
    render() {
        return (
        <UILoginFrame onStatusClose={()=>{}} statusText={this.props.statusTextError} statusType={UIStatusBanner.STATUS_ERROR} title={this.props.title}>
            <UIButton label="Reload" onClick={()=>{
                window.location.reload(true);
            }}/>
        </UILoginFrame>
        );
    }
}
