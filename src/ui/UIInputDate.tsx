import * as React from 'react';

import DatePicker from 'react-date-picker';
import './UIInputDate.scss';
import { UIViewFieldsItem } from './UIViewFields';


import closeIcon from '@iconify/icons-mdi/close';

import calendarToday from '@iconify/icons-mdi/calendar-today';
import UIIcon from './UIIcon';
import UICalendar from './UICalendar';
import FormatUtil from '../util/FormatUtil';

export interface IUIInputDateProps {
    value?:Date;
    maxDate?:Date;
    minDate?:Date;
    onChange:($value:Date)=>void;
}

export interface IUIInputDateState {
    focused?:boolean;
}




export default class UIInputDate extends React.Component<IUIInputDateProps,IUIInputDateState> {

    constructor($props:IUIInputDateProps){
        super($props);

        this.state = {

        }
    }

    _onChange=($date:Date | Date[])=>{
        this.props.onChange($date as Date);
    }
    _onCalendarOpen=()=>{
        this.setState({focused:true});
    }
    _onCalendarClose=()=>{
        this.setState({focused:false});
        
    }
    render() {

        let baseCalendarProps:any = UICalendar.generateCalendarProps();

        
        return (
            <UIViewFieldsItem
                extraClassName="inputDate calendarStyle"
                title={<>Date <span className="required">*</span></>} 
                focused={this.state.focused}
                value={(
                    <>
                        <DatePicker
                            minDate={this.props.minDate}
                            maxDate={this.props.maxDate}
                            navigationAriaLabel="Date"
                            
                            calendarType="US"
                            value={this.props.value}
                            onChange={this._onChange}
                            onCalendarOpen={this._onCalendarOpen}
                            onCalendarClose={this._onCalendarClose}
                            {...baseCalendarProps}
                            tileClassName={({date})=>{
                                let strCN:string = "";
                                if(this.props.value){
                                    if(date.getFullYear()===this.props.value.getFullYear() && date.getMonth()===this.props.value.getMonth() && date.getDate()===this.props.value.getDate()){
                                        strCN = "selectedDate";
                                    }
                                }

                                return strCN;
                            }}
                            monthPlaceholder="mm"
                            dayPlaceholder="dd"
                            yearPlaceholder="yyyy"
                            calendarIcon={(<UIIcon icon={calendarToday}/>)}
                            clearIcon={<UIIcon icon={closeIcon}/>}
                        />
                        {this.props.children}
                    </>
                )}
            />
        );
    }
}
