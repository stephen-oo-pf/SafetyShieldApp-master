import React from 'react';
import './UITitle.scss';
import UIIcon from './UIIcon';

export interface IUITitleProps {
    title:string | JSX.Element;
    icon?:object;
    fieldItem?:boolean;
    extraClassName?:string;
    isSubtitle?:boolean;
    smaller?:boolean;
}

export default class UITitle extends React.Component<IUITitleProps> {
    render() {
        let strCN:string = "title";

        if(this.props.fieldItem){
            strCN+=" fieldItem fullWidth";
        }

        if(this.props.isSubtitle){
            strCN+=" subtitle";
        }
        if(this.props.smaller){
            strCN+=" smaller";
        }
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }

        return (
            <h2 className={strCN}>
                {this.props.icon && (
                    <UIIcon icon={this.props.icon}/>
                )}
                {this.props.title}            
            </h2>
        );
    }
}


