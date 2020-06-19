import React from 'react';
import UIView from '../../../../ui/UIView';
import UIMasterFrame from '../../../../ui/UIMasterFrame';
import UsersView from './UsersView';
import Api, { IErrorType } from '../../../../api/Api';
import UIWhiteBox from '../../../../ui/UIWhiteBox';

import UILoadingBox from '../../../../ui/UILoadingBox';
import UIErrorBox from '../../../../ui/UIErrorBox';
import User, { IResultNotification } from '../../../../data/User';
import TimerUtil from '../../../../util/TimerUtil';
import UIWindowTable, { UIWindowTableHeaderRenderer } from '../../../../ui/UIWindowTable';
import { SortDirectionType, TableRowProps, Column } from 'react-virtualized';
import IUserData, { UserDataFilter, UserData } from '../../../../data/UserData';
import { NavLink } from 'react-router-dom';
import { UIEditButton } from '../../../../ui/UIButton';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';
import UINoData from '../../../../ui/UINoData';

import accountPlus from '@iconify/icons-mdi/account-plus';
import { FilterTagGroup, createBlankFilterTagGroups, createOpsRolesTagGroup } from '../../../../overlay/FilterOverlay';
import NextFrame from '../../../../util/NextFrame';
import { dispatch } from '../../../../dispatcher/Dispatcher';
import AppEvent from '../../../../event/AppEvent';

export interface PeopleMasterViewProps {

}

export interface PeopleMasterViewState {
    filter:string;
    inputFilter:string;
    selectedFilterTags:FilterTagGroup[];
    loading:boolean;
    error?:IErrorType;
    resultNotification?:IResultNotification;
}

export default class UsersMasterView extends React.Component<PeopleMasterViewProps, PeopleMasterViewState> {
    static ID:string = "usersMaster";

    view:React.RefObject<UIView> = React.createRef();

    _isUnmounting:boolean=false;
    
    _filterTags:FilterTagGroup[] = [
        {
            property:"firstSecRoleId",
            label:"Permissions",
            tags:User.state.secRoles.filter(($role)=>{
                return $role.priority<=User.selectedOrg.secRole!.priority
            }).map(($role)=>{
                return $role.secRole;
            }),
        },
        createOpsRolesTagGroup("firstOpsRoleId")
    ];

    constructor(props: PeopleMasterViewProps) {
        super(props);

        this.state = {
            filter:"",
            inputFilter:"",
            loading:false,
            selectedFilterTags:createBlankFilterTagGroups(this._filterTags)
        }
    }
    componentDidMount(){
        this._loadData();
    }
    componentWillUnmount(){
        this._isUnmounting=true;
    }
    _loadData=()=>{
        if(!this._isUnmounting){
            this.setState({
                loading:true,
                error:undefined
            },()=>{

                Api.userManager.getUsers(($success:boolean, $results:any)=>{
                    if(!this._isUnmounting){
                        if($success){
                            this.setState({loading:false});
                            
                            User.checkResultNotification("user",($notif)=>{
                                this.setState({resultNotification:$notif});
                            });


                        }else{
                            this.setState({loading:false, error:$results});
                        }
                    }
                });
            });
        }
    }

    _onFilterChange=($value:string)=>{

        TimerUtil.debounce("peopleFilter",()=>{
            this.setState({filter:$value});
        },UIMasterFrame.FILTER_DEBOUNCE_SPEED_MS);
        this.setState({inputFilter:$value});
    }

