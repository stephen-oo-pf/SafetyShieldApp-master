import React from 'react';
import './DashboardSidebar.scss';
import User from '../../data/User';
import UISwitchAccount from '../../ui/UISwitchAccount';
import UITabBar, { UITabBarItem, UITabBarItemRenderer } from '../../ui/UITabBar';
import accountCircle from '@iconify/icons-mdi/account-circle';
import logoutIcon from '@iconify/icons-mdi/logout';
import DashboardView from './DashboardView';
import MyAccountView from './myaccount/MyAccountView';
import { listen, unlisten } from '../../dispatcher/Dispatcher';
import AppEvent from '../../event/AppEvent';



export interface IDashboardSidebarProps {
    onLogout:()=>void;
    onToggleExpand:()=>void;
    tabs:UITabBarItem[];
}

export default class DashboardSidebar extends React.Component<IDashboardSidebarProps> {


    componentDidMount(){
        listen(AppEvent.VALIDATED_TOKEN,this._onValidatedToken);
    }

    componentWillUnmount(){
        unlisten(AppEvent.VALIDATED_TOKEN,this._onValidatedToken);
    }
    _onValidatedToken=()=>{
        this.forceUpdate();

    }

    _onClickLogout=($id:string)=>{
        this.props.onLogout();
    }

    _onTabBarChangeWhenExpanded=()=>{
        this.props.onToggleExpand();
    }

    render() {
        let strCN:string = "dashboardSidebar";
        

        let extraTabBarProps:any = {};

        
        let showDescOnHover:boolean=false;
        if(User.state.isDashboardExpanded){
            strCN+=" expanded";
            showDescOnHover=true;
            extraTabBarProps.onChange = this._onTabBarChangeWhenExpanded;
        }

        let accountLblName:string = "";
        let accountLbl:string | JSX.Element = "";
        if(User.state.userInfo){
            accountLblName = User.state.userInfo.firstName+" "+User.state.userInfo.lastName;
            if(User.selectedOrg.secRole && User.selectedOrg.opsRole){
                
                /*
                
                        <div className="opsrole">{User.selectedOrg.opsRole.opsRole}</div>
                */
                accountLbl = (
                    <>
                        <div className="name">{accountLblName}</div>
                        <div className="secrole">{User.selectedOrg.secRole.secRole}</div>
                    </>
                );
            }
        }


        return (
            <div className={strCN} style={{transition:DashboardView.EXPAND_TRANS_CSS}}>
                <div className="sidebarHeader">
                    <UISwitchAccount/>
                </div>
                <div className="sidebarContent">
                    <UITabBar
                        {...extraTabBarProps}
                        showDescOnHover={showDescOnHover}
                        data={this.props.tabs}
                    />                    
                </div>
                <div className="sidebarFooter">
                    <UITabBarItemRenderer showDescOnHover={showDescOnHover} data={{alt:accountLblName, icon:accountCircle, id:"myAccount", url:MyAccountView.PATH, label:accountLbl, desc:"My Account"}} />
                    <UITabBarItemRenderer onChange={this._onClickLogout} showDescOnHover={showDescOnHover} data={{alt:"Logout", icon:logoutIcon, id:"logout", label:"Logout", desc:"Logout"}} />
                </div>
            </div>
        );
    }
}
