import React from 'react';
import Widget from './Widget';
import Api, { IErrorType } from '../../../../api/Api';
import './DrillWidget.scss';
import { IDrillData } from '../../../../data/DrillData';
import UIDrillCalendar from '../../er/drills/UIDrillCalendar';
import DrillsView from '../../er/drills/DrillsView';
import { Link } from 'react-router-dom';
import UIButton from '../../../../ui/UIButton';

import calendarToday from '@iconify/icons-mdi/calendar-today';

export interface IDrillWidgetProps {
}

export interface IDrillWidgetState {
    loading:boolean;
    error?:IErrorType;
    data?:IDrillData[];

}

export default class DrillWidget extends React.Component<IDrillWidgetProps, IDrillWidgetState> {

    static ID:string = "drillWidget";


    constructor(props: IDrillWidgetProps) {
        super(props);

        this.state = {
            loading:true,
        }
    }

    componentDidMount(){
        Api.calendarManager.getList(($success:boolean, $results:any)=>{
            if($success){
                let drills:IDrillData[] = [];
                if($results){
                    drills = $results;
                }
                this.setState({loading:false, data:drills});

            }else{
                this.setState({loading:false, error:$results});
            }
        });
    }
    render() {

        let isOk:boolean = (!this.state.loading && !this.state.error);
        
        
        let jsxContent = <></>;

        if(isOk && this.state.data){

            jsxContent= (
                <>
                    <UIDrillCalendar data={this.state.data}/>
                    <UIButton fullWidth label="VIEW SCHEDULE" path={DrillsView.PATH} horizontalAlign={UIButton.ALIGN_CENTER} size={UIButton.SIZE_SMALL} icon={calendarToday} iconOnLeft color={UIButton.COLOR_LIGHTPURPLE}/>
                </>
            );

        }

        return (
            <Widget id={DrillWidget.ID} label="Drill Schedule" loading={this.state.loading} error={this.state.error} useWhiteBoxForContent>
                {jsxContent}
            </Widget>
        );
    }
}
