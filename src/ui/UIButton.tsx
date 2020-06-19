import React from 'react';
import { NavLink } from 'react-router-dom';
import UIIcon from './UIIcon';
import './UIButton.scss';

import deleteIcon from '@iconify/icons-mdi/delete';
import pencilIcon from '@iconify/icons-mdi/pencil';
import plusIcon from '@iconify/icons-mdi/plus';
import phoneIcon from '@iconify/icons-mdi/phone';
import FormatUtil from '../util/FormatUtil';

export interface UIButtonProps {
    extraClassName?:string;
    size?:string;
    fontSize?:string;
    color?:string;
    label?:string | JSX.Element;
    onClick?:()=>void;
    path?:string;
    icon?:object;
    alt?:string;
    useATag?:boolean;
    
    fullWidth?:boolean;
    useButton?:boolean;
    isSquare?:boolean;
    download?:string;
    disabled?:boolean;
    horizontalAlign?:string;
    iconOnLeft?:boolean;
    iconEdge?:boolean;
    circle?:boolean;
    style?:any;
}


export default class UIButton extends React.Component<UIButtonProps> {


    static COLOR_PURPLE:string = "color_purple";
    static COLOR_LIGHTPURPLE:string = "color_lightpurple";
    
    static COLOR_RED:string = "color_red";
    static COLOR_ORANGE:string = "color_orange";
    static COLOR_LIGHTGREY:string = "color_lightgrey";
    static COLOR_WHITE:string = "color_white";
    static COLOR_TRANSPARENT_PURPLE:string = "color_transparent_purple";
    static COLOR_TRANSPARENT:string = "color_transparent";

    static ALIGN_LEFT:string = "align_left";
    static ALIGN_RIGHT:string = "align_right";
    static ALIGN_CENTER:string = "align_center";

    
    static SIZE_LARGE:string = "size_large";
    static SIZE_NORMAL:string = "size_normal"
    static SIZE_SMALL:string = "size_small";
    static SIZE_TINY:string = "size_tiny";
    static SIZE_SINGLELINE:string = "size_singleline";

    _onClick=()=>{
        if(this.props.onClick){
            this.props.onClick();
        }
    }

    render() {


        let jsx:JSX.Element = <></>;

        let strColor:string = UIButton.COLOR_PURPLE;
        if(this.props.color){
            strColor = this.props.color;
        }

        let strSize:string = UIButton.SIZE_NORMAL;
        if(this.props.size){
            strSize = this.props.size;
        }

        

        let strHorAlign:string = "text_"+UIButton.ALIGN_LEFT;
        if(this.props.horizontalAlign){
            strHorAlign = "hor_"+this.props.horizontalAlign;
        }
        let strFontSize:string = "font_"+UIButton.SIZE_NORMAL;
        if(this.props.fontSize){
            strFontSize = "font_"+this.props.fontSize;
        }

        let strCN:string = "button "+strColor+" "+strSize+" "+strFontSize+" "+strHorAlign;

        if(this.props.iconOnLeft){
            strCN+=" iconOnLeft";
        }
        if(this.props.iconEdge){
            strCN+=" iconEdge";
        }

        if(this.props.fullWidth){
            strCN+=" fullWidth";
        }
        if(this.props.isSquare){
            strCN+=" square";
        }
        if(this.props.useButton){
            strCN+=" realButton";
        }

        if(this.props.disabled){
            strCN+=" disabled";
        }
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }

        if(this.props.circle){
            strCN+=" circle";
        }
        
        let icon:JSX.Element = <></>;
        if(this.props.icon){
            icon = <UIIcon icon={this.props.icon}/>
        }

        let label:string | JSX.Element = "";
        if(this.props.label){
            label = this.props.label;
            strCN+=" hasLabel";            
        }else{
            strCN+=" noLabel";
        }
        let extraProps:any = {};
        if(this.props.onClick){
            extraProps.onClick=this.props.onClick;
        }
        if(this.props.alt){
            extraProps.title = this.props.alt;
        }
        if(this.props.style){
            extraProps.style = this.props.style;
        }
        
        //4 types of elements (NavLink,a, button,div)
        if(this.props.path){

            if(this.props.download){
                extraProps.download = this.props.download;
            }
            
            if(this.props.useATag){
                jsx = <a className={strCN} {...extraProps} href={this.props.path}>{label}{icon}</a>
            }else{
                jsx = <NavLink className={strCN} {...extraProps} to={this.props.path}>{label}{icon}</NavLink>
            }


            
        }else{

            if(this.props.useButton){
                jsx = <button className={strCN} {...extraProps} onClick={this._onClick}>{label}{icon}</button>
            }else{
                jsx = <div className={strCN} {...extraProps} onClick={this._onClick}>{label}{icon}</div>
            }
        

        }

        return jsx;
    }
}



export class UISaveButton extends React.Component<{onClick:()=>void, disabled?:boolean}>{
    render(){
        return (
            <UIButton disabled={this.props.disabled} label="Save" extraClassName="save" size={UIButton.SIZE_SMALL} onClick={this.props.onClick}/>
        )
    }
}


export class UICancelButton extends React.Component<{path:string, purple?:boolean}>{
    
    render(){
        let color:string = UIButton.COLOR_TRANSPARENT;
        if(this.props.purple){
            color = UIButton.COLOR_TRANSPARENT_PURPLE;
        }
    
        return (
            <UIButton path={this.props.path} size={UIButton.SIZE_SMALL} label="Cancel" color={color}/>
        )
    }
}

export class UIDeleteButton extends React.Component<{onClick:()=>void, label?:string}>{
    render(){

        let lbl:string = "Delete";
        if(this.props.label){
            lbl = this.props.label;
        }

        return (
            <UIButton size={UIButton.SIZE_SMALL} extraClassName="delete" color={UIButton.COLOR_TRANSPARENT_PURPLE} label={lbl} icon={deleteIcon} onClick={this.props.onClick} />
        )
    }
}

export class UIAddButton extends React.Component<{path:string, label:string, icon?:object}>{
    render(){
        let icon:object = plusIcon;
        if(this.props.icon){
            icon = this.props.icon;
        }
        return (
            <UIButton icon={icon} path={this.props.path} extraClassName="add" size={UIButton.SIZE_SMALL} label={this.props.label}/>
        )
    }
}

export class UIEditButton extends React.Component<{path:string, isSquare?:boolean}>{
    render(){
        let lbl:string = "Edit";
        let extraProps:any = {};
        if(this.props.isSquare){
            lbl = "";
            extraProps.isSquare=true;
            extraProps.color = UIButton.COLOR_LIGHTGREY;
        }
        return (
            <UIButton {...extraProps} icon={pencilIcon} path={this.props.path} extraClassName="edit" size={UIButton.SIZE_SMALL} label={lbl}/>
        )
    }
}


export class UIPhoneButton extends React.Component<{number:string, alt?:string}>{
    render(){
        let alt:string = FormatUtil.phoneNumber(this.props.number);
        if(this.props.alt){
            alt = this.props.alt;
        }
        return (
            <UIButton alt={alt} useATag color={UIButton.COLOR_LIGHTGREY} isSquare icon={phoneIcon} path={"tel:"+this.props.number} circle extraClassName="tel" size={UIButton.SIZE_TINY}/>
        )
    }
}



                                          
        