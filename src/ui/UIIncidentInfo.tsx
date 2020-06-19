import * as React from 'react';
import './UIIncidentInfo.scss';
import FormatUtil from '../util/FormatUtil';
import UICommentBox from './UICommentBox';



export interface IIncidentInfo{

    title:string;
    value:string;
    valueSpan?:string;
    extraClassName?:string;
    extraValue?:JSX.Element;
}


export interface IUIIncidentInfoProps {
    data:IIncidentInfo[]
}

export default class UIIncidentInfo extends React.Component<IUIIncidentInfoProps> {
    render() {
        return (
            <div className="incidentInfo">
                {this.props.data.map(($data,$index)=>{
                    return (
                        <UIIncidentInfoItem key={$data.title+$index} data={$data} />
                    )
                })}
            </div>
        );
    }
}


export interface IUIIncidentInfoItemProps {
    data:IIncidentInfo;
}

export class UIIncidentInfoItem extends React.Component<IUIIncidentInfoItemProps> {
    render() {

        let strCN:string = "incidentInfoItem";
        if(this.props.data.extraClassName){
            strCN+=" "+this.props.data.extraClassName;
        }

        return (
            <div className={strCN}>
                <div className="incidentInfoItemTitle">{this.props.data.title}</div>
                <div className="incidentInfoItemValue">
                    {this.props.data.value}
                    {this.props.data.valueSpan && (
                        <span>{this.props.data.valueSpan}</span>
                    )}
                    {this.props.data.extraValue}
                </div>
            </div>
        );
    }
}

export function createIncidentInfo_Duration($elapsedSeconds:number):IIncidentInfo{
    return {
        title:"DURATION",
        value:FormatUtil.timerHMSForReading($elapsedSeconds,false,true),
    }
}

export function createIncidentInfo_Status($status:string):IIncidentInfo{
    return {
        title:"STATUS",
        value:$status,
        
    }
}


export function createIncidentInfo_ActionBy($action:string, $name:string,$date:Date, $opsRole?:string, $comment?:string):IIncidentInfo{
    return {
        title:$action,
        value:$name,
        valueSpan:$opsRole,
        extraClassName:"actionBy",
        extraValue:(
            <>
                <div className="date">{FormatUtil.dateMDY($date,true,false)+" "+FormatUtil.dateHMS($date,true,false,true)}</div>
                {$comment && (
                    <UICommentBox comment={$comment}/>
                )}
            </>
        ) 
    }
}

export function createIncidentInfo_ScheduledBy($name:string,$date:Date,$opsRole?:string, $comment?:string):IIncidentInfo{
    return createIncidentInfo_ActionBy("SCHEDULED BY",$name,$date,$opsRole,$comment);
}
export function createIncidentInfo_TriggeredBy($name:string,$date:Date,$opsRole:string, $comment?:string):IIncidentInfo{
    return createIncidentInfo_ActionBy("TRIGGERED BY",$name,$date,$opsRole,$comment);
}

export function createIncidentInfo_ReportedBy($name:string,$date:Date,$opsRole:string, $comment?:string):IIncidentInfo{
    return createIncidentInfo_ActionBy("REPORTED BY",$name,$date,$opsRole,$comment);
}

export function createIncidentInfo_ClosedBy($name:string,$date:Date,$opsRole:string, $comment?:string):IIncidentInfo{
    return createIncidentInfo_ActionBy("CLOSED BY",$name,$date,$opsRole,$comment);
}


export function createIncidentInfo_Comments($comments:string):IIncidentInfo{
     return {
        title:"COMMENTS",
        value:"",
        extraClassName:"comments",
        extraValue:(
            <UICommentBox comment={$comments}/>
        ) 
    }
}

