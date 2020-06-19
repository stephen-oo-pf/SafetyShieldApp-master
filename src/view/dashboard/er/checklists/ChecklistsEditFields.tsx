import React from 'react';
import UIEditFields from '../../../../ui/UIEditFields';
import ChecklistData, { IChecklistItemData } from '../../../../data/ChecklistData';
import UIInput from '../../../../ui/UIInput';
import UIIncidentTypeDropDown from '../../../../ui/UIIncidentTypeDropDown';
import { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import User from '../../../../data/User';
import UIInputDDList from '../../../../ui/UIInputDDList';

export interface IChecklistsEditFieldsProps {
    data?:ChecklistData;
}
export interface IChecklistsEditFieldsState {
    name:string;
    opsRoleId:string;
    incidentTypeId:string;
    appliesTo:string;
    checklistItems:IChecklistItemData[];
    validationError:string;
    [key:string]:any;
}

export default class ChecklistsEditFields extends React.Component<IChecklistsEditFieldsProps,IChecklistsEditFieldsState> {



    stepList:React.RefObject<UIInputDDList> = React.createRef();
    stepList2:React.RefObject<UIInputDDList> = React.createRef();

    constructor($props:IChecklistsEditFieldsProps){
        super($props);


        
        let name:string = "";
        let opsRoleId:string = "";
        let incidentTypeId:string = "";
        let appliesTo:string = ChecklistData.APPLIES_TO_SELF;
        let checklistItems:IChecklistItemData[] = [];

        if(this.props.data){
            name = this.props.data.name;
            opsRoleId = this.props.data.firstOpRole.opsRoleId;
            incidentTypeId = this.props.data.firstIncidentTypeId;
            appliesTo = this.props.data.appliesTo;
            checklistItems = this.props.data.checklistItems;
        }

        this.state = {
            name:name,    
            opsRoleId:opsRoleId,
            incidentTypeId:incidentTypeId,     
            appliesTo:appliesTo,
            checklistItems:checklistItems,
            validationError:"",
        }
    }

    
    validate(){
        let isValid:boolean=true;
        if(this.state.name===""){
            isValid=false;
            this.setState({validationError:"You must enter a Name."});
            return isValid;
        }
        if(this.state.incidentTypeId===""){
            isValid=false;
            this.setState({validationError:"You must choose an Event Type."});
            return isValid;
        }
        if(this.state.opsRoleId===""){
            isValid=false;
            this.setState({validationError:"You must choose an Operational Role."});
            return isValid;
        }

        if(this.stepList.current){

            if(this.stepList.current.state.items.length===0){
                isValid=false;
                this.setState({validationError:"You must add steps to the checklist."});
                return isValid;
            }

            let blankitem:boolean=false;

            let checklistSteps:IChecklistItemData[] = this.stepList.current.state.items.map(($value)=>{

                if($value.value===""){
                    blankitem=true;
                }
                let item:IChecklistItemData = {
                    checklistItem:$value.value,
                    checklistItemId:$value.id
                }
                return item;
            });

    
            if(blankitem){
                isValid=false;
                this.setState({validationError:"Checklist steps cannot be blank."});
            }else{
                this.setState({checklistItems:checklistSteps});
            }
        }

        return isValid;
    }


    _onInputChange=($value:string, $name?:string)=>{
        let data:{[key:string]:any} = {};
        data[$name!] = $value;
        this.setState(data);
    }
    _onErrorClose=()=>{
        this.setState({validationError:""});
    }

    render() {


        let showAppliesToDD:boolean=false;
        if(User.selectedOrg.isAccount && User.selectedOrg.children.length>0){
            showAppliesToDD=true;
        }
        if(User.selectedOrg.isAccount){

        }

        let applesToOptions = ChecklistData.OPTIONS_FOR_APPLIES_TO.filter(($appliesTo)=>{
            let isOk:boolean=true;
            if(User.selectedOrg.isAccount){
                if($appliesTo.value==="Schild"){
                    isOk=false;
                }
            }

            return isOk;
        });

        return (
            <UIEditFields
                extraClassName="checklistEditFields"                
                validationError={this.state.validationError}
                onValidationErrorClose={this._onErrorClose}
            >
                <UIInput fieldItem extraClassName="name" isRequired showTitleAsLabel type="textfield" name="name" title="Name" value={this.state.name} onChange={this._onInputChange}/>
                <UIViewFieldsItem 
                    extraClassName="incidentTypeId"
                    title={<>Event Type <span className="required">*</span></>} 
                    value={<UIIncidentTypeDropDown notSelectedValue="Select an Event Type" incidentTypeId={this.state.incidentTypeId} onItemSelected={this._onInputChange} />}
                />
                <UIInput fieldItem options={User.state.opsRolesAsUIOptions} extraClassName="opsRoleId" isRequired showTitleAsLabel type="select" name="opsRoleId" title="Operational Role" value={this.state.opsRoleId} onChange={this._onInputChange}/>
                {showAppliesToDD && (
                    <UIInput fieldItem options={applesToOptions} extraClassName="appliesTo" isRequired showTitleAsLabel type="select" name="appliesTo" title="Applies To" value={this.state.appliesTo} onChange={this._onInputChange}/>
                )}
                <div/>
                <UIViewFieldsItem 
                    fullWidth
                    extraClassName="steps"
                    title={<>Steps <span className="required">*</span></>} 
                    value={(
                        <>
                        <UIInputDDList
                                        ref={this.stepList}
                                        itemPlaceholder="Enter Step Description"
                                        emptyPlaceholder="Add a step to create a checklist."
                                        initItems={this.state.checklistItems.map(($value,$index)=>{
                                            return {value:$value.checklistItem, id:$value.checklistItemId}
                                    })}/>
                        </>
                    )}
                />
            </UIEditFields>
        );
    }
}