    getContainer=()=>{

        let container:HTMLDivElement | null = null;
        
        if(this.view.current){
            container = this.view.current.getScrollContainer()!.container.current;
        }

        return container;
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
    
    _sort=($sortBy:string, $direction:SortDirectionType, $a:UserData, $b:UserData)=>{
        let numRet:number;
        
        let strA:string = "";
        let strB:string = "";
        switch($sortBy){
            case "lastCommaFirst":
                
                numRet = UIWindowTable.BASIC_SORT($direction, $a.lastCommaFirst,$b.lastCommaFirst);
            break;
            case "secRole":

                if($a.organizations && $a.organizations[0].secRole){
                    strA = $a.organizations && $a.organizations[0].secRole;
                }
                if($b.organizations && $b.organizations[0].secRole){
                    strB = $b.organizations && $b.organizations[0].secRole;
                }

                numRet = UIWindowTable.BASIC_SORT($direction, strA,strB);
            break;
            case "opsRole":

                if($a.organizations && $a.organizations[0].opsRole){
                    strA = $a.organizations && $a.organizations[0].opsRole;
                }
                if($b.organizations && $b.organizations[0].opsRole){
                    strB = $b.organizations && $b.organizations[0].opsRole;
                }

                numRet = UIWindowTable.BASIC_SORT($direction, strA,strB);
            break;
            default:
            numRet = UIWindowTable.BASIC_SORT($direction,$a[$sortBy],$b[$sortBy]);
        }

        return numRet;
    }
    render() {

        
        let numHeaderH:number = 60;
        let numRowH:number = 60;

        let data:UserData[] = UserDataFilter(this.state.filter,this.state.selectedFilterTags, User.state.allPeopleData);

        let isOk:boolean = !this.state.loading && !this.state.error;


        
        return (
            <UIView id={UsersMasterView.ID} usePadding useScrollContainer ref={this.view}>
                
                <UIMasterFrame
                    baseIcon={UsersView.ICON}
                    baseTitle={User.selectedOrg.terminologyList.user.plural}
                    basePath={UsersView.PATH}
                    filter={this.state.inputFilter}
                    filterPlaceholder="Filter by Name or Email"
                    filterTags={this._filterTags}
                    filterTagsSelected={this.state.selectedFilterTags}
                    resultNotification={this.state.resultNotification}
                    onFilterTagsChanged={this._onFilterTagsChanged}
                    onClearResultNotification={this._onClearResultNotification}
                    onFilterChange={this._onFilterChange}
                    addBtn={{icon:accountPlus, label:"Add New User", path:UsersView.PATH+"/new"}}
                >
                    {isOk && (                            
                            <UIWhiteBox noPadding>                                
                                <UIWindowTable
                                    scrollElement={this.getContainer()!}
                                    data={data}
                                    headerH={numHeaderH}
                                    rowH={numRowH}
                                    sort={this._sort}
                                    initSortBy="lastCommaFirst"
                                    rowRenderer={($props:TableRowProps)=>{

                                        let person = $props.rowData as UserData;
                                        let path = UsersView.PATH+"/"+person.userId;
                                        return (
                                            <div key={$props.key} className={$props.className} style={$props.style}>
                                                <NavLink to={path}/>
                                                {$props.columns}
                                            </div>
                                        )
                                    }}
                                >                                                     
                                    <Column
                                        width={150}
                                        label="Name"
                                        className="name"
                                        headerClassName="name"
                                        dataKey="lastCommaFirst"
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        flexGrow={1}   
                                        /*cellRenderer={(data:{rowData:any, rowIndex:number})=>{
                                            let person:UserData = data.rowData as UserData;
                                          
                                            return (
                                                <>
                                                    {person.lastCommaFirst}
                                                    
                                                </>
                                            )
                                        }}  */  
                                    />                                                
                                    <Column
                                        width={150}
                                        label="Email"
                                        className="primaryEmail"
                                        headerClassName="primaryEmail"
                                        dataKey="primaryEmail"
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        flexGrow={1}                                              
                                    />                                    
                                    <Column
                                        width={150}
                                        label="Permissions"
                                        className="secRole"
                                        headerClassName="secRole"
                                        dataKey="firstSecRole"
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        flexGrow={1}                                           
                                    />                                  
                                    <Column
                                        width={150}
                                        label="Operational Role"
                                        className="opsRole"
                                        headerClassName="opsRole"
                                        dataKey="firstOpsRole"
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        flexGrow={1}                                    
                                    />
                                    <Column
                                        className="actions"
                                        dataKey="canEditForSelectedOrg"
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        width={42}
                                        flexShrink={0}
                                        cellRenderer={(data:{rowData:any, rowIndex:number})=>{
                                            let person:UserData = data.rowData as UserData;
                                            
                                            return (
                                                <>
                                                    {person.canEditForSelectedOrg && (
                                                        <UIEditButton isSquare path={UsersView.PATH+"/"+person.userId+MasterDetailSwitch.PATH_EDIT}/>
                                                    )}
                                                </>
                                            )
                                        }}
                                    /> 

                                </UIWindowTable>                  
                                {isOk && data.length===0 && (
                                    <UINoData filter={this.state.filter} filterTags={this.state.selectedFilterTags}/>
                                )}
                            </UIWhiteBox>
                    )}  
                    {this.state.loading && (
                        <UILoadingBox/>
                    )}
                    {this.state.error && (
                        <UIErrorBox error={this.state.error.desc}/>
                    )}
                </UIMasterFrame>
            </UIView>
        );
    }
}
