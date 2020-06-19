import * as React from 'react';
import UIWhiteBox from './UIWhiteBox';
import './UIIncidentTableFrame.scss';

export interface IUIIncidentTableFrameProps {
    header?:JSX.Element;   
    belowHeaderContent?:JSX.Element; 
    extraClassName?:string;
}


export default class UIIncidentTableFrame extends React.Component<IUIIncidentTableFrameProps> {
    render() {
        let strCN:string = "incidentTableFrame";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }

        return (
            <div className={strCN}>
                <div className="incidentTableFrameHeader">
                    {this.props.header}
                </div>
                {this.props.belowHeaderContent}
                <UIWhiteBox noPadding>
                    {this.props.children}
                </UIWhiteBox>                
            </div>
        );
    }
}
