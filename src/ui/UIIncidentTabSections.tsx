import * as React from 'react';
import './UIIncidentTabSections.scss';
import UITabBar, { UITabBarItem } from './UITabBar';
import UIWhiteBox from './UIWhiteBox';
import UITitle from './UITitle';
import UITimeline, { ITimelineItem } from './UITimeline';
import arrowDown from '@iconify/icons-mdi/arrow-down';
import UIIncidentChecklists from './UIIncidentChecklists';
import { IGetIncidentResponse } from '../data/IncidentData';
import UIIncidentReports from './UIIncidentReports';

export interface IUIIncidentTabSectionsProps {

    orgId:string;
    incidentResponse:IGetIncidentResponse;
    incidentTimelineData?:ITimelineItem[];
}

export interface IUIIncidentTabSectionsState {
    curViewSection:string;
}


export default class UIIncidentTabSections extends React.Component<IUIIncidentTabSectionsProps,IUIIncidentTabSectionsState> {

    static SECTION_TIMELINE:string = "incidentTimeline";
    static SECTION_CHECKLISTS:string = "incidentChecklists";
    static SECTION_REUNIFICATION:string = "incidentReunification";
    static SECTION_REPORTS:string = "incidentReports";

    _viewTabs:UITabBarItem[] = [
        {
            id:UIIncidentTabSections.SECTION_TIMELINE,
            label:"Timeline"
        },      
        {
            id:UIIncidentTabSections.SECTION_REPORTS,
            label:"Reports"
        },
        {
            id:UIIncidentTabSections.SECTION_CHECKLISTS,
            label:"Checklists"
        },/*
        {
            id:UIIncidentTabSections.SECTION_REUNIFICATION,
            label:"Reunification"
        },*/  
    ];


    constructor($props:IUIIncidentTabSectionsProps){
        super($props);


        let initViewSection:string = UIIncidentTabSections.SECTION_TIMELINE;

        this.state = {
            curViewSection:initViewSection
        }


    }
    _onTabChange=($id:string)=>{
        this.setState({curViewSection:$id});
    }

    render() {
        let strCN:string = "incidentTabSections";

        let jsxCurViewSection:JSX.Element = <></>;


        switch(this.state.curViewSection){
            case UIIncidentTabSections.SECTION_TIMELINE:
                jsxCurViewSection = (
                    <>
                        <UITitle extraClassName="timelineTitle" title="Recent Activity" smaller icon={arrowDown}/>
                        {this.props.incidentTimelineData && (
                            <UITimeline data={this.props.incidentTimelineData}/>
                        )}
                    </>
                );
            break;
            case UIIncidentTabSections.SECTION_CHECKLISTS:
                jsxCurViewSection = (
                    <UIIncidentChecklists orgId={this.props.orgId} incident={this.props.incidentResponse.incident} checklists={this.props.incidentResponse.checklists}/>
                );
            break;
            case UIIncidentTabSections.SECTION_REPORTS:
                jsxCurViewSection = (
                    <UIIncidentReports incident={this.props.incidentResponse.incident} reports={this.props.incidentResponse.reports}/>
                );
            break;
            case UIIncidentTabSections.SECTION_REUNIFICATION:
                jsxCurViewSection = (
                    <>
                    Reunification
                    </>
                );
            break;
        }

        return (                       
            <UIWhiteBox noPadding extraClassName={strCN}>
                <UITabBar data={this._viewTabs} onChange={this._onTabChange} selectedID={this.state.curViewSection} horizontal/>
                <div className="curViewSectionContainer">
                    {jsxCurViewSection}
                </div>
            </UIWhiteBox>
        );
    }
}
