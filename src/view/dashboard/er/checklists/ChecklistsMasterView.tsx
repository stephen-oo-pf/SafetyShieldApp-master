import React from 'react';
import UIView from '../../../../ui/UIView';
import ChecklistsView from './ChecklistsView';

import plusIcon from '@iconify/icons-mdi/plus';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';
import UIMasterFrame from '../../../../ui/UIMasterFrame';
import { RouteComponentProps, NavLink } from 'react-router-dom';
import Api, { IErrorType } from '../../../../api/Api';
import User, { IResultNotification } from '../../../../data/User';
import ChecklistData, { IChecklistData } from '../../../../data/ChecklistData';

import UINoData from '../../../../ui/UINoData';
import UIWindowTable, { UIWindowTableHeaderRenderer } from '../../../../ui/UIWindowTable';
import { TableRowProps, SortDirectionType, Column, TableCellDataGetterParams, SortIndicator } from 'react-virtualized';
import UIWhiteBox from '../../../../ui/UIWhiteBox';
import UILoadingBox from '../../../../ui/UILoadingBox';
import { UIEditButton } from '../../../../ui/UIButton';

import UITabBar, { UITabBarItem } from '../../../../ui/UITabBar';

import UIIncidentTypeIcon from '../../../../ui/UIIncidentTypeIcon';
import UIErrorBox from '../../../../ui/UIErrorBox';
import TimerUtil from '../../../../util/TimerUtil';
import { FilterTagGroup, createBlankFilterTagGroups } from '../../../../overlay/FilterOverlay';
import NextFrame from '../../../../util/NextFrame';
import { dispatch } from '../../../../dispatcher/Dispatcher';
import AppEvent from '../../../../event/AppEvent';

export interface IChecklistsMasterViewProps extends RouteComponentProps{
    
}

export interface IChecklistsMasterViewState {
    filter:string;
    inputFilter:string;
    selectedFilterTags:FilterTagGroup[];
    loading:boolean;
    error?:IErrorType;
    selectedTab:string;
    dataAll:ChecklistData[];
    dataUser:ChecklistData[];
    resultNotification?:IResultNotification;
}

export default class ChecklistsMasterView extends React.Component<IChecklistsMasterViewProps, IChecklistsMasterViewState> {

    _isUnmounting:boolean=false;
    view:React.RefObject<UIView> = React.createRef();

    static TAB_ALL:string = "checklistsAll";
    static TAB_USER:string = "checklistsUser";


    //the tab labels are assigned upon load complete
    _tabs:UITabBarItem[] = [];

    _tabAll = {id:ChecklistsMasterView.TAB_ALL,label:""};
    _tabUser = {id:ChecklistsMasterView.TAB_USER,label:""};

    _canViewUser:boolean=false;
    _canViewAll:boolean=false;


    _filterTags:FilterTagGroup[] = [
        {
            property:"incidentTypeId",
            label:"Event Type",
            tags:User.state.allIncidentTypes.map(($type)=>{
                return $type.incidentType;
            }),
        }
    ];

    constructor(props: IChecklistsMasterViewProps) {
        super(props);

        this.state = {
            filter:"",
            inputFilter:"",
            loading:true,
            dataAll:[],
            dataUser:[],
            selectedTab:"",
            selectedFilterTags:createBlankFilterTagGroups(this._filterTags)
        }
    }

