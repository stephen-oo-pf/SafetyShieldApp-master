import * as React from 'react';
import './UIChecklistStepIcon.scss';

export interface IUIChecklistStepIconProps {
    step:number;
    label?:string;
}

export default class UIChecklistStepIcon extends React.Component<IUIChecklistStepIconProps> {
    render() {
        return (
            <div className="checklistStep">
                <div className="checklistStepIcon">
                    {this.props.step}
                </div>
                {this.props.label && (
                    <div className="checklistStepLabel">
                        {this.props.label}
                    </div>
                )}
            </div>
        );
    }
}
