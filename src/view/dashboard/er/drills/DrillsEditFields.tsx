import * as React from 'react';
import UIEditFields from '../../../../ui/UIEditFields';
import { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import User from '../../../../data/User';
import UIIncidentTypeDropDown from '../../../../ui/UIIncidentTypeDropDown';
import { IDrillData } from '../../../../data/DrillData';
import UIInputDate from '../../../../ui/UIInputDate';
import UIInputTime from '../../../../ui/UIInputTime';

export interface IDrillsEditFieldsProps {
    mode:string;
    data?:IDrillData;
}

export interface IDrillsEditFieldsState {
    
    validationError?:string;
    incidentTypeId:string;
    date:Date | undefined;
    time:string | undefined;
    [key:string]:any;
}

export default class DrillsEditFields extends React.Component<IDrillsEditFieldsProps, IDrillsEditFieldsState> {
    constructor(props: IDrillsEditFieldsProps) {
        super(props);


        let incidentTypeId:string = "";
        let date:Date | undefined = undefined;
        let time:string | undefined = undefined;
        

        if(this.props.data){
            incidentTypeId = this.props.data.entryDetails.incidentTypeId;
            let entrydate:Date = new Date(this.props.data.entryDts*1000);

            date = entrydate;

            time = entrydate.getHours()+":"+entrydate.getMinutes();
        }

        this.state = {
            incidentTypeId:incidentTypeId,
            date:date,
            time:time,
        }
    }
    
    _onErrorClose=()=>{
        this.setState({validationError:undefined});
    }

    _onInputChange=($value:string, $name?:string)=>{

        if($name){
            let newstate:any = {}
            newstate[$name] = $value;
            this.setState(newstate);
        }
    }
    _onDateChange=($date:Date)=>{
        this.setState({date:$date});
    }
    _onTimeChange=($date:string)=>{
        this.setState({time:$date});
    }
    
    validate(){
        if(this.state.incidentTypeId===""){
            this.setState({validationError:"You must choose an Event Type."});
            return false;
        }
        if(!this.state.date){
            this.setState({validationError:"You must choose Date."});
            return false;
        }
        
        if(!this.state.time){
            this.setState({validationError:"You must choose Time."});
            return false;
        }


        return true;
    }


    render() {

        let orgName:string = "";

        switch(this.props.mode){
            case UIDetailFrame.MODE_NEW:
                orgName = User.selectedOrg.orgName;
            break;
        }

        if(this.props.data){
            orgName = this.props.data.orgName;
        }


        let maxDate:Date = new Date();
        maxDate.setFullYear(maxDate.getFullYear()+1);
        
        let minDate:Date = new Date();

        return (
            <UIEditFields         
                validationError={this.state.validationError}
                onValidationErrorClose={this._onErrorClose}
                >
                <UIViewFieldsItem
                    title={<>Schedule Drill For</>} 
                    value={orgName}
                    fullWidth
                />  
                <UIViewFieldsItem 
                    extraClassName="incidentTypeId"
                    title={<>Event Type <span className="required">*</span></>} 
                    value={<UIIncidentTypeDropDown notSelectedValue="Select an Event Type" incidentTypeId={this.state.incidentTypeId} onItemSelected={this._onInputChange} />}
                />
                <UIInputDate
                    value={this.state.date}
                    onChange={this._onDateChange}
                    maxDate={maxDate}
                    minDate={minDate}
                    
                >
                    <p>Drills can be scheduled up to one year in advanced.</p>
                </UIInputDate>
                <UIInputTime
                    value={this.state.time}
                    onChange={this._onTimeChange}
                    
                />
            </UIEditFields>
        );
    }
}
