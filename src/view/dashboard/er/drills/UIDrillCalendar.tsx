import * as React from 'react';
import UICalendar, { ICalendarContentTile } from '../../../../ui/UICalendar';
import { IDrillData } from '../../../../data/DrillData';
import FormatUtil from '../../../../util/FormatUtil';
import UIPopup from '../../../../ui/UIPopup';
import './UIDrillCalendar.scss';
import UIDrillCalendarPopup from './UIDrillCalendarPopup';
export interface IUIDrillCalendarProps {
    data?:IDrillData[];
}

export interface IUIDrillCalendarState {
    selectedDate?:Date;
    lastSelectedDate?:Date;
}

export default class UIDrillCalendar extends React.Component<IUIDrillCalendarProps, IUIDrillCalendarState> {


    calendar:React.RefObject<UICalendar> = React.createRef();
    
    constructor(props: IUIDrillCalendarProps) {
        super(props);

        this.state = {

        }
    }



    _calendarTileContent:ICalendarContentTile = ($props:{date:Date,view:string})=>{

        let tileExtraContent:JSX.Element = <></>;
        if(this.state.selectedDate){

            if(FormatUtil.isSameDateDay($props.date,this.state.selectedDate) && this.props.data){

                let matchingDrills = this.props.data.filter(($drill)=>{
                    let match:boolean=false;
                    if(FormatUtil.isSameDateDay(new Date(Number($drill.entryDts)*1000),this.state.selectedDate!)){
                        match=true;
                    }
                    return match;
                });

                if(matchingDrills.length>0){
                    tileExtraContent = (<UIDrillCalendarPopup data={matchingDrills} onClose={this._onCalendarPopupClose}/>)
                }

            }
        }

        return (
            <>
                <div className="dayHitArea" onClick={()=>{
                    this._onClickDay($props.date);
                }}/>
                {tileExtraContent}
            </>
        );
    }
    _onClickDay=($date:Date)=>{

        let date:Date | undefined = $date;

        let lastSelectedDate:Date | undefined = undefined;

        if(this.state.selectedDate){
            //if clicking the same selected date, set undefined so we can deselect it.
            if(FormatUtil.isSameDateDay(this.state.selectedDate,date)){
                lastSelectedDate = new Date(date.valueOf());
                date = undefined;
            }
        }

        this.setState({selectedDate:date, lastSelectedDate:lastSelectedDate});

    }
    _onCalendarPopupClose=()=>{

        let lastSelectedDate:Date | undefined = undefined;
        if(this.state.selectedDate){
            lastSelectedDate = this.state.selectedDate;
        }

        this.setState({selectedDate:undefined, lastSelectedDate:lastSelectedDate});
        
    }

    render() {


        
        let dates:Date[] | undefined = undefined;
        if(this.props.data){
            dates = this.props.data.map(($drill)=>{
                return new Date($drill.entryDts*1000);
            });
        }

        let keyExtra = "";
        if(this.state.selectedDate){
            keyExtra+="_selected_"+(this.state.selectedDate.getFullYear()+"-"+this.state.selectedDate.getMonth()+"-"+this.state.selectedDate.getDate());
        }

        let defaultValue:Date | undefined = undefined;
        if(this.state.lastSelectedDate){
            defaultValue = this.state.lastSelectedDate;
        }
        if(this.state.selectedDate){
            defaultValue = this.state.selectedDate;
        }

        return (            
            <UICalendar defaultValue={defaultValue} ref={this.calendar} key={"drillCalendar"+keyExtra} calendarClassName={"drillCalendar"} selectedDates={dates} tileContent={this._calendarTileContent}/>
        );
    }
}
