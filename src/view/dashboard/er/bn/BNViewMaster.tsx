import React from 'react';
import UIView from '../../../../ui/UIView';
import Api, { IErrorType } from '../../../../api/Api';
import UITitle from '../../../../ui/UITitle';
import UIButton, { UIEditButton } from '../../../../ui/UIButton';

import UIMasterFrame from '../../../../ui/UIMasterFrame';
import UILoadingBox from '../../../../ui/UILoadingBox';
import UIErrorBox from '../../../../ui/UIErrorBox';
import TimerUtil from '../../../../util/TimerUtil';
import cogIcon from '@iconify/icons-mdi/cog';

import './BNView.scss';

import UIFilterInput from '../../../../ui/UIFilterInput';
import UIWindowTable, { UIWindowTableHeaderRenderer } from '../../../../ui/UIWindowTable';
import { IBroadcastData } from '../../../../data/BroadcastData';
import { SortDirectionType, TableRowProps, Column, TableCellDataGetterParams } from 'react-virtualized';
import { NavLink, RouteComponentProps } from 'react-router-dom';

import UIIncidentTypeIcon from '../../../../ui/UIIncidentTypeIcon';
import { getIncidentTypeById, getIncidentStatusById } from '../../../../data/IncidentData';
import User, { IResultNotification } from '../../../../data/User';
import MasterDetailSwitch from '../../../../util/MasterDetailSwitch';
import UINoData from '../../../../ui/UINoData';
import BroadcastOverlay from '../../../../overlay/BroadcastOverlay';
import { listen, unlisten } from '../../../../dispatcher/Dispatcher';
import AppEvent from '../../../../event/AppEvent';
import UIStatusBanner from '../../../../ui/UIStatusBanner';
import BNView from './BNView';
import UIWhiteBox from '../../../../ui/UIWhiteBox';

export interface IBNMasterViewProps extends RouteComponentProps{
}
export interface IBNMasterViewState {
    
    error?:IErrorType;
    loading:boolean;
    filter:string;
    inputFilter:string;
    broadcastSuccessName?:string;
    resultNotification?:IResultNotification;
}

export default class BNMasterView extends React.Component<IBNMasterViewProps,IBNMasterViewState> {

    view:React.RefObject<UIView> = React.createRef();

    _unmouting:boolean=false;
    constructor($props:IBNMasterViewProps){
        super($props);

        this.state = {
            loading:true,
            inputFilter:"",
            filter:"",
        }

    }
    
    componentDidMount(){
        listen(AppEvent.BROADCAST_SUCCESS, this._onSuccessBroadcast);
        this._loadData();
    }
    componentWillUnmount(){
        unlisten(AppEvent.BROADCAST_SUCCESS, this._onSuccessBroadcast);
        this._unmouting=true;
    }
    _loadData=()=>{
        this.setState({loading:true, error:undefined},()=>{

            Api.incidentManager.getBNBasic(($basicsuccess,$basicresults)=>{
                if($basicsuccess){

                    Api.orgManager.getOrgBroadcasts(($success:boolean, $results:any)=>{


                        User.checkResultNotification("broadcast",($notif)=>{
                            this.setState({resultNotification:$notif});
                        });

                        if($success){
        
                            if(!this._unmouting){
                                this.setState({loading:false});
                            }
                        }else{
                            if(!this._unmouting){
                                this.setState({loading:false, error:$results});
                            }
                        }
                    });

                }else{
                    if(!this._unmouting){
                        this.setState({loading:false, error:$basicresults});
                    }
                }
            });


        });
    }

    _onFilterChange=($value:string)=>{
        TimerUtil.debounce("orgFilter",()=>{            
            this.setState({filter:$value});
        },UIMasterFrame.FILTER_DEBOUNCE_SPEED_MS);
        
        this.setState({inputFilter:$value});
    }
    _onSuccessBroadcast=($event:AppEvent)=>{
        this.setState({broadcastSuccessName:$event.details});
    }


