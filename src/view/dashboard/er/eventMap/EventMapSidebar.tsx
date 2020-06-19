import * as React from 'react';
import UITitle from '../../../../ui/UITitle';
import UITabBar, { UITabBarItem } from '../../../../ui/UITabBar';
import './EventMapSidebar.scss';
import cogIcon from '@iconify/icons-mdi/cog';

import formatListBulleted from '@iconify/icons-mdi/format-list-bulleted';
import UIScrollContainer from '../../../../ui/UIScrollContainer';
import EventMapList from './EventMapList';
import EventMapSettings from './EventMapSettings';
import User from '../../../../data/User';
import UILoadingBox from '../../../../ui/UILoadingBox';


export interface IEventMapSidebarProps {
    initLoading:boolean;
}

export interface IEventMapSidebarState {
    curSection:string;
}

export default class EventMapSidebar extends React.Component<IEventMapSidebarProps, IEventMapSidebarState> {

    static SECTION_LIST:string =        "eventMapList";
    static SECTION_SETTINGS:string =    "eventMapSettings";

    _tabList:UITabBarItem =         {id:EventMapSidebar.SECTION_LIST,       label:"List", icon:formatListBulleted};
    _tabSettings:UITabBarItem =     {id:EventMapSidebar.SECTION_SETTINGS,   label:"Settings", icon:cogIcon};

    _tabs:UITabBarItem[] = [];

    constructor(props: IEventMapSidebarProps) {
        super(props);

        this.state = {
            curSection:EventMapSidebar.SECTION_LIST
        }

        this._tabs.push(this._tabList);
        this._tabs.push(this._tabSettings);

    }
    _onTabChange=($id:string)=>{
        this.setState({curSection:$id});
    }

    render() {
        let  strCN:string = "eventMapSidebar";
        
        let jsxContent:JSX.Element = <></>;

        switch(this.state.curSection){
            case EventMapSidebar.SECTION_LIST:
                jsxContent = (
                    <EventMapList/>
                );
            break;
            case EventMapSidebar.SECTION_SETTINGS:
                jsxContent = (
                    <EventMapSettings/>
                );
            break;
        }

        this._tabList.label = "List ("+User.state.mapIncidents.length+")";

        /*
        <UITabBar data={this._tabs} selectedID={this.state.curSection} onChange={this._onTabChange} horizontal/>
        */
        return (
            <div className={strCN}>
                <div className="eventMapSidebarInside">
                    <div className="sidebarHeader">
                        <UITitle title="Event Map"/>
                    </div>
                    <div className="sidebarContent">
                        {this.props.initLoading && (
                            <UILoadingBox fullHeight/>
                        )}
                        {!this.props.initLoading && (
                            <>
                                {jsxContent}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
