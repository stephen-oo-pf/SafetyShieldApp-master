import React from 'react';
import Widget from './Widget';
import UISwitchAccount from '../../../../ui/UISwitchAccount';
import './OrgSelectorWidget.scss';

export interface IStatWidgetProps{
}

export interface IStatWidgetState {

    focused:boolean;

}

export default class OrgSelectorWidget extends React.Component<IStatWidgetProps, IStatWidgetState> {

    static ID:string = "orgSelectorWidget";

    constructor(props: IStatWidgetProps) {
        super(props);

        this.state = {
            focused:false
        }
    }

    _onOpen=()=>{
        this.setState({focused:true});
    }
    _onClose=()=>{
        this.setState({focused:false});
        
    }

    render() {
        return (
            <Widget id={OrgSelectorWidget.ID} label="Summary For" isFocused={this.state.focused}>
                <UISwitchAccount onClose={this._onClose} onOpen={this._onOpen}/>
            </Widget>
        );
    }
}



