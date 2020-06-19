import React from 'react';
import './UIIncidentTypeIcon.scss';
import UIIcon from './UIIcon';
import { IIncidentTypeData, getIncidentTypeIconOrFontLetter } from '../data/IncidentData';

export interface UIIncidentTypeIconProps {
    type:IIncidentTypeData;
    showLabel?:boolean;
    extraClassName?:string;
    smallerAndBlack?:boolean;
    onClick?:()=>void;
}


export default class UIIncidentTypeIcon extends React.Component<UIIncidentTypeIconProps> {

    render() {
        let strCN:string = "incidentTypeIcon";

        if(this.props.smallerAndBlack){
            strCN+=" smallerAndBlack";
        }
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        if(this.props.onClick){
            strCN+=" clickable";
        }


        let icon = getIncidentTypeIconOrFontLetter(this.props.type.iconInfo) as object;

        return (
            <div className={strCN} onClick={this.props.onClick}>


                <UIIcon icon={icon} altTitle={this.props.type.incidentType}/>
                {this.props.showLabel && (
                    <div className="label">{this.props.type.incidentType}</div>
                )}
                {this.props.children}              
            </div>
        );
    }
}
