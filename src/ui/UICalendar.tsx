import * as React from 'react';
import UIIcon from './UIIcon';
import Calendar from 'react-calendar';
import chevronLeft from '@iconify/icons-mdi/chevron-left';
import chevronRight from '@iconify/icons-mdi/chevron-right';
import chevronDoubleLeft from '@iconify/icons-mdi/chevron-double-left';
import chevronDoubleRight from '@iconify/icons-mdi/chevron-double-right';
import FormatUtil from '../util/FormatUtil';
import './UICalendar.scss';

export type ICalendarContentTile = (props: {date:Date,view:string}) => JSX.Element;


export interface IUICalendarProps {
    defaultValue?:Date | Date[];
    selectedDates?:Date[];
    tileContent?:ICalendarContentTile;
    onClickDay?:($date:Date)=>void;
    calendarClassName?:string;
}



export default class UICalendar extends React.Component<IUICalendarProps> {


    static generateCalendarProps():any{
        return {
            nextLabel:(<UIIcon icon={chevronRight}/>),
            next2Label:(<UIIcon icon={chevronDoubleRight}/>),
            prevLabel:(<UIIcon icon={chevronLeft}/>),
            prev2Label:(<UIIcon icon={chevronDoubleLeft}/>),
            //maxDetail:"year",

            minDetail:"month",
            formatShortWeekday:($locale:string,$date:Date)=>{
                return FormatUtil.dateDOTW($date).substr(0,1);
            }
        }
    }

    _onClickDay=($date:Date)=>{
        if(this.props.onClickDay){
            this.props.onClickDay($date);
        }
    }

    render() {

        let strCalendarCN:string = "";
        if(this.props.calendarClassName){
            strCalendarCN+=" "+this.props.calendarClassName;
        }

        return (
            <div className="calendarStyle">
                <Calendar className={strCalendarCN}
                    calendarType="US"
                    defaultValue={this.props.defaultValue}
                    tileClassName={({date, view})=>{
                        let strCN:string = "";
                        let contains = false;                        
                        if(this.props.selectedDates){
                            contains = this.props.selectedDates.some(($selectedDate)=>{
                                let match:boolean=false;

                                if(FormatUtil.isSameDateDay(date,$selectedDate)){
                                    match=true;
                                }

                                return match;
                            });
                        }

                        if(contains){
                            strCN+="selectedDate";
                        }

                        return strCN
                    }}
                    selectRange={false}
                    tileContent={this.props.tileContent}
                    onClickDay={this._onClickDay}
                    
                    {...UICalendar.generateCalendarProps()}
                />
            </div>
        );
    }
}

