import React from 'react';
import './UICheckbox.scss';
import UIIcon from './UIIcon';


import checkBold from '@iconify/icons-mdi/check-bold';
import { IIncidentTypeData } from '../data/IncidentData';
import { ifError } from 'assert';
import UIIncidentTypeIcon from './UIIncidentTypeIcon';


export interface IUICheckboxProps {
    checked:boolean;
    label?:string;
    name:string;
    extraClassName?:string;
    disabled?:boolean;
    readonly?:boolean;
    onChange:($value:boolean, $name?:string)=>void;
    incidentType?:IIncidentTypeData;
}

interface IUICheckboxState{
    focused:boolean;
}

export default class UICheckbox extends React.Component<IUICheckboxProps, IUICheckboxState> {

    constructor($props:IUICheckboxProps){
        super($props);
        this.state = {
            focused:false
        }
    }

    _onChange=($event:React.ChangeEvent<HTMLInputElement>)=>{
        this.props.onChange($event.target.checked, this.props.name);
    }
    _onBlur=()=>{
        this.setState({focused:false});
    }
    _onFocus=()=>{
        this.setState({focused:true});
    }

    render() {
        let strCN:string = "checkbox";

        if(this.props.checked){
            strCN+=" checked";
        }
        if(this.state.focused){
            strCN+=" focused";
        }
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }

        let extraProps:any = {}

        let checked:boolean=false;
        if(this.props.checked){
            checked=true;
        }

        let disabled:boolean=false;
        if(this.props.disabled){
            disabled = true;
            strCN+=" disabled";
        }
        if(this.props.readonly){
            disabled = true;
            strCN+=" readonly";
        }
        
        let jsxIcon:JSX.Element = <UIIcon icon={checkBold}/>;
        
        let useBubbleStyle:boolean=false;

        if(this.props.incidentType){
            jsxIcon = (
                <UIIncidentTypeIcon type={this.props.incidentType}/>
            );
            useBubbleStyle=true;
        }
        
        if(useBubbleStyle){
            strCN+=" bubbleStyle";
        }



        return (            
            <div className={strCN}>                
                <div className="checkboxBox">                    
                    <input disabled={disabled} type="checkbox" {...extraProps} checked={checked} onBlur={this._onBlur} onFocus={this._onFocus} id={this.props.name+"checkbox"}  onChange={this._onChange}/>
                    {jsxIcon}
                </div>
                {this.props.label && (
                    <div className="checkboxLabel">
                        <label htmlFor={this.props.name+"checkbox"}>{this.props.label}</label>
                    </div>
                )}
            </div>
        );
    }
}
