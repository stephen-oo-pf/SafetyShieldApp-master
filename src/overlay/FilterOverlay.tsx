import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { hideOverlay, showOverlay } from './OverlayController';
import UIButton from '../ui/UIButton';
import './FilterOverlay.scss';
import filterVariant from '@iconify/icons-mdi/filter-variant';
import UIEditFields from '../ui/UIEditFields';
import { UIViewFieldsItem } from '../ui/UIViewFields';
import UICheckbox from '../ui/UICheckbox';
import { getIncidentTypeById, getIncidentTypeByLabel, IIncidentTypeData } from '../data/IncidentData';
import UIInput from '../ui/UIInput';
import User from '../data/User';


interface FilterOverlayState{
    selectedTags:FilterTagGroup[];
}

export interface FilterTagGroup{
    label:string;
    property:string;
    tags:string[];
    displayAs?:string;
}

export function createOpsRolesTagGroup($property:string){
    return {
        property:$property,
        label:"Operational Role",
        tags:User.state.opsRoles.filter(($opsRole)=>{
            let isOk:boolean=false;
            if($opsRole.orgTypeId==="" || $opsRole.orgTypeId===null){
                isOk=true;
            }
            if(User.selectedOrg.orgTypeId===$opsRole.orgTypeId){
                isOk=true;
            }
            return isOk;
        }).map(($role)=>{
            return $role.opsRole;
        }),
    }
}


export function createBlankFilterTagGroups($filterTagGroups:FilterTagGroup[]):FilterTagGroup[]{
    return $filterTagGroups.map(($group:FilterTagGroup)=>{
        return {
            label:$group.label,
            property:$group.property,
            tags:[],
            displayAs:$group.displayAs,
        }
    });
}

export default class FilterOverlay extends React.Component<BaseOverlayProps, FilterOverlayState> {

    static ID:string = "filterOverlay";

    static DISPLAY_AS_DEFAULT:string = "default";
    static DISPLAY_AS_INCIDENT_TYPES:string = "incidentTypes";
    static DISPLAY_AS_DROP_DOWN:string = "dropDown";


    constructor($props:BaseOverlayProps){
        super($props);


        //map to blank for selected placeholders
        let initialTags:FilterTagGroup[] = createBlankFilterTagGroups(this.props.data.details.filterTags)

        //override if selected exists... so lets find matching inittags for each selected
        this.props.data.details.selectedTags.forEach(($tag:FilterTagGroup)=>{
            let match = initialTags.find(($initTag)=>{
                return $initTag.label===$tag.label;
            });
            //if found copy its tags.
            if(match){
                match.tags = [...$tag.tags];
            }
        });


        this.state = {
            selectedTags:initialTags
        }
    }

    static show($name:string, $filterTags:FilterTagGroup[], $selectedTags:FilterTagGroup[], $complete:($selectedTags:FilterTagGroup[])=>void){
        showOverlay($name, FilterOverlay.ID,{complete:$complete, filterTags:$filterTags, selectedTags:$selectedTags});
    }
    static hide($name:string){        
        hideOverlay($name, FilterOverlay.ID,{});
    }
    _onBGClick=()=>{
        this._hide();
    }
    _onNo=()=>{
        this._hide();        
    }
    _onYes=()=>{
        this.props.data.details.complete(this.state.selectedTags);
        this._hide();
    }
    _onReset=()=>{


        this.setState({selectedTags:createBlankFilterTagGroups(this.props.data.details.filterTags)});
    }
    _hide=()=>{
        FilterOverlay.hide(this.props.data.name);
    }
    _onGroupChange=($data:FilterTagGroup,$index:number)=>{
        let tagGroups = [...this.state.selectedTags];

        tagGroups.splice($index,1,$data);

        this.setState({selectedTags:tagGroups});

    }
    render() {

        
        let footerContent = (<>
            <UIButton extraClassName="btnReset" size={UIButton.SIZE_SMALL} onClick={this._onReset} color={UIButton.COLOR_TRANSPARENT_PURPLE} label="Reset Filters"/>
            <UIButton extraClassName="btnNo" size={UIButton.SIZE_SMALL} onClick={this._onNo} color={UIButton.COLOR_TRANSPARENT_PURPLE} label="Cancel"/>
            <UIButton extraClassName="btnYes" size={UIButton.SIZE_SMALL} onClick={this._onYes} label="Apply"/>
        </>);

        let numCount:number = this.state.selectedTags.reduce(($prev,$tag)=>{
            return $prev+$tag.tags.length;
        },0);

        let strTitle:string = "Filters ("+numCount+")";

        return (
            <Overlay 
                state={this.props.data.state} 
                id={FilterOverlay.ID} 
                zIndex={504} 
                onBGClick={this._onBGClick} 
                footerContent={footerContent} 
                headerTitle={strTitle}
                headerIcon={filterVariant}
                mediumLargeMaxWidth
                headerClose={this._hide}
            >
                <UIEditFields>
                    {this.props.data.details.filterTags.map(($group:FilterTagGroup,$index:number)=>{

                        let selectedMatch = this.state.selectedTags.find(($selectedGroup)=>{
                            return $selectedGroup.label===$group.label;
                        });

                        return (
                            <FilterOverlayGroup key={$index+$group.label} data={$group} selectedData={selectedMatch} index={$index} onChange={this._onGroupChange}/>
                        )
                    })}
                </UIEditFields>                
            </Overlay>
        );
    }
}

