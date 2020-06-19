import * as React from 'react';
import UIIcon from './UIIcon';
import './UIIconWLabel.scss';
export interface IUIIconWLabelProps {
    icon:object;
    label:string;
    extraClassName?:string;
}

export default class UIIconWLabel extends React.Component<IUIIconWLabelProps> {
    render() {
        let strCN:string = "iconWLabel";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        return (
            <div className={strCN}>
                <UIIcon icon={this.props.icon}/>
                <div className="iconLabel">{this.props.label}</div>
            </div>
        );
    }
}
