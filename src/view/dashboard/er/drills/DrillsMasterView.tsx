import * as React from 'react';
import { RouteComponentProps, NavLink } from 'react-router-dom';
import UIView from '../../../../ui/UIView';
import UIMasterFrame, { UIMasterFrameFilterSystem } from '../../../../ui/UIMasterFrame';
import DrillsView from './DrillsView';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';
import './DrillsMasterView.scss';

import calendarToday from '@iconify/icons-mdi/calendar-today';
import User, { IResultNotification } from '../../../../data/User';
import UIWhiteBox from '../../../../ui/UIWhiteBox';
import UIWindowTable, { UIWindowTableHeaderRenderer } from '../../../../ui/UIWindowTable';
import { TableRowProps, Column, TableCellDataGetterParams, SortDirectionType } from 'react-virtualized';
import Api, { IErrorType } from '../../../../api/Api';
import { IDrillData, createDrillDetailPath, getStatusFromDrillData } from '../../../../data/DrillData';
import UILoadingBox from '../../../../ui/UILoadingBox';
import UIErrorBox from '../../../../ui/UIErrorBox';
import UINoData from '../../../../ui/UINoData';
import FormatUtil from '../../../../util/FormatUtil';
import { getIncidentTypeById } from '../../../../data/IncidentData';
import UIIncidentTypeIcon from '../../../../ui/UIIncidentTypeIcon';
import { UIEditButton } from '../../../../ui/UIButton';
import UITitle from '../../../../ui/UITitle';
import UIDrillStatusIcon from './UIDrillStatusIcon';

import UIDrillCalendar from './UIDrillCalendar';
import FilterOverlay, { FilterTagGroup, createBlankFilterTagGroups } from '../../../../overlay/FilterOverlay';
import NextFrame from '../../../../util/NextFrame';
import { dispatch } from '../../../../dispatcher/Dispatcher';
import AppEvent from '../../../../event/AppEvent';
import UIDrillCircleGraph from './UIDrillCircleGraph';

export interface IDrillsMasterViewProps extends RouteComponentProps{
}

export interface IDrillsMasterViewState {
    resultNotification?:IResultNotification;
    loading:boolean;
    data?:IDrillData[];
    error?:IErrorType;
    selectedFilterTags:FilterTagGroup[];
}

export default class DrillsMasterView extends React.Component<IDrillsMasterViewProps, IDrillsMasterViewState> {

    static DATE_FILTER_TAG_OPTIONS = [
        {
            label:"Today",
            dateStart:FormatUtil.getDate_TodayStart,
            dateEnd:FormatUtil.getDate_TodayEnd
        },
        {
            label:"This Week",
            dateStart:FormatUtil.getDate_WeekStart,
            dateEnd:FormatUtil.getDate_WeekEnd,
        },
        {
            label:"Last Week",
            dateStart:FormatUtil.getDate_LastWeekStart,
            dateEnd:FormatUtil.getDate_LastWeekEnd,
        },
        {
            label:"This Month",
            dateStart:FormatUtil.getDate_MonthStart,
            dateEnd:FormatUtil.getDate_MonthEnd,
        },
        {
            label:"Last Month",
            dateStart:FormatUtil.getDate_LastMonthStart,
            dateEnd:FormatUtil.getDate_LastWeekEnd,
        },
    ];

    view:React.RefObject<UIView> = React.createRef();



    _filterTags:FilterTagGroup[] = [
        
        {
            property:"date",
            label:"Date",
            tags:DrillsMasterView.DATE_FILTER_TAG_OPTIONS.map(($option)=>{
                return $option.label;
            }),
            displayAs:FilterOverlay.DISPLAY_AS_DROP_DOWN
        },
        {
            property:"orgName",
            label:"Organizations",
            tags:User.state.userOrgsFlat.map(($org)=>{
                return $org.orgName;
            })
        },
        {
            property:"incidentType",
            label:"Event Type",
            tags:User.state.allIncidentTypes.map(($type)=>{
                return $type.incidentType;
            }),
            displayAs:FilterOverlay.DISPLAY_AS_INCIDENT_TYPES
        },
        {
            property:"status",
            label:"Status",
            tags:[
                UIDrillStatusIcon.getStatusCodeLabel(UIDrillStatusIcon.STATUS_CODE_COMPLETED),
                UIDrillStatusIcon.getStatusCodeLabel(UIDrillStatusIcon.STATUS_CODE_NOT_STARTED),
                UIDrillStatusIcon.getStatusCodeLabel(UIDrillStatusIcon.STATUS_CODE_STARTED),
            ],
        },
    ];

    constructor(props: IDrillsMasterViewProps) {
        super(props);

        this.state = {
            loading:false,
            selectedFilterTags:createBlankFilterTagGroups(this._filterTags)
        }
    }
    
