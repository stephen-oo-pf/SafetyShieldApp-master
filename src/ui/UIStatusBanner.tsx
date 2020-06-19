import React from 'react';
import './UIStatusBanner.scss';
import UIIcon from './UIIcon';

import closeIcon from '@iconify/icons-mdi/close';

import alertIcon from '@iconify/icons-mdi/alert';
import alertCircleOutline from '@iconify/icons-mdi/alert-circle-outline';
import cancelIcon from '@iconify/icons-mdi/cancel';


import checkboxMarkedCircle from '@iconify/icons-mdi/checkbox-marked-circle';


export interface UIStatusBannerProps {
    type:string;
    size?:string;
    text?:string | JSX.Element;
    onClose?:()=>void;
}


export interface UIStatusBannerState {
    closing:boolean;
    
}

export default class UIStatusBanner extends React.Component<UIStatusBannerProps, UIStatusBannerState> {

    static STATUS_ERROR:string = "error";
    static STATUS_INFO:string = "info";
    static STATUS_SUCCESS:string = "success";
    static STATUS_WARNING:string = "warning";

    static SIZE_NORMAL:string = "normal";
    static SIZE_SMALL:string = "small";

    constructor(props: UIStatusBannerProps) {
        super(props);

        this.state = {
            closing:false
        }
    }
    timeoutID:number = -1;
    _onClick=()=>{
        if(!this.state.closing){

            this.setState({closing:true});

            window.clearTimeout(this.timeoutID);
    
            this.timeoutID = window.setTimeout(()=>{
                if(this.props.onClose){
                    this.props.onClose();
                }
            },410);
        }
    }
    render() {
        let strCN:string = "statusBanner "+this.props.type;

        if(this.state.closing){
            strCN+= " closing";
        }
        let icon:object = {};
        switch(this.props.type){
            case UIStatusBanner.STATUS_ERROR:
                icon = cancelIcon;
            break;
            case UIStatusBanner.STATUS_INFO:
                icon = alertCircleOutline;
            break;
            case UIStatusBanner.STATUS_SUCCESS:
                icon = checkboxMarkedCircle;
            break;
            case UIStatusBanner.STATUS_WARNING:
                icon = alertIcon;
            break;
        }
        let jsxicon:JSX.Element = <UIIcon icon={icon}/>

        let strSize:string = UIStatusBanner.SIZE_NORMAL;
        if(this.props.size){
            strSize = this.props.size;
        }

        strCN+=" size_"+strSize;

        return (
            <div className={strCN}>
                <div className="text">
                    {jsxicon}
                    {this.props.text}
                </div>
                {this.props.onClose && (
                    <UIIcon extraClassName="close" icon={closeIcon} onClick={this._onClick}/>
                )}
            </div>
        );
    }
}
