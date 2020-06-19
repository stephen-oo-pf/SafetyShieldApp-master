import * as React from 'react';
import UIPopup from '../../../../ui/UIPopup';
import { IDrillData, getStatusFromDrillData } from '../../../../data/DrillData';
import NextFrame from '../../../../util/NextFrame';
import './UIDrillCalendarPopup.scss';
import FormatUtil from '../../../../util/FormatUtil';
import UIIncidentTypeIcon from '../../../../ui/UIIncidentTypeIcon';
import { getIncidentTypeById } from '../../../../data/IncidentData';
import UIDrillStatusIcon from './UIDrillStatusIcon';
import UIScrollContainer from '../../../../ui/UIScrollContainer';
export interface IUIDrillCalendarPopupProps {
    data:IDrillData[];
    onClose:()=>void;
}
export interface IUIDrillCalendarPopupState {
    show:boolean;
}

interface IDrillTimeGroup{
    timeID:string;
    date:Date;
    drills:IDrillData[];
}

export default class UIDrillCalendarPopup extends React.Component<IUIDrillCalendarPopupProps,IUIDrillCalendarPopupState> {

    constructor($props:IUIDrillCalendarPopupProps){
        super($props);
        this.state = {
            show:false
        }
    }

    _onClose=()=>{
        this.setState({show:false});
        this.props.onClose();
    }
    componentDidMount(){
        //this will allow it to trigger a css "change" and show the animation.
        NextFrame(()=>{
            this.setState({show:true});
        });
    }



    render() {

        //These groups are simply the drills that have the same hour/minute
        let drillTimeGroups:IDrillTimeGroup[] = this.props.data.reduce(($prev:IDrillTimeGroup[], $drill:IDrillData)=>{

            let drillDate:Date = new Date($drill.entryDts*1000);

            let drillTimeID:string = drillDate.getHours()+":"+drillDate.getMinutes();

            let existingGroup = $prev.find(($group)=>{
                return $group.timeID===drillTimeID;
            });

            if(existingGroup){
                //exists
                existingGroup.drills.push($drill);
            }else{
                //new
                $prev.push({
                    date:drillDate,
                    timeID:drillTimeID,
                    drills:[$drill]
                });
            }

            return $prev;
        },[]);


        return (
            <UIPopup extraClassName="drillCalendarPopup" onClose={this._onClose} closeBtn showing={this.state.show} >
                <UIScrollContainer> 
                    <div className="insideContainer">                                     
                        {drillTimeGroups.map(($group,$index)=>{
                            return (
                                <UIDrillCalendarPopupGroup key={"drillcalendarPopupGroup"+$index+$group.timeID} data={$group} groupIndex={$index}/>
                            )
                        })}
                    </div>  
                </UIScrollContainer>
            </UIPopup>
        );
    }
}


interface IUIDrillCalendarPopupGroupProps {
    data:IDrillTimeGroup;
    groupIndex:number;
}

class UIDrillCalendarPopupGroup extends React.Component<IUIDrillCalendarPopupGroupProps> {
    render() {
        let strCN:string = "drillCalendarPopupGroup";

        return (
            <div className={strCN}>
                <div className="groupTime">{FormatUtil.dateHMS(this.props.data.date,true,false,true)}</div>
                <div className="groupContainer">
                    {this.props.data.drills.map(($drill,$index)=>{
                        return (
                            <UIDrillCalendarPopupGroupItem key={this.props.groupIndex+"group_item"+$index+$drill.entryDts} data={$drill}/>
                        )
                    })}
                </div>
            </div>
        );
    }
}

interface IUIDrillCalendarPopupGroupItemProps {
    data:IDrillData;
}

class UIDrillCalendarPopupGroupItem extends React.Component<IUIDrillCalendarPopupGroupItemProps> {
    render() {
        let strCN:string = "drillCalendarPopupGroupItem";

        let incidentType = getIncidentTypeById(this.props.data.entryDetails.incidentTypeId);

        
        let status:string = getStatusFromDrillData(this.props.data)
        

        return (
            <div className={strCN}>
                {incidentType && (
                    <UIIncidentTypeIcon smallerAndBlack type={incidentType}/>
                )}
                <div className="itemInfo">
                    {incidentType && (
                        <div className="itemInfoType">{incidentType.incidentType}</div>
                    )}
                    <div className="itemInfoOrg">{this.props.data.orgName}</div>
                    <UIDrillStatusIcon status={status}/>
                </div>
            </div>
        );
    }
}