    componentDidMount(){
        
        this._loadData();
    }
    _loadData=()=>{

        this.setState({
            error:undefined,
            loading:true,
        },()=>{
            Api.calendarManager.getList(($success:boolean,$results:any)=>{
                if($success){
                    this.setState({loading:false, data:$results});


                    User.checkResultNotification("drills",($notif)=>{
                        this.setState({resultNotification:$notif});
                    });

                }else{
                    this.setState({loading:false, error:$results});
                }
            });
        });
    }

    _onClearResultNotification=()=>{
        this.setState({resultNotification:undefined});
    }

    getContainer=()=>{
       let container:HTMLDivElement | null = null;       
       if(this.view.current){
           let scroller = this.view.current.getScrollContainer();
           if(scroller){
               container = scroller.container.current;
           }
       }
       return container;
   }


   _calendarTileContent=()=>{

   }

   _sort=($sortBy:string, $direction:SortDirectionType, $a:IDrillData, $b:IDrillData):number=>{
        let numRet:number;

        let strA:string = "";
        let strB:string = "";
    
        switch($sortBy){
            case "entryDts":
                
                strA = ""+$a.entryDts;
                strB = ""+$b.entryDts;

            break;
            case "incidentType":
                
                strA = ""+$a.entryDetails.incidentTypeId;
                strB = ""+$b.entryDetails.incidentTypeId;

            break;
            case "status":
                strA = UIDrillStatusIcon.getStatusCodeLabel(getStatusFromDrillData($a));
                strB = UIDrillStatusIcon.getStatusCodeLabel(getStatusFromDrillData($b));

            break;
            default:
                strA = $a[$sortBy];
                strB = $b[$sortBy];
        }

        numRet = UIWindowTable.BASIC_SORT($direction,strA,strB);

        return numRet;
    }
    
    _onFilterTagsChanged=($selectedTags:FilterTagGroup[])=>{
        this.setState({selectedFilterTags:$selectedTags},()=>{
            NextFrame(()=>{
                dispatch(new AppEvent(AppEvent.ABOVE_HEIGHT_CHANGE));
            });
        });
    }


