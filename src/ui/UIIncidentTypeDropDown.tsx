import React from 'react';
import UIDropDown, { UIDDItemDataProps, UIDDItemData } from './UIDropDown';
import './UIIncidentTypeDropDown.scss';

import UIIncidentTypeIcon from './UIIncidentTypeIcon';
import { IIncidentTypeData } from '../data/IncidentData';
import User from '../data/User';


export interface UIIncidentTypeDropDownProps {
    incidentTypeId:string;
    notSelectedValue:string;
    onItemSelected:($data:string,$name:string)=>void;
}

export interface UIIncidentTypeDropDownState {
}

export default class UIIncidentTypeDropDown extends React.Component<UIIncidentTypeDropDownProps, UIIncidentTypeDropDownState> {
    constructor(props: UIIncidentTypeDropDownProps) {
        super(props);

        this.state = {

        }
    }

    _onItemSelected=($data:UIDDItemData,$name:string)=>{
        this.props.onItemSelected($data.id,$name);
    }
    

    render() {


        let selectedType:IIncidentTypeData | undefined = undefined;

        let ddData:UIDDItemData[] = User.state.allIncidentTypes.map(($value)=>{

            if(this.props.incidentTypeId===$value.incidentTypeId){
                selectedType = $value;
            }

            return {
                id:$value.incidentTypeId,
                type:$value
            }
        });

        let jsxLabel:JSX.Element = <></>;
        
        if(selectedType){
            jsxLabel = (
                <UIIncidentTypeIcon showLabel type={selectedType!}/>
            );
        }else{
            jsxLabel = (
            <div className="chooseIncidentType">{this.props.notSelectedValue}</div>
            )
        }

        return <UIDropDown
            extraClassName="incidentTypeDropDown"
            itemRenderer={UIIncidentTypeDropDownRenderer}
            label={jsxLabel}
            data={ddData}
            name={"incidentTypeId"}
            onItemSelected={this._onItemSelected}
        />;
    }
}



interface UIIncidentTypeDropDownRendererProps extends UIDDItemDataProps{
    
}

class UIIncidentTypeDropDownRenderer extends React.Component<UIIncidentTypeDropDownRendererProps> {

    _onClick=()=>{
        this.props.onItemSelected(this.props.data,this.props.name);
    }
    render() {

        return (
        <div className="incidentTypeDropDownItem" onClick={this._onClick}>
            <UIIncidentTypeIcon type={this.props.data.type} showLabel />
        </div>
        );
    }
}

