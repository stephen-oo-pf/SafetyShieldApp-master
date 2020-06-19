import React from 'react';
import UIView from '../../../ui/UIView';
import './HomeView.scss';
import { listen, unlisten } from '../../../dispatcher/Dispatcher';

import { RouteComponentProps } from 'react-router-dom';
import OrgStatsWidget from './widget/OrgStatsWidget';
import User from '../../../data/User';
import UserRights, { hasUserRight } from '../../../data/UserRights';
import TitleUtil from '../../../util/TitleUtil';
import ECWidget from './widget/ECWidget';

import homeIcon from '@iconify/icons-mdi/home';
import AppData from '../../../data/AppData';
import EventsMapWidget from './widget/EventsMapWidget';
import EventsListWidget from './widget/EventsListWidget';
import AppEvent from '../../../event/AppEvent';

import UIAlertsBanner from '../../../ui/banner/UIAlertsBanner';
import NotifWidget from './widget/NotifWidget';
import OrgSelectorWidget from './widget/OrgSelectorWidget';
import DrillWidget from './widget/DrillWidget';

export interface IHomeViewProps extends RouteComponentProps {

}

export interface IHomeViewState {

}

export default class HomeView extends React.Component<IHomeViewProps, IHomeViewState> {

    static ID:string = "home";
    static PATH:string = "/dashboard";
    static ICON:object = homeIcon;



    constructor(props: IHomeViewProps) {
        super(props);

        this.state = {
        }
    }
    componentDidMount(){        
        User.setCheckIncidentReports(true);                
        TitleUtil.setPageTitle("Dashboard");
        listen(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);

    }
    componentWillUnmount(){
        User.setCheckIncidentReports(false);
        unlisten(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);
    }
    
    _onAlertsUpdate=()=>{
        this.forceUpdate();
    }

    render() {

        let showOrgStats:boolean=false;
        let showEventList:boolean=false;

        if(User.selectedOrg.isRootAdmin && User.selectedOrg.orgId===AppData.masterOrgID){
            if(hasUserRight(UserRights.WIDGET_ORG_SUMMARY,User.selectedOrg.userRights!)){
                showOrgStats=true;
            }
        }

        if(User.state.userOrgsHasIncidentControl && !User.state.userOrgsHasMasterOrg){
            showEventList=true;
        }else{
            //lets expand the map if no incident control
        }

        let showOrgSelector:boolean=false;
        let showNotifications:boolean=false;
        let showEC:boolean=false;
        let showDrills:boolean=false;

        
        
        if(User.selectedOrg.orgId!==AppData.masterOrgID){

            if(User.state.userOrgsFlat.length>1){
                showOrgSelector=true;
            }
            showNotifications=true;
            showEC=true;
        }

        if(User.selectedOrg.hasIncidentControl){
            showDrills=true;            
        }

        



        return (
            <UIView id={HomeView.ID} usePadding useScrollContainer>
                <UIAlertsBanner/>
                <div className="homeContent">
                    <div className="row rowA">
                        <div className="column columnB">
                            {showOrgStats && (
                                <OrgStatsWidget/>
                            )}
                            <EventsMapWidget/>

                        </div>
                        <div className="column columnA">
                            {showEventList && (
                                <EventsListWidget/>
                            )}

                        </div>
                    </div>
                    <div className="row rowB">
                        <div className="column columnA">
                            {showOrgSelector && (
                                <OrgSelectorWidget/>
                            )}
                            {showDrills && (
                                <DrillWidget/>
                            )}
                        </div>
                        <div className="column columnB">
                            {showEC && (
                                <ECWidget/>
                            )}
                            {showNotifications && (
                                <NotifWidget/>
                            )}
                        </div>
                    </div>
                </div>
            </UIView>
        );
    }
}
