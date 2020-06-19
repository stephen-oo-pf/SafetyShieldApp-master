import React from 'react';
import UIEditFields from '../../../../ui/UIEditFields';
import { IBroadcastData } from '../../../../data/BroadcastData';
import { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import UIIncidentTypeDropDown from '../../../../ui/UIIncidentTypeDropDown';
import UIInput from '../../../../ui/UIInput';
import User from '../../../../data/User';

export interface IBNEditFieldsProps {
    data?:IBroadcastData;
}

export interface IBNEditFieldsState {
    validationError:string;
    incidentTypeId:string;
    broadcastId:string;
    incidentStatusId:string;
    username:string;
    [key:string]:any;
}

export default class BNEditFields extends React.Component<IBNEditFieldsProps, IBNEditFieldsState> {
    constructor(props: IBNEditFieldsProps) {
        super(props);



        let incidentTypeId:string = "";
        let broadcastId:string = "";
        let incidentStatusId:string = "";
        let username:string = "";
        if(this.props.data){
            incidentTypeId = this.props.data.incidentTypeId;
            incidentStatusId = this.props.data.incidentStatusId;
            broadcastId = this.props.data.broadcastId;
            username = this.props.data.username;
        }


        this.state = {
            validationError:"",
            incidentTypeId:incidentTypeId,
            broadcastId:broadcastId,
            incidentStatusId:incidentStatusId,
            username:username,
        }
    }

    _onClearValidationError=()=>{
        this.setState({validationError:""});
    }
    _onIncidentDropDownChange=($value:string, $name?:string)=>{
        this.setState({incidentTypeId:$value});
    }
    _onInputChange=($value:string, $name?:string)=>{
        let state:any = {};
        if($name){
            state[$name] = $value;
        }
        this.setState(state);
    }
    _onBroadcastChange=($value:string, $name?:string)=>{
        let broadcast = User.selectedOrg.getBroadcastListItem($value)!;
        if(broadcast){
            this.setState({broadcastId:$value, username:broadcast.username});
        }
    }

    validate(){
        if(this.state.incidentTypeId===""){
            
            this.setState({validationError:"You must select an Event Type"});
            return false;
        }
        if(this.state.incidentStatusId===""){
            this.setState({validationError:"You must select when it is sent."});
            return false;
        }
        if(this.state.broadcastId===""){
            this.setState({validationError:"You must select a Broadcast Name."});
            return false;
        }
        return true;
    }


    render() {
        return (
            <UIEditFields validationError={this.state.validationError} onValidationErrorClose={this._onClearValidationError}>
                <UIViewFieldsItem 
                    title={(
                        <> 
                            Event Type<span className="required">*</span>
                        </>
                    )} 
                    value={(
                        <UIIncidentTypeDropDown
                            notSelectedValue={"Select"}
                            onItemSelected={this._onIncidentDropDownChange}
                            incidentTypeId={this.state.incidentTypeId}
                        />
                    )}
                />
                <UIInput fieldItem isRequired showTitleAsLabel title="Sent when..." name="incidentStatusId" onChange={this._onInputChange} type="select" options={User.state.incidentStatusesAsUIOptions} value={""+this.state.incidentStatusId} />
                <UIInput fieldItem fullWidth isRequired showTitleAsLabel title="SchoolMessenger Broadcast Name" name="broadcastId" onChange={this._onBroadcastChange} type="select" options={User.selectedOrg.broadcastListAsUIOptions} value={""+this.state.broadcastId} />
            </UIEditFields>
        );
    }
}
