import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { hideOverlay, showOverlay } from './OverlayController';

import { IIncidentChecklistUserChecklist, IIncidentChecklistUserChecklistItem } from '../data/IncidentData';
import UIChecklistStatusIcon from '../view/dashboard/er/drills/UIChecklistStatusIcon';
import './ChecklistCommentsOverlay.scss';
import UICommentBox from '../ui/UICommentBox';
import FormatUtil from '../util/FormatUtil';
import UIDrillStatusIcon from '../view/dashboard/er/drills/UIDrillStatusIcon';
import UIChecklistStepIcon from '../ui/UIChecklistStepIcon';

export default class ChecklistCommentsOverlay extends React.Component<BaseOverlayProps> {

    static ID:string = "checklistComment";

    static show($name:string, $data:IIncidentChecklistUserChecklist){
        showOverlay($name, ChecklistCommentsOverlay.ID,{data:$data});
    }
    static hide($name:string){        
        hideOverlay($name, ChecklistCommentsOverlay.ID,{});
    }
    _onBGClick=()=>{
        this._close();
    }
    _onHeaderClose=()=>{
        this._close();
    }
    
    _close=()=>{
        ChecklistCommentsOverlay.hide(this.props.data.name);
    }
    render() {


        let data:IIncidentChecklistUserChecklist = this.props.data.details.data;

        let dataWComments = data.checklistItems.filter(($checklistItem)=>{
            return $checklistItem.comment;
        });



        return (
            <Overlay 
                state={this.props.data.state} 
                id={ChecklistCommentsOverlay.ID} 
                zIndex={462} 
                onBGClick={this._onBGClick} 
                headerClose={this._onHeaderClose}
                headerTitle={"Checklist Comments ("+dataWComments.length+")"}
                
                mediumMaxWidth
                
            >
                <div className="checklistCommentsContent">
                    <div className="checklistInfo">
                        <UIChecklistStatusIcon data={data}/>
                        <div className="userName">{data.userName}</div>
                    </div>
                    <div className="checklistCommentsContainer">
                        {dataWComments.map(($checklistItem)=>{
                            return (
                                <ChecklistCommentsItem data={$checklistItem}/>
                            )
                        })}
                    </div>
                </div>
            </Overlay>
        );
    }
}


interface IChecklistCommentsItemProps {
    data:IIncidentChecklistUserChecklistItem;
}

 class ChecklistCommentsItem extends React.Component<IChecklistCommentsItemProps> {
    render() {
        let strCN:string = "checklistCommentsItem";

        let date:Date = new Date(Number(this.props.data.updateDts)*1000);

        let status = UIDrillStatusIcon.STATUS_CODE_STARTED;
        if(this.props.data.doneFlag){
            status = UIDrillStatusIcon.STATUS_CODE_COMPLETED;
        }

        let jsxStepInfo:JSX.Element = <></>;
        if(this.props.data.doneFlag){
            jsxStepInfo = (
                <UIDrillStatusIcon status={UIDrillStatusIcon.STATUS_CODE_COMPLETED} customLabel={this.props.data.checklistItem}/>
            );
        }else{
            jsxStepInfo = (
                <UIChecklistStepIcon step={this.props.data.sequenceNumber} label={this.props.data.checklistItem}/>
            )
        }

        return (
            <div className={strCN}>    
                <div className="checklistStepInfo">
                    {jsxStepInfo}
                </div>            
                <UICommentBox comment={this.props.data.comment!}/>
                <div className="commentDate">
                    {FormatUtil.dateHMS(date,true,false,true)+" - "+FormatUtil.dateMDY(date,true,true,true,true)}
                </div>
            </div>
        );
    }
}
