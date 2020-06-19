import React from 'react';
import './UIInput.scss';
import UIIcon from './UIIcon';

import chevronDown from '@iconify/icons-mdi/chevron-down';


export interface IUIInputProps {
    type?:string;
    name:string;
    value:string;
    isRequired?:boolean;
    title?:string;
    fullWidth?:boolean;
    fieldItem?:boolean;
    maxLength?:number;
    extraClassName?:string;
    showTitleAsLabel?:boolean;
    showTitleAsLabel_Placeholder?:string;
    movableTitle?:boolean;
    tabIndex?:number;
    disabled?:boolean;
    
    options?:{label:string, value:string}[];
    onChange:($value:string, $name?:string)=>void;
    
}

export interface IUIInputState{
    focused:boolean;
}


export default class UIInput extends React.Component<IUIInputProps,IUIInputState> {
    constructor(props: IUIInputProps) {
        super(props);

        this.state = {
            focused:false
        }
    }
    _onSelectChange=($event:React.ChangeEvent<HTMLSelectElement>)=>{
        this.props.onChange($event.target.value, this.props.name);
    }
    _onTextareaChange=($event:React.ChangeEvent<HTMLTextAreaElement>)=>{
        this.props.onChange($event.target.value, this.props.name);
    }
    _onInputChange=($event:React.ChangeEvent<HTMLInputElement>)=>{
        this.props.onChange($event.target.value, this.props.name);        
    }

    _onFocus=()=>{
        this.setState({focused:true});
    }
    _onBlur=()=>{
        this.setState({focused:false});
    }
    render() {

        let strCN:string = "input";
        let jsx:JSX.Element = <></>;

        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        if(this.props.value!==""){
            strCN+=" hasValue";
        }
        if(this.props.fullWidth){
            strCN+=" fullWidth";
        }
        if(this.state.focused){
            strCN+=" focused";
        }
        if(this.props.movableTitle){
            strCN+=" movableTitle";
        }
        if(this.props.fieldItem){
            strCN+=" fieldItem";
        }
        if(this.props.disabled){
            strCN+=" disabled";
        }

        let strType:string = "textfield";
        if(this.props.type){
            strType = this.props.type;
        }

        let extraInputProps:any = {};
        if(this.props.maxLength){
            extraInputProps.maxLength = this.props.maxLength;
        }

        let jsxLabel:JSX.Element = <></>;
        if(this.props.showTitleAsLabel && this.props.title){
            jsxLabel = <label className="title" htmlFor={"input_"+this.props.name}>
                {this.props.title}
                {this.props.isRequired && (
                    <span className="required">*</span>
                )}
            </label>
            if(this.props.showTitleAsLabel_Placeholder){
                extraInputProps.placeholder = this.props.showTitleAsLabel_Placeholder;

            }
        }else{
            if(this.props.title){
                extraInputProps.placeholder = this.props.title;
            }
        }




        let sharedProps:any = {
            onFocus:this._onFocus,
            onBlur:this._onBlur,
            className:"inputElement",
            id:"input_"+this.props.name,
            name:this.props.name
        };

        if(this.props.disabled){
            sharedProps.disabled=true;
        }


        switch(strType){
            case "textarea":

                jsx = (
                    <textarea tabIndex={this.props.tabIndex} {...sharedProps} onChange={this._onTextareaChange} value={this.props.value} {...extraInputProps}></textarea>
                );
            break;
            case "select":
                jsx = (
                    <>
                        <select tabIndex={this.props.tabIndex} {...sharedProps} onChange={this._onSelectChange} value={this.props.value}>
                            {this.props.options && this.props.options.map(($value,$index)=>{
                                return (
                                    <option key={this.props.name+"_dd_"+$index} value={$value.value}>{$value.label}</option>
                                )
                            })}
                        </select>
                        <UIIcon extraClassName="ddArrow" icon={chevronDown}/>
                    </>
                );
            break;
            case "radio":
                if(this.props.options){


                    let jsxRadioInputs = this.props.options.map(($value,$index)=>{

                        let inputRadioCN:string = "inputRadio";
                        if($value.value===this.props.value){
                            inputRadioCN+=" checked";
                        }

                        return (
                            <div className={inputRadioCN} key={this.props.name+$index+$value.value}>
                                <input onChange={this._onInputChange} checked={$value.value===this.props.value} type="radio" id={this.props.name+"_"+$index} name={this.props.name} value={$value.value}/>
                                <label htmlFor={this.props.name+"_"+$index}>{$value.label}</label>
                            </div>
                        );
                    });

                    jsx = (
                        <>
                            {jsxRadioInputs}
                        </>
                    )
                }
            break;
            default:
                jsx = (
                    <input tabIndex={this.props.tabIndex} {...sharedProps} onChange={this._onInputChange} type={strType} value={this.props.value} {...extraInputProps} />
                );
        }

        return (
            <div className={strCN}>
                {jsxLabel}
                {jsx}
                {this.props.children}
            </div>
        );
    }
}
