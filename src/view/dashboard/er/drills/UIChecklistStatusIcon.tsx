import * as React from 'react';
import UIDrillStatusIcon from './UIDrillStatusIcon';
import { IIncidentChecklistUserChecklist } from '../../../../data/IncidentData';

export interface IUIChecklistStatusIconProps {
    data:IIncidentChecklistUserChecklist;
}

export default class UIChecklistStatusIcon extends React.Component<IUIChecklistStatusIconProps> {
    render() {


        let showStepsRemaining:boolean=false;
        switch(this.props.data.status){
            case "I":
            showStepsRemaining=true;
            break;
        }

        
        let numStepsRemaining:number=0;
        let numStepsDone:number=0;
        this.props.data.checklistItems.forEach(($checklistItem)=>{
            if($checklistItem.doneFlag){
                numStepsDone++;
            }else{
                numStepsRemaining++;
            }
        });

        let awaitingSubmission:boolean = this.props.data.checklistItems.length===numStepsDone;


        return (
            <UIDrillStatusIcon status={this.props.data.status} stepsRemaining={numStepsRemaining} showStepsRemaining={showStepsRemaining} awaitingSubmission={awaitingSubmission}/>
        );
    }
}
