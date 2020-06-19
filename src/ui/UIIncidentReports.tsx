import * as React from 'react';
import UITable, { ITableColumn } from './UITable';
import UIIncidentTableFrame from './UIIncidentTableFrame';
import UITitle from './UITitle';

import './UIIncidentReports.scss';

import { UIMasterFrameFilterSystem } from './UIMasterFrame';
import { IIncidentReportData, IIncidentData } from '../data/IncidentData';
import FormatUtil from '../util/FormatUtil';
import UICommentBox from './UICommentBox';
import { FilterTagGroup, createOpsRolesTagGroup, createBlankFilterTagGroups } from '../overlay/FilterOverlay';
import NextFrame from '../util/NextFrame';
import { dispatch } from '../dispatcher/Dispatcher';
import AppEvent from '../event/AppEvent';
import UINoData from './UINoData';

export interface IUIIncidentReportsProps {
    incident:IIncidentData;
    reports?:IIncidentReportData[];
}

export interface IUIIncidentReportsState{

    selectedFilterTags:FilterTagGroup[];
}

export default class UIIncidentReports extends React.Component<IUIIncidentReportsProps,IUIIncidentReportsState> {

    constructor($props:IUIIncidentReportsProps){
        super($props);
        this.state = {
            selectedFilterTags:createBlankFilterTagGroups(this._filterTags)

        }
    }

    _filterTags:FilterTagGroup[] = [
        createOpsRolesTagGroup("opsRole")
    ];

    _onFilterTagsChanged=($selectedTags:FilterTagGroup[])=>{
        this.setState({selectedFilterTags:$selectedTags},()=>{
            NextFrame(()=>{
                dispatch(new AppEvent(AppEvent.ABOVE_HEIGHT_CHANGE));
            });
        });
    }
    render() {

        let reports:IIncidentReportData[] = [];
        if(this.props.reports){

            
            let doesAnyGroupHaveTags = this.state.selectedFilterTags.some(($group)=>{
                return $group.tags.length>0;
            });

            reports = this.props.reports.filter(($report)=>{

                //Filter Tags
                let filterTagsOk:boolean=true;
                let countFilterTagOk:number=0;
                if(doesAnyGroupHaveTags){
                    filterTagsOk=false;
                    this.state.selectedFilterTags.forEach(($group)=>{
                        let groupOk:boolean=true;

                        if($group.tags.length>0){
                            groupOk=false;
                        }

                        switch($group.property){
                            
                            case "opsRole":
                                $group.tags.forEach(($tag)=>{
                                    if($report.opsRole===$tag){
                                        groupOk=true;
                                    }
                                });
                            break;
                        }
                        if(groupOk){
                            countFilterTagOk++;
                        }
                    });

                    if(countFilterTagOk===this.state.selectedFilterTags.length){
                        filterTagsOk=true;
                    }
                }

                return filterTagsOk;
            })



        }

        let title:string = reports.length+" Events Reported";

        let columns:ITableColumn[] = [
            {
                name:"Time Reported",
                dataKey:"date",
                width:250,
                dataGetter:($data:IIncidentReportData)=>{
                    let date:Date = new Date(Number($data.createDts)*1000);

                    return FormatUtil.dateMDY(date,true,false,false,true)+" - "+FormatUtil.dateHMS(date,true,false,true);
                }
            },
            {
                name:"User",
                dataKey:"userName",
                width:300,
                dataGetter:($data:IIncidentReportData)=>{    
                             
                    return (
                        <>
                            {$data.createUserName}
                            <div className="opsRole">
                                {$data.opsRole}
                            </div>
                        </>
                    );
                }
            },
            {
                name:"Comments",
                dataKey:"description",
                width:300,
                flexGrow:1,
                dataGetter:($data:IIncidentReportData)=>{
                    if(!$data.description){
                        return "";
                    }
                    return <UICommentBox comment={$data.description}/>
                }

            },
        ];


        return (
            <UIIncidentTableFrame
                extraClassName="incidentReports"   
                header={(
                    <>
                        <div className="incidentTableFrameHeaderTitle">
                            <UITitle title={title}/>
                            <p>For {this.props.incident.orgName}</p>
                        </div>
                    </>
                )}
                belowHeaderContent={(
                    <UIMasterFrameFilterSystem 
                                filterTags={this._filterTags} 
                                filterTagsSelected={this.state.selectedFilterTags} 
                                onFilterTagsChanged={this._onFilterTagsChanged} 
                    />
                )}
            >

                <UITable
                    headerH={56}
                    rowH={60}
                    columns={columns}
                    data={reports}
                    rowRenderer={($data:any, $columns:JSX.Element, $className:string, $key:string)=>{
                        return (
                            <div className={$className} key={$key}>
                                {$columns}
                            </div>
                        )
                    }}
                />
                
                {reports.length===0 && (
                    <UINoData filterTags={this.state.selectedFilterTags}/>
                )}
            </UIIncidentTableFrame>
        );
    }
}
