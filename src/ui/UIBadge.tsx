import * as React from 'react';
import './UIBadge.scss';
export interface IUIBadgeProps {
    color:string;
    text:string;
}

export default class UIBadge extends React.Component<IUIBadgeProps> {

    static COLOR_RED:string = "red";
    static COLOR_BLUE:string = "blue";
    static COLOR_ORANGE:string = "orange";

    render() {
        let strCN:string = "badge color_"+this.props.color;
        return (
            <div className={strCN}>
                {this.props.text}
            </div>
        );
    }
}

export class UIIncidentReportedBadge extends React.Component{
    render() {
        return (
            <UIBadge text="REPORTED" color={UIBadge.COLOR_ORANGE}/>
        );
    }
}
export class UIActiveIncidentBadge extends React.Component{
    render() {
        return (
            <UIBadge text="ACTIVE" color={UIBadge.COLOR_RED}/>
        );
    }
}
export class UIUrgentBadge extends React.Component{
    render() {
        return (
            <UIBadge text="URGENT" color={UIBadge.COLOR_RED}/>
        );
    }
}


export class UIDrillBadge extends React.Component{
    render() {
        return (
            <UIBadge text="DRILL" color={UIBadge.COLOR_BLUE}/>
        );
    }
}

