import * as React from 'react';
import { IIncidentChecklist, countIncidentChecklistStats, IIncidentData, IIncidentChecklistUserChecklist, IIncidentChecklistUserChecklistItem } from '../data/IncidentData';
import UITable, { ITableColumn, ITableRowRenderer } from './UITable';
import UIWhiteBox from './UIWhiteBox';
import './UIIncidentChecklists.scss';
import UIIconWLabel from './UIIconWLabel';

import chevronDown from '@iconify/icons-mdi/chevron-down';
import chevronUp from '@iconify/icons-mdi/chevron-up';
import UIDrillStatusIcon from '../view/dashboard/er/drills/UIDrillStatusIcon';
import UIProgressBar from './UIProgressBar';
import UIIcon from './UIIcon';
import TimerUtil from '../util/TimerUtil';
import UIButton from './UIButton';
import ChecklistsView from '../view/dashboard/er/checklists/ChecklistsView';
import Api, { IErrorType } from '../api/Api';
import UILoadingIcon from './UILoadingIcon';
import UIErrorBox from './UIErrorBox';
import NextFrame from '../util/NextFrame';

import commentText from '@iconify/icons-mdi/comment-text';
import { getOpsRole } from '../data/OpsRole';
import User from '../data/User';
import UIDrillStatusBar from '../view/dashboard/er/drills/UIDrillStatusBar';
import ChecklistCommentsOverlay from '../overlay/ChecklistCommentsOverlay';
import UIChecklistStatusIcon from '../view/dashboard/er/drills/UIChecklistStatusIcon';
import ChecklistOverlay from '../overlay/ChecklistOverlay';
import LoadingOverlay from '../overlay/LoadingOverlay';
import ChecklistData from '../data/ChecklistData';
import AlertOverlay from '../overlay/AlertOverlay';
import UIIncidentTableFrame from './UIIncidentTableFrame';


export interface IUIIncidentChecklistsProps {
    checklists:IIncidentChecklist[];
    incident:IIncidentData;
    orgId:string;
}

export interface IUIIncidentChecklistsState {
    
}

export default class UIIncidentChecklists extends React.Component<IUIIncidentChecklistsProps, IUIIncidentChecklistsState> {
    constructor(props: IUIIncidentChecklistsProps) {
        super(props);

        this.state = {
        }
    }

    render() {
        let strCN:string = "incidentChecklists";

        let columns:ITableColumn[] = [
            {
                name:"Name / Operational Role",
                dataKey:"nameOpsRole",
                width:200,
                flexGrow:1,
                dataGetter:($data:IIncidentChecklist)=>{

                    let opsRole;
                    if($data.opsRoleId){


                        let opsRoleId:string = "";

                        if(Array.isArray($data.opsRoleId)){
                            opsRoleId = $data.opsRoleId[0];
                        }else{
                            opsRoleId = $data.opsRoleId;
                        }

                        opsRole = getOpsRole(opsRoleId,User.state.opsRoles);
                    }


                    return (
                        <div className="checklistNameOpsColumnRowCell">
                            <div className="checklistName">{$data.checklist}</div>
                            {opsRole && (
                                <div className="opsRole">{opsRole.opsRole}</div>
                            )}
                        </div>
                    )
                }
            },
            {
                name:"# Assigned Users",
                dataKey:"assignedUsers",
                width:300,
                dataGetter:($data:IIncidentChecklist)=>{
                    let count:number = countIncidentChecklistStats($data).total;                    
                    return ""+count;
                }
            },
            {
                name:"Status",
                dataKey:"status",
                width:200,
                dataGetter:($data:IIncidentChecklist)=>{
                    return (
                        <UIDrillStatusBar data={$data}/>
                    )
                }

            },
        ]


        return (
            <UIIncidentTableFrame
                extraClassName={strCN}
                header={(
                    <>
                        <p><span>{this.props.checklists.length}</span> checklist{this.props.checklists.length>1?"s":""} assigned</p>
                        
                        <div className="statusLegend">
                            <UIDrillStatusIcon status={UIDrillStatusIcon.STATUS_CODE_COMPLETED}/>
                            <UIDrillStatusIcon status={UIDrillStatusIcon.STATUS_CODE_STARTED}/>
                            <UIDrillStatusIcon status={UIDrillStatusIcon.STATUS_CODE_NOT_STARTED}/>
                        </div>
                    </>
                )}
            >
                <UITable
                    headerH={56}
                    rowH={60}
                    columns={columns}
                    data={this.props.checklists}
                    rowRenderer={($data:any, $columns:JSX.Element,$className:string, $key:string)=>{
                        return (
                            <UIIncidentChecklistRow
                                key={$key}
                                columns={$columns}
                                className={$className}
                                incidentId={this.props.incident.incidentId}
                                orgId={this.props.orgId}
                                data={$data as IIncidentChecklist}
                            />
                        )
                    }}
                />
            </UIIncidentTableFrame>
        );
    }
}



 interface IUIIncidentChecklistRowProps {
     data:IIncidentChecklist;
     incidentId:string;
     columns:JSX.Element;
     className:string;
     orgId:string;
}

interface IUIIncidentChecklistRowState{
    showAdvanced:boolean;
    loading:boolean;
    error?:IErrorType;
    data?:IIncidentChecklistUserChecklist[];
}

class UIIncidentChecklistRow extends React.Component<IUIIncidentChecklistRowProps,IUIIncidentChecklistRowState> {

    advRowInside:React.RefObject<HTMLDivElement> = React.createRef();