    render() {


        let jsxContent:JSX.Element = <></>;

        
        if(this.state.loading){
            jsxContent = (
                <UILoadingBox/>
            );
        }else{
            if(this.state.error){
                jsxContent = (
                    <UIErrorBox error={"Error Loading Drills"}/>
                );
            }else{

                if(this.state.data?.length===0){
                    jsxContent = (
                        <UINoData/>
                    );
                }

            }
        }


        let arrData:IDrillData[] = [];
        

        let selectedDates:Date[] | undefined = undefined;
        if(this.state.data){
            

            let doesAnyGroupHaveTags = this.state.selectedFilterTags.some(($group)=>{
                return $group.tags.length>0;
            });

            arrData = this.state.data.filter(($drill)=>{


                let drillIncidentType = getIncidentTypeById($drill.entryDetails.incidentTypeId);

                let drillStatus:string = UIDrillStatusIcon.getStatusCodeLabel(getStatusFromDrillData($drill));


                let drillDateValue:number = new Date(Number($drill.entryDts)*1000).valueOf();

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
                            case "incidentType":
                                $group.tags.forEach(($tag)=>{
                                    if(drillIncidentType?.incidentType===$tag){
                                        groupOk=true;
                                    }
                                });
                            break;
                            case "status":
                                $group.tags.forEach(($tag)=>{
                                    if(drillStatus===$tag){
                                        groupOk=true;
                                    }
                                });
                            break;
                            case "orgName":
                                $group.tags.forEach(($tag)=>{
                                    if($drill.orgName===$tag){
                                        groupOk=true;
                                    }
                                });
                            break;
                            case "date":
                                $group.tags.forEach(($tag)=>{

                                    let match = DrillsMasterView.DATE_FILTER_TAG_OPTIONS.find(($option)=>{
                                        let isMatch:boolean=false;
                                        if($option.label===$tag){
                                            if(drillDateValue>=$option.dateStart().valueOf() && drillDateValue<=$option.dateEnd().valueOf()){
                                                isMatch=true;
                                            }
                                        }
                                        return isMatch;
                                    });

                                    if(match){
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

        

        /*

        we need to sort the data!!!!

        data.sort(($dateA,$dateB)=>{
            let a = $dateA.valueOf();
            let b = $dateB.valueOf();
            if(a===b){
                return 0
            }else if(a>b){
                return 1;
            }else{
                return -1;
            }
        });

        */



        return (
            <UIView ref={this.view} id="drillsMaster" usePadding useScrollContainer>
                
                <UIMasterFrame
                    baseTitle="Drills"
                    baseIcon={DrillsView.ICON}
                    basePath={DrillsView.PATH}
                    addBtn={{label:"Schedule a Drill", icon:calendarToday,  path:DrillsView.PATH+MasterDetailSwitch.PATH_NEW}}
                    resultNotification={this.state.resultNotification}
                    onClearResultNotification={this._onClearResultNotification}
                >

                    <UIWhiteBox>
                        {this.state.data && (
                            <>
                            
                                <div className="drillsUpperSection">
                                    <div className="calendarContainer">
                                        <UITitle title="DRILL CALENDAR"/>
                                        <UIDrillCalendar data={this.state.data}/>
                                    </div>
                                    <div className="completedThisYear">
                                        <UITitle title="COMPLETED THIS YEAR"/>
                                        <UIDrillCircleGraph data={this.state.data}/>
                                    </div>
                                </div>
                                <UITitle title="ALL DRILLS"/>
                                <p style={{marginTop:"6px", marginBottom:"10px"}} className="small">For {User.selectedOrg.orgName}</p>
                                <UIMasterFrameFilterSystem 
                                    filterTags={this._filterTags} 
                                    filterTagsSelected={this.state.selectedFilterTags} 
                                    onFilterTagsChanged={this._onFilterTagsChanged} 
                                />

                                <UIWindowTable
                                    data={arrData}
                                    headerH={58}
                                    initSortBy={"entryDts"}
                                    sort={this._sort}
                                    rowH={60}
                                    rowRenderer={($props:TableRowProps)=>{
                                        let data = $props.rowData as IDrillData;
                                        let detailPath:string = createDrillDetailPath(data);
                    
                                        

                                        return (
                                            <div key={$props.key} className={$props.className} style={$props.style}>
                                                <NavLink to={detailPath}/>
                                                {$props.columns}
                                            </div>
                                        )
                                    }}
                                    scrollElement={this.getContainer()!}
                                >
                                    
                                <Column
                                    width={100}
                                    label="Date"
                                    className="date"
                                    dataKey="entryDts"
                                    headerRenderer={UIWindowTableHeaderRenderer}
                                    flexGrow={1}    
                                    cellDataGetter={($value:TableCellDataGetterParams)=>{
                                        let data:IDrillData = $value.rowData
                                        let ms:number = 0;
                                        if(data.entryDts){
                                            ms = data.entryDts;
                                        }
                                        let date:Date = new Date(ms*1000)
                                        
                                        return FormatUtil.dateMDY(date,true,false,false,true) +" "+FormatUtil.dateHMS(date,true,false,true);
                                    }}           
                                />  
                                <Column
                                    width={150}
                                    label="Organization"
                                    className="orgName"
                                    dataKey="orgName"
                                    headerRenderer={UIWindowTableHeaderRenderer}
                                    flexGrow={1}              
                                />      

                                <Column
                                    width={55}
                                    label="Event Type"
                                    className="incidentType"
                                    dataKey="incidentType"
                                    headerRenderer={UIWindowTableHeaderRenderer}
                                    flexGrow={1}  
                                    cellRenderer={($value:TableCellDataGetterParams)=>{ 
                                        let data = $value.rowData as IDrillData;
                
                                        let incidentType = getIncidentTypeById(data.entryDetails.incidentTypeId);
                
                                        if(!incidentType){
                                            return "";
                                        }
                                        let path:string = createDrillDetailPath(data);

                                        

                
                                        return (
                                            <NavLink title={incidentType.incidentType} to={path}>
                                                <UIIncidentTypeIcon type={incidentType}/>
                                            </NavLink>
                                        )
                                    }}               
                                />   
                                
                                <Column
                                    width={100}
                                    label="Status"
                                    className="status"
                                    dataKey="status"
                                    headerRenderer={UIWindowTableHeaderRenderer}
                                    flexGrow={1}  
                                    cellRenderer={($value:TableCellDataGetterParams)=>{ 
                                        let data = $value.rowData as IDrillData;
                
                                        let status:string = getStatusFromDrillData(data);


                                        return (
                                            <UIDrillStatusIcon status={status}/>
                                        )
                                    }}               
                                />   
                                
                                <Column
                                    dataKey="actions"
                                    width={76}
                                    flexShrink={0}
                                    className="actions"
                                    disableSort={true}
                                    headerRenderer={UIWindowTableHeaderRenderer}
                                    cellRenderer={($value:TableCellDataGetterParams)=>{                                
                                        let data = $value.rowData as IDrillData;
                                    

                                        let jsx:JSX.Element = <></>;

                                        let editPath:string = createDrillDetailPath(data)+MasterDetailSwitch.PATH_EDIT;

                                        

                                        let canEdit:boolean = User.selectedOrg.rgDrills.canEdit && data.orgId===User.selectedOrg.orgId;
                                        if(data.started){
                                            canEdit=false;
                                        }else{
                                            let drillDate = new Date(Number(data.entryDts)*1000);

                                            let now:Date = new Date();
                                            let todayDate = new Date(now.getFullYear(),now.getMonth(),now.getDate());

                                            if(drillDate.valueOf()<=now.valueOf()){
                                                canEdit=false;
                                            }
                                        }

                                        if(canEdit){
                                            jsx = <UIEditButton path={editPath} isSquare/>;
                                        }
                                        return (
                                            <>
                                                {jsx}
                                            </>
                                        )
                                    }}
                                />    

                                </UIWindowTable>
                            </>
                        )}
                        {jsxContent}
                    </UIWhiteBox>
                </UIMasterFrame>
            </UIView>
        );
    }
}




