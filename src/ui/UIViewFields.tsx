import React from 'react';
import './UIViewFields.scss';
export interface IUIViewFieldsProps {
    extraClassName?:string;
}

export default class UIViewFields extends React.Component<IUIViewFieldsProps> {
    render() {
        let strCN:string = "viewFields fieldArea";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        return (
            <div className={strCN}>
                {this.props.children}
            </div>
        );
    }
}




interface UIViewFieldsItemProps{
    extraClassName?:string;
    title?:string | JSX.Element;
    value?:string | JSX.Element;
    extra?:JSX.Element;
    fullWidth?:boolean;
    focused?:boolean;
}

export class UIViewFieldsItem extends React.Component<UIViewFieldsItemProps>{
    render(){
        let strCN:string = "viewFieldsItem fieldItem";

        if(this.props.fullWidth){
            strCN+=" fullWidth";
        }
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        if(this.props.focused){
            strCN+=" focused";
        }
        return (
            <div className={strCN}>
                {this.props.title && (                
                    <div className="title">{this.props.title}</div>
                )}
                {this.props.value && (
                    <div className="value">{this.props.value}</div>
                )}
                {this.props.extra}
            </div>
        )
    }
}