    _listening:boolean=false;
    _unmounting:boolean=false;

    _advColumns:ITableColumn[] = [
        {
            dataKey:"userName",
            name:"User",
            width:300,
            flexGrow:1,
        },
        {
            dataKey:"status",
            name:"Status",
            width:300,
            dataGetter:($data:IIncidentChecklistUserChecklist)=>{
                return (
                    <UIChecklistStatusIcon data={$data}/>
                )
            }
        },
        {
            dataKey:"comments",
            name:"Comments",
            width:200,
            dataGetter:($data:IIncidentChecklistUserChecklist)=>{

                let commentCount:number = $data.checklistItems.reduce(($prev,$item)=>{

                    let count:number = $prev;
                    if($item.comment){
                        count++;
                    }
                    return count;
                },0);

                return (
                    <>
                        {commentCount>0 && (
                            <UIButton onClick={()=>{
                                ChecklistCommentsOverlay.show("checklistComments", $data);
                            }} icon={commentText} label={""+commentCount} size={UIButton.SIZE_SMALL} color={UIButton.COLOR_TRANSPARENT} iconOnLeft/>
                        )}
                    </>
                )
            }
        }
    ];

    constructor($props:IUIIncidentChecklistRowProps){
        super($props);

        this.state = {
            showAdvanced:false,
            loading:false,
        }
    }
    componentDidUpdate($prevProps:IUIIncidentChecklistRowProps, $prevState:IUIIncidentChecklistRowState){
        if(this.state.showAdvanced!==$prevState.showAdvanced){

            if(this.state.showAdvanced){
                this._addListener();
            }else{
                this._removeListener();
            }
        }
    }
    componentWillUnmount(){
        this._unmounting=true;
        this._removeListener();
        TimerUtil.clearDebounce("checklistRow"+this.props.data.checklistId);
    }
    _addListener= ()=>{
        if(!this._listening){
            this._listening=true;
            window.addEventListener("resize", this._onWindowResize);
        }
    }
    _removeListener= ()=>{
        if(this._listening){
            this._listening=false;
            window.removeEventListener("resize", this._onWindowResize);
        }
    }
    _onWindowResize=()=>{
        TimerUtil.debounce("checklistRow"+this.props.data.checklistId,()=>{
            this.forceUpdate();
        });
    }


    _onToggleAdvanced=()=>{
        if(this.state.showAdvanced){
            this._hideAdvanced();
        }else{
            this._showAdvanced();
        }
    }
    _hideAdvanced=()=>{
        this.setState({showAdvanced:false});

    }
    _onViewChecklist=()=>{

        let hideLoading = LoadingOverlay.show("loadingChecklist","Loading Checklist","Loading Please Wait");

        Api.checklistManager.getChecklist(this.props.data.checklistId,($success, $results)=>{
            hideLoading();
            if(!this._unmounting){

                if($success){

                    let data:ChecklistData = new ChecklistData();
                    data.populate($results);
                    ChecklistOverlay.show("viewChecklist", data);

                }else{
                    AlertOverlay.show("errorLoadingChecklist",$results);
                }
            }
        });

        
    }
    _showAdvanced=()=>{
        this.setState({loading:true, data:undefined, error:undefined},()=>{
            Api.incidentManager.getIncidentChecklists(this.props.orgId,this.props.incidentId,this.props.data.checklistId,($success:boolean, $results:any)=>{
                
                if(!this._unmounting){

                    if(!this.state.showAdvanced){
                        this.setState({showAdvanced:true, loading:false, data:$results},()=>{
                            NextFrame(()=>{
                                this.forceUpdate();
                            });
                        });
                    }else{
                        this.setState({loading:false, error:$results});
                    }
                }
            });
        });
    }

    render() { 
        let strCN:string = "checklistRow "+this.props.className;

        let icon:object = chevronDown;
        
        let numAdvH:number = 0;
        if(this.state.showAdvanced){
            strCN+=" advancedShowing";
            icon = chevronUp;
            if(this.advRowInside.current){
                numAdvH = this.advRowInside.current.clientHeight;
            }
        }

        if(this.state.loading){

        }
        

        return (
            <div className={strCN}>
                <div className="basicRow">
                    <div className="rowClick" onClick={this._onToggleAdvanced}/>
                    {this.props.columns}
                    <UIIcon icon={icon}/>
                    {this.state.loading && (
                        <UILoadingIcon/>
                    )}
                </div>
                <div className="advancedRow" style={{height:numAdvH+"px"}}>
                    <div className="advancedRowInside" ref={this.advRowInside}>
                        <UIButton onClick={this._onViewChecklist} iconOnLeft label="View Checklist" icon={ChecklistsView.ICON} color={UIButton.COLOR_TRANSPARENT_PURPLE} fontSize={UIButton.SIZE_SMALL}/>
                        <UIWhiteBox noPadding>
                            {this.state.error && (
                                <UIErrorBox error={this.state.error.desc}/>
                            )}
                            {this.state.data && (                                
                                <UITable
                                    columns={this._advColumns}
                                    data={this.state.data}
                                    headerH={56}
                                    rowH={60}
                                    rowRenderer={($data:any, $columns:JSX.Element, $className:string, $key:string)=>{
                                        return (
                                            <div className={$className} key={$key}>
                                                {$columns}
                                            </div>
                                        )
                                    }}
                                >
                                </UITable>
                            )}
                        </UIWhiteBox>
                    </div>
                </div>
            </div>
        );
    }
}
