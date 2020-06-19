import * as React from 'react';
import UIWhiteBox from '../../../../ui/UIWhiteBox';
import UIDrillStatusIcon from './UIDrillStatusIcon';
import UIProgressBar from '../../../../ui/UIProgressBar';
import { IIncidentChecklist, countIncidentChecklistStats } from '../../../../data/IncidentData';
import './UIDrillStatusBar.scss';
import UIPopup from '../../../../ui/UIPopup';

export interface IUIDrillStatusBarProps {
    data:IIncidentChecklist;
    
}

export interface IUIDrillStatusBarState {
    showPopup:boolean;
    
}
export default class UIDrillStatusBar extends React.Component<IUIDrillStatusBarProps,IUIDrillStatusBarState> {

    constructor($props:IUIDrillStatusBarProps){
        super($props);
        this.state = {
            showPopup:false
        }
    }
    _onClickBar=()=>{
        this._toggle();
    }
    _toggle=()=>{
        if(this.state.showPopup){
            this.setState({showPopup:false});
        }else{            
            this.setState({showPopup:true});
        }
    }
    _onClosePopup=()=>{
        this.setState({showPopup:false});
    }
    render() {

        let statsCounted = countIncidentChecklistStats(this.props.data);

        let numTotal:number = statsCounted.total;
        let numComplete:number = statsCounted.completed;
        let numStarted:number = statsCounted.started;

        //$data.stats
        let numPerCompleted:number = numComplete/numTotal;
        let numPerStartedAndCompleted:number = (numStarted+numComplete)/numTotal;



        return (
            <div className="drillStatusBar">
                <div className="drillStatusProgressBar" onClick={this._onClickBar}>
                    <UIProgressBar extraClassName="perStarted" percent={numPerStartedAndCompleted} style={UIProgressBar.STYLE_ROUNDED_BLUE_YELLOW}/>
                    <UIProgressBar extraClassName="perCompleted" percent={numPerCompleted} style={UIProgressBar.STYLE_ROUNDED_GREEN_TRANSPARENT}/>
                </div>
                <p onClick={this._onClickBar}>{Math.round(numPerCompleted*100)} % Completed</p>
                <UIPopup
                    extraClassName="drillStatusInfoPopup"
                    showing={this.state.showPopup}
                    onClose={this._onClosePopup}
                    closeBtn
                    >
                    <div className="infoItems">
                        <UIDrillStatusIcon status={UIDrillStatusIcon.STATUS_CODE_COMPLETED} customLabel={numComplete+" Complete"}/>
                        <UIDrillStatusIcon status={UIDrillStatusIcon.STATUS_CODE_STARTED} customLabel={numStarted+" Started"}/>
                        <UIDrillStatusIcon status={UIDrillStatusIcon.STATUS_CODE_NOT_STARTED} customLabel={(numTotal-(numStarted+numComplete))+" Not Started"}/>
                    </div>
                    <div className="total">
                        Total: {numTotal}
                    </div>
                </UIPopup>
            </div>
        );
    }
}