    _sort=($sortBy:string, $direction:SortDirectionType, $a:IBroadcastData, $b:IBroadcastData):number=>{
        let numRet:number;

        let strA:string = "";
        let strB:string = "";
       
        switch($sortBy){
            case "incidentType":
                strA = $a.incidentTypeId;
                strB = $b.incidentTypeId;
            break;
            default:
                strA = $a[$sortBy];
                strB = $b[$sortBy];
        }

        numRet = UIWindowTable.BASIC_SORT($direction,strA,strB);

        return numRet;
    }
    _onClickManualBN=()=>{
        BroadcastOverlay.show("manualBN");
    }
    _onClearSuccessBN=()=>{
        this.setState({broadcastSuccessName:undefined});
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

    render() {

        let arrData:IBroadcastData[] = [];
        if(User.selectedOrg.broadcasts){
            let arrFilters:string[] = this.state.filter.toLowerCase().split(" ");//filtering by each word
            

            arrData = User.selectedOrg.broadcasts.filter(($broadcast)=>{
                
                let countOk:number=0;
                let broadcastIncidentType = getIncidentTypeById($broadcast.incidentTypeId);
                let incidentStatusType = getIncidentStatusById($broadcast.incidentStatusId);
                arrFilters.forEach(($filter:string)=>{
                    let isOk:boolean=false;
                    if($filter==="") isOk = true;      
                    
                    if($broadcast.name.toLowerCase().indexOf($filter)!==-1) isOk=true;
                    if(broadcastIncidentType?.incidentType.toLowerCase().indexOf($filter)!==-1) isOk=true;
                    if(incidentStatusType?.incidentStatus.toLowerCase().indexOf($filter)!==-1) isOk=true;

                    if(isOk) countOk++;                
                });
                return countOk===arrFilters.length;
            });
        }

        let numHeaderH:number = 60;
        let numRowH:number = 60;
        
        let isOk:boolean = (!this.state.error && !this.state.loading);
        return (
            <UIView ref={this.view} id={BNView.ID} usePadding useScrollContainer>
                <UIMasterFrame
                    baseIcon={BNView.ICON}
                    basePath={BNView.PATH}
                    baseTitle={"Broadcast Notifications"}
                    resultNotification={this.state.resultNotification}
                    onClearResultNotification={this._onClearResultNotification}
                >                    
                    <UIWhiteBox>
                            
                        {this.state.loading && (
                            <UILoadingBox/>
                        )}
                        {this.state.error && (
                            <UIErrorBox error={this.state.error.desc}/>
                        )}
                        {isOk && (
                            <>
                                <UITitle title={"Manual Broadcasts"}/>
                                <div className="manualBroadcastsOptions">
                                    {this.state.broadcastSuccessName && (
                                        <UIStatusBanner onClose={this._onClearSuccessBN} type={UIStatusBanner.STATUS_SUCCESS} text={(<>Successfully sent broadcast notification <span>{this.state.broadcastSuccessName}</span></>)}/>
                                    )}
                                    <UIButton size={UIButton.SIZE_SMALL} label="Send Broadcast Now" icon={BNView.ICON} onClick={this._onClickManualBN}/>
                                </div>
                                <UITitle title={"Automatic Broadcasts"}/>
                                <div className="automaticBroadcastsOptions">
                                    <UIFilterInput placeholder="Filter by Name or Event Type"  filter={this.state.inputFilter} onChange={this._onFilterChange}/>
                                    <UIButton label="Configure New Broadcast" path={BNView.PATH+MasterDetailSwitch.PATH_NEW} size={UIButton.SIZE_SMALL} icon={cogIcon}/>
                                </div>
                                <UIWindowTable
                                    headerH={numHeaderH}
                                    rowH={numRowH}
                                    data={arrData}                            
                                    sort={this._sort}
                                    initSortBy={"incidentTypeId"}
                                    scrollElement={this.getContainer()!}
                                    rowRenderer={($props:TableRowProps)=>{
                                        let data = $props.rowData as IBroadcastData;
                                        let detailPath:string = BNView.PATH+"/"+data.incidentBroadcastId;
                                        return (
                                            <div key={$props.key} className={$props.className} style={$props.style}>
                                                <NavLink to={detailPath}/>
                                                {$props.columns}
                                            </div>
                                        )
                                    }}
                                    >
                                                    
                                    <Column
                                        width={55}
                                        label="Type"
                                        className="incidentType"
                                        dataKey="incidentTypeId"
                                        
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        flexGrow={1}    
                                        cellRenderer={($value:TableCellDataGetterParams)=>{ 
                                            let data = $value.rowData as IBroadcastData;

                                            let type = getIncidentTypeById(data.incidentTypeId);
                                            if(!type){
                                                return null;
                                            }

                                            let detailPath:string = BNView.PATH+"/"+data.incidentBroadcastId;
                                            return (
                                                <NavLink title={type.incidentType} to={detailPath}>
                                                    <UIIncidentTypeIcon type={type}/>
                                                </NavLink>
                                            )
                                        }}               
                                    />
                                    <Column
                                        width={126}
                                        label="Sent When..."
                                        className="sentWhen"
                                        dataKey="incidentStatusId"
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        flexGrow={1}  
                                        cellDataGetter={($value:TableCellDataGetterParams)=>{
                                            let data = $value.rowData as IBroadcastData;

                                            let status = getIncidentStatusById(data.incidentStatusId);

                                            if(!status){
                                                return null;
                                            }

                                            return status.incidentStatus;
                                        }}               
                                    />   

                                    <Column
                                        width={200}
                                        label="Broadcast Name"
                                        className="name"
                                        dataKey="name"
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        flexGrow={1}           
                                    />   
                                    <Column
                                        dataKey="actions"
                                        width={76}
                                        flexShrink={0}
                                        className="actions"
                                        headerRenderer={UIWindowTableHeaderRenderer}
                                        disableSort={true}
                                        cellRenderer={($value:TableCellDataGetterParams)=>{                                
                                            let data:IBroadcastData = $value.rowData as IBroadcastData;
                                            let editPath:string = BNView.PATH+"/"+data.incidentBroadcastId+MasterDetailSwitch.PATH_EDIT;
                                            return (
                                                <UIEditButton path={editPath} isSquare/>
                                            )
                                        }}
                                    /> 

                                </UIWindowTable>
                            </>
                        )}
                        {isOk && arrData && arrData.length===0 &&  (
                            <UINoData filter={this.state.filter}/>
                        )}   

                    </UIWhiteBox>
                </UIMasterFrame>
   
            </UIView>
        );
    }
}
