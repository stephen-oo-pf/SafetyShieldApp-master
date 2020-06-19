import React from 'react';
import './UITabBar.scss';
import { NavLink } from 'react-router-dom';
import UIIcon from './UIIcon';


export interface UITabBarProps {
    data:UITabBarItem[];
    onChange?:($id:string)=>void;
    selectedID?:string;
    extraClassName?:string;
    showDescOnHover?:boolean;
    appearAsButtons?:boolean;
    horizontal?:boolean;
    disableSelected?:boolean;
}


export default class UITabBar extends React.Component<UITabBarProps> {
    

    render() {
        let strCN:string = "tabBar";
        if(this.props.extraClassName){
            strCN += " "+this.props.extraClassName;
        }
        if(this.props.appearAsButtons){
            strCN +=" appearAsButtons";
        }
        if(this.props.horizontal){
            strCN +=" horizontal";
        }
        if(this.props.disableSelected){
            strCN +=" disableSelected";
        }
        return (
            <div className={strCN}>
                {this.props.data.map(($value,$index)=>{

                    let isSelected:boolean = false;
                    if(this.props.selectedID && this.props.selectedID===$value.id){
                        isSelected=true;
                    }
                    return (
                        <UITabBarItemRenderer selectedID={this.props.selectedID} showDescOnHover={this.props.showDescOnHover} onChange={this.props.onChange} key={"tabSwitchItem"+$index+$value.id} data={$value}/>
                    )
                })}
            </div>
        );
    }
}

export interface UITabBarItem{
    id:string;
    alt?:string;
    label?:string | JSX.Element;
    desc?:string | JSX.Element;
    url?:string;
    icon?:object;
    subItems?:UITabBarItem[];
}


interface UITabBarItemRendererProps{
    data:UITabBarItem;
    selectedID?:string;
    isSubItem?:boolean;
    showDescOnHover?:boolean;
    onChange?:($id:string)=>void;
}

export class UITabBarItemRenderer extends React.Component<UITabBarItemRendererProps>{



    _onClick=()=>{
        if(this.props.onChange){
            this.props.onChange(this.props.data.id);
        }
    }

    render(){

        let strCN:string = "tabBarItem";
        if(this.props.isSubItem){
            strCN+=" isSubItem";
        }
        if(this.props.data.subItems && this.props.data.subItems.length>0){
            strCN+=" hasSubItems";
        }

        let jsxItemContents:JSX.Element = (
            <>
                {this.props.data.icon && (
                    <UIIcon icon={this.props.data.icon}/>
                )}
                {this.props.data.label && (
                    <div className="label">{this.props.data.label}</div>
                )}
                {this.props.showDescOnHover &&  this.props.data.desc && (
                    <div className="desc">{this.props.data.desc}</div>
                )}
            </>
        );

        let jsxItem:JSX.Element = <></>;
        let jsxChildren:JSX.Element = <></>;

        let extraProps:any = {};
        if(this.props.data.alt){
            extraProps.title = this.props.data.alt;
        }

        let isSelected:boolean = this.props.data.id===this.props.selectedID;


        if(this.props.data.url){

            let exact = false;
            if(!this.props.isSubItem){
                exact=true;
            }

            jsxItem = (
                <NavLink exact={exact} onClick={this._onClick} className={strCN} to={this.props.data.url}  activeClassName="selected" {...extraProps}>
                    {jsxItemContents}
                </NavLink>
            );
        }else{
            if(isSelected){
                strCN+=" selected";
            }
            jsxItem = (
                <div onClick={this._onClick} className={strCN} {...extraProps}>
                    {jsxItemContents}
                </div>
            );
        }

        if(this.props.data.subItems){
            jsxChildren = (
                <>
                    {this.props.data.subItems.map(($value, $index)=>{
                        return (
                            <UITabBarItemRenderer isSubItem={true} showDescOnHover={this.props.showDescOnHover} onChange={this.props.onChange} key={"tabSwitchItem"+$index+$value.id} data={$value}/>
                        )
                    })}
                </>
            );
        }


        return <>
            {jsxItem}
            {jsxChildren}
        </>;
    }
}


export interface IUITabBarContentContainerProps {
}

export class UITabBarContentContainer extends React.Component<IUITabBarContentContainerProps> {
    render() {
        return (
            <div className="tabBarContentContainer">
                {this.props.children}
            </div>
        );
    }
}
