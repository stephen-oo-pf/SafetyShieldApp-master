import React from 'react';
import UICenterBox from './UICenterBox';
import UILoadingIcon from './UILoadingIcon';
import './UILoadingBox.scss';

export interface UILoadingBoxProps {
    extraClassName?:string;
    fullHeight?:boolean;
    whiteIcon?:boolean;
}

export default class UILoadingBox extends React.Component<UILoadingBoxProps> {
    render() {
        let strCN:string = "loadingBox";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        if(this.props.fullHeight){
            strCN+=" fullHeight";
        }
        return (
            <UICenterBox extraClassName={strCN}>
                <UILoadingIcon whiteIcon={this.props.whiteIcon}/>
                {this.props.children}
            </UICenterBox>
        );
    }
}