    componentDidMount(){

        let startingTab:string = "";

        
        
        this._canViewAll =  User.selectedOrg.rgChecklists.canView;
        if(this._canViewAll){
            this._tabs.push(this._tabAll);

            if(startingTab===""){
                startingTab=ChecklistsMasterView.TAB_ALL;
            }
        }

        this._canViewUser =  User.selectedOrg.rgMyChecklists.canView;
        if(this._canViewUser){
            this._tabs.push(this._tabUser);
            if(startingTab===""){
                startingTab=ChecklistsMasterView.TAB_USER;
            }
        }

        

        this.setState({selectedTab:startingTab});

        this._loadData();
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

    _loadData=()=>{
 

        this.setState({
            error:undefined,
            dataAll:[],
            dataUser:[],
            loading:true,
        },()=>{

            let countDone:number=0;
            let countMax:number=0;

            const tryDone=()=>{
                if(!this._isUnmounting){    
                    //if all done
                    if(countDone===countMax){
                        this.setState({loading:false});


                        User.checkResultNotification("checklist",($notif)=>{
                            this.setState({resultNotification:$notif});
                        });



                    }
                }
            }
    
            if(this._canViewUser){
                countMax++;   
                
                Api.checklistManager.getUserChecklists(($success:boolean, $results:any)=>{
                    if($success){
        
                        //convert raw to class form
                        let arrData:ChecklistData[] = ($results as IChecklistData).map(($value:IChecklistData)=>{
                            let data:ChecklistData = new ChecklistData();
                            data.populate($value);
                            return data;
                        });
        
                        if(!this._isUnmounting){
                            this.setState({dataUser:arrData});
                            countDone++;
                            tryDone();
                        }
        
                    }else{
                        if(!this._isUnmounting){
                            this.setState({error:$results, loading:false});
                        } 
                    }
                });
        
                
            }
    
    
            if(this._canViewAll){
                countMax++;
                
    
                Api.checklistManager.getChecklists(($success:boolean, $results:any)=>{
                    if($success){
        
                        //convert raw to class form
                        let arrData:ChecklistData[] = ($results as IChecklistData).map(($value:IChecklistData)=>{
                            let data:ChecklistData = new ChecklistData();
                            data.populate($value);
                            return data;
                        });
        
                        if(!this._isUnmounting){
                            this.setState({dataAll:arrData});


                            countDone++;
                            tryDone();

                        }
        
                    }else{
                        if(!this._isUnmounting){
                            this.setState({error:$results, loading:false});
                        } 
                    }
                });
            }  


        });

        
 
    }




    _sort=($sortBy:string, $direction:SortDirectionType, $a:ChecklistData, $b:ChecklistData):number=>{
        let numRet:number;

        let strA:string = "";
        let strB:string = "";
       
        switch($sortBy){
            case "incidentType":
                strA = $a.firstIncidentTypeId;
                strB = $b.firstIncidentTypeId;

            break;
            default:
                strA = $a[$sortBy];
                strB = $b[$sortBy];
        }

        numRet = UIWindowTable.BASIC_SORT($direction,strA,strB);

        return numRet;
    }
    
    _onFilterChange=($value:string)=>{
        TimerUtil.debounce("checklistFilter",()=>{

            this.setState({filter:$value});
            
        },UIMasterFrame.FILTER_DEBOUNCE_SPEED_MS);
        this.setState({inputFilter:$value});
    }
    _onTabChange=($id:string)=>{
        this.setState({selectedTab:$id});
    }
    _onClearResultNotification=()=>{
        this.setState({resultNotification:undefined});
    }

    _onFilterTagsChanged=($selectedTags:FilterTagGroup[])=>{
        this.setState({selectedFilterTags:$selectedTags},()=>{
            NextFrame(()=>{
                dispatch(new AppEvent(AppEvent.ABOVE_HEIGHT_CHANGE));
            });
        });
    }

    render() {
        
        const applyFilter = ($data:ChecklistData[])=>{

            

            let doesAnyGroupHaveTags = this.state.selectedFilterTags.some(($group)=>{
                return $group.tags.length>0;
            });

            let arrFilters:string[] = this.state.filter.toLowerCase().split(" ");//filtering by each word
            //apply possible filters
            return $data.filter(($checklist:ChecklistData, $checklistIndex:number)=>{


                //manual search filter
                let manualOk:boolean=false;
                let countOk:number=0;
                arrFilters.forEach(($filter:string)=>{
                    let isOk:boolean=false;
                    if($filter==="") isOk = true;      
                    
                    if($checklist.name.toLowerCase().indexOf($filter)!==-1) isOk=true;
                   /* 
                   if($value.firstOpRoleName!==""){
                        if($value.firstOpRoleName.toLowerCase().indexOf($filter)!==-1) isOk=true;
                    }
                    if($value.firstIncidentType?.incidentType.toLowerCase().indexOf($filter)!==-1) isOk=true;
                   */

                    if(isOk) countOk++;                
                });
                manualOk = countOk===arrFilters.length;




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
                            case "incidentTypeId":
                                $group.tags.forEach(($tag)=>{
                                    if($checklist?.firstIncidentType?.incidentType===$tag){
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



                return manualOk && filterTagsOk;
            });
        }


        let canCreate = User.selectedOrg.rgChecklists.canAdd;
        let canEdit = User.selectedOrg.rgChecklists.canEdit;


        let middleBox:JSX.Element = <></>;
        let arrData:ChecklistData[] = [];
        let arrUserData:ChecklistData[] = [];
        if(this._canViewUser){
            arrUserData = applyFilter(this.state.dataUser);
            this._tabUser.label = "Assigned to me ("+arrUserData.length+")";
        }
        
        let arrAllData:ChecklistData[] = [];
        if(this._canViewAll){
            arrAllData = applyFilter(this.state.dataAll);
            this._tabAll.label = "All ("+arrAllData.length+")";
        }
        

        let strNoDataFilterMsg:string = "";
        
        let addBtn;
        

        let jsxOpsRoleColumn:JSX.Element | null = null;
        let jsxLastCompletedColumn:JSX.Element | null = null;
        let isUserChecklist:boolean=false;

        switch(this.state.selectedTab){
            case ChecklistsMasterView.TAB_USER:
                arrData = arrUserData;
                jsxLastCompletedColumn = (
                    <Column
                        width={150}
                        label="Last Completed"
                        className="lastCompleted"
                        dataKey="lastCompleted"
                        headerRenderer={UIWindowTableHeaderRenderer}
                        flexGrow={1}               
                    />   
                );
                isUserChecklist=true;
            break;
            case ChecklistsMasterView.TAB_ALL:
                arrData = arrAllData;

                jsxOpsRoleColumn = (
                    <Column
                        width={200}
                        label="Operational Role"
                        className="firstOpRoleName"
                        dataKey="firstOpRoleName"
                        headerRenderer={UIWindowTableHeaderRenderer}
                        flexGrow={1}               
                    />
                );

                
                if(canCreate){
                    addBtn = {label:"Add New Checklist", icon:plusIcon, path:ChecklistsView.PATH+MasterDetailSwitch.PATH_NEW};
                }
            break;
        }





        let jsxContent:JSX.Element = <></>;

        if(this.state.loading){
            middleBox = (
                <UILoadingBox/>
            );
        }else{
            if(this.state.error){
                middleBox = (
                    <UIErrorBox error={"Error Loading Checklists"}/>
                );
            }else{
                if(arrData.length===0){
                    middleBox = (
                        <UINoData  filter={this.state.filter} filterTags={this.state.selectedFilterTags}/>
                    );
                }
            }
        }

        let numHeaderH:number = 60;
        let numRowH:number = 60;



        jsxContent = (
            <UIWindowTable
                scrollElement={this.getContainer()!}
                data={arrData}
                headerH={numHeaderH}
                rowH={numRowH}
                sort={this._sort}
                initSortBy={"name"}
                rowRenderer={($props:TableRowProps)=>{
                    let data = $props.rowData as ChecklistData;

                    let detailPath:string = "";

                    if(isUserChecklist){
                        detailPath = ChecklistsView.PATH_USER+"/"+data.checklistId;
                    }else{
                        detailPath = ChecklistsView.PATH+"/"+data.checklistId;
                    }

                    return (
                        <div key={$props.key} className={$props.className} style={$props.style}>
                            <NavLink to={detailPath}/>
                            {$props.columns}
                        </div>
                    )
                }}
            >
                <Column
                    width={200}
                    label="Name"
                    className="name"
                    dataKey="name"
                    headerRenderer={UIWindowTableHeaderRenderer}
                    flexGrow={1}              
                />                
                <Column
                    width={55}
                    label="Type"
                    className="incidentType"
                    dataKey="incidentType"
                    flexGrow={1}   
                    headerRenderer={UIWindowTableHeaderRenderer} 
                    cellRenderer={($value:TableCellDataGetterParams)=>{ 
                        let data = $value.rowData as ChecklistData;

                        if(!data.firstIncidentType){
                            return "";
                        }

                        let path:string = "";
                        if(isUserChecklist){
                            path = ChecklistsView.PATH_USER+"/"+data.checklistId;
                        }else{
                            path = ChecklistsView.PATH+"/"+data.checklistId;
                        }

                        return (
                            <NavLink title={data.firstIncidentType.incidentType} to={path}>
                                <UIIncidentTypeIcon type={data.firstIncidentType}/>
                            </NavLink>
                        )
                    }}               
                />
                {jsxOpsRoleColumn}
                {jsxLastCompletedColumn}
                <Column
                    dataKey="actions"
                    width={76}
                    flexShrink={0}
                    className="actions"
                    disableSort={true}
                    headerRenderer={UIWindowTableHeaderRenderer}
                    cellRenderer={($value:TableCellDataGetterParams)=>{                                
                        let data:ChecklistData = $value.rowData as ChecklistData;
                       
                        let showDistrictLbl:boolean=false;
                        let matchesCurOrg:boolean=false;
                        if(User.selectedOrg.orgId===data.orgId){
                            matchesCurOrg=true;
                        }
                        if(User.selectedOrg.parentOrgId===data.orgId){
                            showDistrictLbl=true;
                        }

                        let jsx:JSX.Element = <></>;

                        let editPath:string = "";
                        if(isUserChecklist){
                            editPath = ChecklistsView.PATH_USER+"/"+data.checklistId+MasterDetailSwitch.PATH_EDIT;
                        }else{
                            editPath = ChecklistsView.PATH+"/"+data.checklistId+MasterDetailSwitch.PATH_EDIT;
                        }


                        if(matchesCurOrg && canEdit && !isUserChecklist){
                            jsx = <UIEditButton path={editPath} isSquare/>;
                        }else{
                            if(showDistrictLbl){
                                jsx = <div className="greyBubble">{User.selectedOrg.terminologyList.parent_org.singular}</div>;
                            }
                        }
                        return (
                            <>
                                {jsx}
                            </>
                        )
                    }}
                /> 
            </UIWindowTable>
        );



        return (
            <UIView ref={this.view} id="checklistMaster" usePadding useScrollContainer>
                
                <UIMasterFrame
                    baseTitle="Checklists"
                    baseIcon={ChecklistsView.ICON}
                    onFilterChange={this._onFilterChange}
                    addBtn={addBtn}
                    basePath={ChecklistsView.PATH}
                    resultNotification={this.state.resultNotification}
                    onClearResultNotification={this._onClearResultNotification}
                    filter={this.state.inputFilter}
                    filterPlaceholder="Filter by Name"
                    filterTags={this._filterTags}
                    filterTagsSelected={this.state.selectedFilterTags}
                    onFilterTagsChanged={this._onFilterTagsChanged}
                >
                    <UIWhiteBox noPadding>

                        <UITabBar
                            horizontal
                            data={this._tabs}
                            selectedID={this.state.selectedTab}
                            onChange={this._onTabChange}
                        />
                        <div className="tabContent">
                            {jsxContent}
                        </div>
                        {middleBox}
                    </UIWhiteBox>                    
                </UIMasterFrame>
            </UIView>
        );
    }
}
