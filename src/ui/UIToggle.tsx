import React from 'react';

import './UIToggle.scss';
import UIIcon from './UIIcon';

import dragVerticalVariant from '@iconify/icons-mdi/drag-vertical-variant';

interface UIToggleProps{
    name?:string;
    labelOn?:string;
    labelOff?:string;
    size?:string;
    enabled:boolean;
    extraClassName?:string;
    extraStyle?:any;
    inactive?:boolean;
    inactiveMsg?:string;
    onClick:($value:boolean, $name?:string)=>void;
}
export default class UIToggle extends React.Component<UIToggleProps>{


    static SIZE_NORMAL:string = "normal";
    static SIZE_SMALL:string = "small";

    _onClick=()=>{
        this.props.onClick(!this.props.enabled,this.props.name);
    }
    render(){

        let strSize:string = UIToggle.SIZE_NORMAL;
        if(this.props.size){
            strSize = this.props.size;
        }

        let strClassName:string = "toggle "+strSize;

        if(this.props.enabled){
            strClassName+= " on";
        }else{
            strClassName+= " off";
        }
        if(this.props.inactive){
            strClassName+=" inactive";
        }
        if(this.props.extraClassName){
            strClassName+=" "+this.props.extraClassName;
        }

        let strLblOff:string = "OFF";
        if(this.props.labelOff){
            strLblOff = this.props.labelOff;
        }
        let strLblOn:string = "ON";
        if(this.props.labelOn){
            strLblOn = this.props.labelOn;
        }
        let objStyle:any = {};
        if(this.props.extraStyle){
            objStyle = {...objStyle, ...this.props.extraStyle};
        }

        return(
            <div className={strClassName} onClick={this._onClick} style={objStyle}>
                <div className="toggleInside">
                    <div className="toggleOn">{strLblOn}</div>
                    <div className="toggleDrag"><UIIcon icon={dragVerticalVariant}/></div>
                    <div className="toggleOff">{strLblOff}</div>
                </div>
                {this.props.inactive && this.props.inactiveMsg && (
                    <div className="toggleInactive">{this.props.inactiveMsg}</div>
                )}
            </div>
        )
    }
}