interface IFilterOverlayGroupProps {
    data:FilterTagGroup;
    index:number;
    selectedData?:FilterTagGroup;
    onChange:($data:FilterTagGroup,$index:number)=>void;
}


class FilterOverlayGroup extends React.Component<IFilterOverlayGroupProps> {
    _onCheckboxChange=($value:boolean, $name?:string)=>{

       
        let foundIndex = -1;
        
        let tags:string[] = [];

        if(this.props.selectedData){
            
            tags = [...this.props.selectedData.tags];

            foundIndex = tags.findIndex(($selectedTag)=>{
                return $name===$selectedTag;
            });

        }
        
        if($value){
            //add
            if(foundIndex===-1){
                tags.push($name!);
            }
        }else{
            //remove
            if(foundIndex!==-1){
                tags.splice(foundIndex,1);
            }
        }

        let data:FilterTagGroup = {
            label:this.props.data.label,
            property:this.props.data.property,
            displayAs:this.props.data.displayAs,
            tags:tags
        }

        this.props.onChange(data,this.props.index);


    }

    _onSelectChange=($value:string, $name?:string)=>{


        let tags:string[] = [];
        if($value){
            tags.push($value);
        }

        let data:FilterTagGroup = {
            label:this.props.data.label,
            property:this.props.data.property,
            displayAs:this.props.data.displayAs,
            tags:tags
        }

        this.props.onChange(data,this.props.index);
    }


    render() {

        let checkCount:number=0;
        let content:JSX.Element | JSX.Element[] = <></>;
        
        let displayAs:string = FilterOverlay.DISPLAY_AS_DEFAULT;
        if(this.props.data.displayAs){
            displayAs = this.props.data.displayAs;
        }
        
        switch(displayAs){
            case FilterOverlay.DISPLAY_AS_DROP_DOWN:


                let selectedValue:string = "";
                
                if(this.props.selectedData && this.props.selectedData.tags.length>0){
                    checkCount=1;
                    selectedValue = this.props.selectedData.tags[0];//the first because there is only 1
                }

                let selectOptions = this.props.data.tags.map(($tag)=>{
                    return {
                        label:$tag,
                        value:$tag,
                    }
                });
                selectOptions.unshift({label:"Select",value:""});

                content = (
                    <UIInput type="select" extraClassName="fieldItem halfWidth" value={selectedValue} options={selectOptions} name={this.props.data.property} onChange={this._onSelectChange}  />
                );
            break;
            case FilterOverlay.DISPLAY_AS_DEFAULT:
            case FilterOverlay.DISPLAY_AS_INCIDENT_TYPES:
                content = this.props.data.tags.map(($tag, $index:number)=>{

                    let isChecked:boolean=false;
                    
                    let foundTag;
                    if(this.props.selectedData){
                        foundTag = this.props.selectedData.tags.find(($selectedTag:string)=>{
                            return $selectedTag===$tag;
                        });                
                        if(foundTag){
                            isChecked=true;
                            checkCount++;
                        }
                    }
        
                    let incidentType:IIncidentTypeData | undefined = undefined;
        
                    switch(displayAs){
                        case FilterOverlay.DISPLAY_AS_INCIDENT_TYPES:
                            incidentType = getIncidentTypeByLabel($tag);
                        break;
                    }
                    
                    return (
                        <UICheckbox incidentType={incidentType} extraClassName="fieldItem halfWidth" key={$index+$tag} name={$tag} label={$tag} checked={isChecked} onChange={this._onCheckboxChange}/>
                    )
                    
                });
            break;
        }

        

        return (
            <UIViewFieldsItem
                fullWidth
                title={this.props.data.label+" ("+checkCount+")"}
                value={(
                    <UIEditFields>
                        {content}
                    </UIEditFields>
                )}
            />
        );
    }
}

