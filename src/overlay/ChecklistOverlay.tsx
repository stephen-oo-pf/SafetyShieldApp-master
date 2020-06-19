import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { hideOverlay, showOverlay } from './OverlayController';

import './ChecklistOverlay.scss';
import { IIncidentChecklist, IIncidentChecklistUserChecklist } from '../data/IncidentData';
import ChecklistData, { IChecklistData } from '../data/ChecklistData';
import UIChecklistStepIcon from '../ui/UIChecklistStepIcon';
import UITitle from '../ui/UITitle';


export default class ChecklistOverlay extends React.Component<BaseOverlayProps> {

    static ID:string = "checklistOverlay";

    static show($name:string, $data:ChecklistData){
        showOverlay($name, ChecklistOverlay.ID,{data:$data});
    }
    static hide($name:string){        
        hideOverlay($name, ChecklistOverlay.ID,{});
    }
    _onBGClick=()=>{
        this._close();
    }
    _close=()=>{
        ChecklistOverlay.hide(this.props.data.name);
    }
    _onHeaderClose=()=>{
        this._close();
    }
    render() {

        let data:ChecklistData = this.props.data.details.data;

        

        return (
            <Overlay 
                state={this.props.data.state} 
                id={ChecklistOverlay.ID} 
                zIndex={466} 
                onBGClick={this._onBGClick} 
                headerClose={this._onHeaderClose}
                headerTitle={(
                    <>
                        <UITitle title={data.name}/>
                        <div className="checklistInfo">
                            <div className="opsRole">{data.firstOpRoleName}</div>
                            <div className="steps">{data.checklistItems.length} Steps</div>
                        </div>
                    </>
                )}
                headerIncidentIconTypeId={data.firstIncidentTypeId}
                mediumMaxWidth
            >
                <div className="checklistContent">
                    <div className="checklistSteps">
                        {data.checklistItems.map(($checklistItem, $index)=>{
                            return (
                                <UIChecklistStepIcon key={"checklistStep"+$index+$checklistItem.checklistItemId} step={($index+1)} label={$checklistItem.checklistItem}/>
                            )
                        })}
                    </div>
                </div>
            </Overlay>
        );
    }
}
