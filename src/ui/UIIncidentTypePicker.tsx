import * as React from 'react';
import UIIncidentTypeIcon from './UIIncidentTypeIcon';
import { IIncidentTypeData, getIncidentTypeById, getIncidentStatusById } from '../data/IncidentData';
import User from '../data/User';
import './UIIncidentTypePicker.scss';
import UITitle from './UITitle';

export interface IUIIncidentTypePickerProps {
    title?:string;
    selectedIncidentTypeId?:string;
    onChange:($incidentTypeId:string)=>void;
}

export default class UIIncidentTypePicker extends React.Component<IUIIncidentTypePickerProps> {

    _onItemClick=($type:IIncidentTypeData)=>{
        this.props.onChange($type.incidentTypeId);
    }

    render() {

        let strCN:string = "incidentTypePicker";
        return (
            <div className={strCN}>
                {this.props.title && (
                    <UITitle title={this.props.title}/>
                )}
                <div className="incidentTypePickerContainer">
                    
                    {User.state.allIncidentTypes.map(($type)=>{
                        return (
                            <UIIncidentTypePickerItem
                                
                                selected={$type.incidentTypeId===this.props.selectedIncidentTypeId}
                                type={$type}
                                onClick={this._onItemClick}
                            />
                        )
                    })}
                </div>
            </div>
        );
    }
}

export interface IUIIncidentTypePickerItemProps {
    type:IIncidentTypeData;
    onClick:($type:IIncidentTypeData)=>void;
    selected?:boolean;
}

export class UIIncidentTypePickerItem extends React.Component<IUIIncidentTypePickerItemProps> {
    _onClick=()=>{
        this.props.onClick(this.props.type);
    }
    render() {
        let strCN:string = "incidentTypePickerItem";


        if(this.props.selected){
            strCN+=" selected";
        }

        return (
            <UIIncidentTypeIcon
                smallerAndBlack
                extraClassName={strCN}
                type={this.props.type}
                showLabel
                onClick={this._onClick}
            />
        );
    }
}

