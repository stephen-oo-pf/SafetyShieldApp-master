import * as React from 'react';
import UIIconWLabel from '../../../../ui/UIIconWLabel';
import DrillsView from './DrillsView';

import baselineSpeakerPhone from '@iconify/icons-ic/baseline-speaker-phone';
import checkIcon from '@iconify/icons-mdi/check';
import './UIDrillStatusIcon.scss';

export interface IUIDrillStatusIconProps {
    status:string;
    stepsRemaining?:number;
    showStepsRemaining?:boolean;
    awaitingSubmission?:boolean;
    customLabel?:string;
    hideLabel?:boolean;
}

export default class UIDrillStatusIcon extends React.Component<IUIDrillStatusIconProps> {
    
    static STATUS_CODE_NOT_STARTED:string = "P";
    static STATUS_CODE_STARTED:string = "I";
    static STATUS_CODE_COMPLETED:string = "C";

    static getStatusCodeLabel($code:string){

        let label:string = "";

        switch($code){
            case this.STATUS_CODE_NOT_STARTED:
                label = "Not Started";
            break;
            case this.STATUS_CODE_STARTED:
                label = "Started";
            break;
            case this.STATUS_CODE_COMPLETED:
                label = "Completed";
            break;
        }
        return label;
    }


    static getStatusCodeIcon($code:string){

        let icon:object= {};

        switch($code){
            case this.STATUS_CODE_NOT_STARTED:
                icon = DrillsView.ICON
            break;
            case this.STATUS_CODE_STARTED:
                icon = baselineSpeakerPhone;
            break;
            case this.STATUS_CODE_COMPLETED:
                icon = checkIcon;
            break;
        }
        return icon;
    }
    

    render() {

        let icon:object= UIDrillStatusIcon.getStatusCodeIcon(this.props.status);
        let label:string = UIDrillStatusIcon.getStatusCodeLabel(this.props.status);
        let strCN:string = "drillStatusIcon status_"+this.props.status;

        switch(this.props.status){
            case UIDrillStatusIcon.STATUS_CODE_STARTED:
                if(this.props.showStepsRemaining){
                    label = this.props.stepsRemaining+" steps remaining";
                    if(this.props.awaitingSubmission){
                        label ="Awaiting Submission.";
                    }
                }
            break;
        }

        if(this.props.customLabel){
            label = this.props.customLabel;
        }
        if(this.props.hideLabel){
            label = "";
        }

        return (
            <UIIconWLabel
                icon={icon}
                label={label}
                extraClassName={strCN}
            />
        );
    }
}
