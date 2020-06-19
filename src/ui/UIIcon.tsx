import React from 'react';

import {InlineIcon} from "@iconify/react";
import './UIIcon.scss';

interface UIIconProps{
    icon:object;
    color?:string;
    extraClassName?:string;
    size?:number;
    style?:any;
    altTitle?:string;
    onClick?:()=>void;
}
export default class UIIcon extends React.PureComponent<UIIconProps>{



    render(){

        let style:React.CSSProperties = {};
        if(this.props.color){
            style.color = this.props.color;
        }

        let strCN:string = "icon";
        if(this.props.extraClassName){
            strCN += " "+this.props.extraClassName;
        }
        let size:number = 24;
        if(this.props.size){
            size = this.props.size;
        }

        let props:any = {};
        if(this.props.onClick){
            props.onClick = this.props.onClick;
        }
        if(this.props.altTitle){
            props.title= this.props.altTitle;
        }

        if(this.props.style){
            props.style = {...this.props.style};
        }

        return (
            <div className={strCN} {...props}>
                <InlineIcon style={style} width={size} height={size}  icon={this.props.icon}/>  
            </div>     
        )
    }
}