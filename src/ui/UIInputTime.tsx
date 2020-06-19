import * as React from 'react';
import { UIViewFieldsItem } from './UIViewFields';
import './UIInputTime.scss';
import UIIcon from './UIIcon';
import closeIcon from '@iconify/icons-mdi/close';
import clockOutline from '@iconify/icons-mdi/clock-outline';


//this import is fake... see Make3rdPartyLikeTS.d.ts
import TimePicker from 'react-time-picker';

export interface IUIInputTimeProps {
    value?:string;
    onChange:($date:string)=>void;
}
export interface IUIInputTimeState {
    focused?:boolean;

}

export default class UIInputTime extends React.Component<IUIInputTimeProps,IUIInputTimeState> {

    
    constructor($props:IUIInputTimeProps){
        super($props);

        this.state = {

        }
    }

    _onChange=($date:string)=>{
        this.props.onChange($date);
    }

    _onClockOpen=()=>{
        this.setState({focused:true});
    }
    _onClockClose=()=>{
        
        this.setState({focused:false});
    }
    render() {
        let strCN:string = "inputTime";

        return (
            <UIViewFieldsItem
                extraClassName={strCN}
                title={<>Time <span className="required">*</span></>} 
                focused={this.state.focused}
                value={(
                    <>
                        <TimePicker
                            disableClock={true}// LOL
                            size={235}
                            amPmAriaLabel="Select AM/PM"
                            hourPlaceholder="hh"
                            minutePlaceholder="mm"
                            
                            clearIcon={<UIIcon icon={closeIcon}/>}
                            clockIcon={<UIIcon icon={clockOutline}/>}
                            onChange={this._onChange}
                            value={this.props.value}     
                            renderNumbers={true}    
                            renderMinuteMarks={false}    
                            hourMarksWidth={0}  
                            hourHandWidth={6}
                            onClockOpen={this._onClockOpen}
                            onClockClose={this._onClockClose}
                            minuteHandWidth={2}

                            
                        />
                        {this.props.children}
                    </>
                )}
            />
        );
    }
}
