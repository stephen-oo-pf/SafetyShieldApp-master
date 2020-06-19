

import React from 'react';
import UIInput from './UIInput';
import UIIcon from './UIIcon';

import './UIFilterInput.scss';

import closeIcon from '@iconify/icons-mdi/close';
import magnifyIcon from '@iconify/icons-mdi/magnify';

export interface IUIFilterInputProps {
    placeholder:string;
    filter:string;
    onChange:($value:string)=>void;
}

export default class UIFilterInput extends React.Component<IUIFilterInputProps> {

    
    _onFilterChange=($value:string, $name?:string)=>{
        this.props.onChange($value);
    }
    _onClearFilter=()=>{
        this.props.onChange("");
    }

    render() {

        let strCN:string = "filterInput";

        let inputIcon = magnifyIcon;
        let strClearIconCN:string = "clear";
        if(this.props.filter!==""){            
            strClearIconCN+=" searching";
            inputIcon = closeIcon;
        }

        return (    
            <UIInput extraClassName={strCN} title={this.props.placeholder} value={this.props.filter} onChange={this._onFilterChange} name="filter">
                <UIIcon extraClassName={strClearIconCN} icon={inputIcon} onClick={this._onClearFilter}/>
            </UIInput>     
        );
    }
}
