import * as React from 'react';
import UIIncidentTypeIcon from './UIIncidentTypeIcon';
import { IIncidentTypeData } from '../data/IncidentData';
import { UIDrillBadge } from './UIBadge';
import UIIncidentInfo, { IIncidentInfo } from './UIIncidentInfo';
import './UIIncidentFrame.scss';
import UITitle from './UITitle';

export interface IUIIncidentFrameProps {
    orgName?:string;
    incidentType:IIncidentTypeData;
    title?:string;
    isDrill?:boolean;
    headerRightContent?:JSX.Element;
    incidentInfo:IIncidentInfo[];
    subtitle?:string;
}

export default class UIIncidentFrame extends React.Component<IUIIncidentFrameProps> {
    render() {

        let strCN:string = "incidentFrame";

        let title:string = this.props.incidentType.incidentType;
        if(this.props.title){
            title = this.props.title;
        }

        return (
            <div className={strCN}>
                {this.props.orgName && (
                    <div className="incidentFrameOrgHeader">
                        {this.props.orgName && (
                            <UITitle title={this.props.orgName}/>
                        )}
                    </div>
                )}
                <div className="incidentFrameHeader">
                    <UIIncidentTypeIcon smallerAndBlack type={this.props.incidentType}>
                        {this.props.isDrill && (
                            <UIDrillBadge/>
                        )}
                        <div className="label">{title}<div className="subtitle">{this.props.subtitle}</div></div>
                    </UIIncidentTypeIcon>
                    {this.props.headerRightContent && (
                        <div className="incidentFrameHeaderRight">
                            {this.props.headerRightContent}
                        </div>
                    )}
                </div>
                {this.props.incidentInfo.length>0 && (
                    <UIIncidentInfo data={this.props.incidentInfo}/>
                )}
                {this.props.children}
            </div>
        );
    }
}
