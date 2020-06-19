import React from 'react';
import { IAssetTypeData, IAssetData, IAssetTypeMetaConfig } from '../../../data/AssetData';
import UIEditFields from '../../../ui/UIEditFields';
import UIInput from '../../../ui/UIInput';
import UIToggle from '../../../ui/UIToggle';
import { UIViewFieldsItem } from '../../../ui/UIViewFields';
import UIFileDropArea from '../../../ui/UIFileDropArea';
import UIMapImagePositioner from '../../../ui/map/UIMapImagePositioner';

import { IFloorPlanPositionData } from '../../../data/FloorPlansData';
import UIIncidentTypeDropDown from '../../../ui/UIIncidentTypeDropDown';

export interface IUIAssetTableEditFieldsProps {
    type:IAssetTypeData;
    data?:IAssetData;
    dataURL?:string;
}

export interface IUIAssetTableEditFieldsState {
    validationError:string;
    file:File | null;
    [key:string]:any;
}

export default class UIAssetTableEditFields extends React.Component<IUIAssetTableEditFieldsProps, IUIAssetTableEditFieldsState> {


    imgPositioner:React.RefObject<UIMapImagePositioner> = React.createRef();

    constructor(props: IUIAssetTableEditFieldsProps) {
        super(props);


        let extraState:{[key:string]:any} = {};
        this.props.type.metaConfig.forEach(($value)=>{


            let value;
            switch($value.dataType){
                case "boolean":
                    value = $value.default;
                break;
                case "floorplan-pos":
                break; 
                default://aka "strings"
                    value = "";
            }
            if($value.default && $value.default!==null){                
                value = $value.default;
            }
            if(this.props.data){
                value = this.props.data.assetMeta[$value.fieldName];
            }


            extraState[$value.fieldName] = value;

        });

        this.state = {
            validationError:"",
            file:null,
            ...extraState
        }
    }



    validate(){

        //destructure to get JUST the metaDetails 
        let {validationError, file, ...metaDetails} = this.state;

        for(let i in metaDetails){

            let configItem = this.props.type.metaConfig.find(($value)=>{
                return $value.fieldName===i;
            });
            if(configItem?.required){
                switch(configItem.dataType){
                    case "floorplan-pos":

                    break;
                    case "boolean":

                    break;
                    default:
                        if(metaDetails[i]===""){
                            this.setState({validationError:"Detail Required: "+configItem.fieldLabel});
                            return false;
                        }                    
                }
            }

        }
        
        if(!this.props.data && this.state.file===null){
            this.setState({validationError:"You must select a file."});
            return false;
        }

        return true;
    }


    _onValidationErrorClose=()=>{
        this.setState({validationError:""});
    }
    _onInputChange=($value:any, $name?:string)=>{
        if($name){
            let newstate:{[key:string]:any} = {}
            newstate[$name] = $value;
            this.setState(newstate);
        }
    }

    _onIncidentDropDownChange=($type:string, $name:string)=>{
        
        let newstate:{[key:string]:any} = {}
        newstate[$name] = $type;
        this.setState(newstate);
    }

    timeoutFileDropID:number = -1;
    _onFileDropped=($file:File)=>{

        if(this.state.file){
            this.setState({file:null},()=>{

                window.clearTimeout(this.timeoutFileDropID);

                this.timeoutFileDropID = window.setTimeout(()=>{

                    this.setState({file:$file});
                },400);
            });
        }else{
            this.setState({file:$file});
        }
    }
    render() {
        let strCN:string = "assetTableEditFields";


        const createBasicEditField = ($value:IAssetTypeMetaConfig, $index:number, $element:JSX.Element)=>{
            return (
                <UIViewFieldsItem 
                    key={$index+"edit_"+$value.fieldName} 
                    title={(
                        <>
                            {$value.fieldLabel}
                            {$value.required && (
                                <span className="required">*</span>
                            )}
                        </>
                    )} 
                    value={$element}
                />
            )
        }


        let jsxImgPos:JSX.Element = <></>;

        let items = this.props.type.metaConfig.map(($value,$index)=>{
            let jsxItem:JSX.Element | null = null;
            switch($value.dataType){
                case "boolean":

                    let on:string = "ON";
                    let off:string = "OFF";
                    if($value.yesLabel){
                        on = $value.yesLabel;
                    }
                    if($value.noLabel){
                        off = $value.noLabel;
                    }
                    
                    jsxItem = createBasicEditField($value,$index,(
                        <UIToggle name={$value.fieldName} labelOn={on} labelOff={off} enabled={this.state[$value.fieldName]} onClick={this._onInputChange} />
                    ));

                break;
                case "floorplan-pos":
                    if(this.state.file || this.props.dataURL){

                        let strFileURL:string = "";
                        
                        if(this.props.dataURL){
                            strFileURL = this.props.dataURL;
                        }
                        
                        if(this.state.file){
                            strFileURL =  window.URL.createObjectURL(this.state.file);
                        }
                        

                        let pos:IFloorPlanPositionData | undefined = undefined;
                        
                        
                        if(this.state[$value.fieldName] && this.state[$value.fieldName].imgBounds){//check for valid property to verify
                            pos = this.state[$value.fieldName];
                        };



                        jsxImgPos = (
                            <UIMapImagePositioner
                                ref={this.imgPositioner}
                                key={$index+"edit_"+$value.fieldName} 
                                type={this.props.type}
                                url={strFileURL}
                                positionDetails={pos}
                            />
                        );
                    }
                break;
                default: //aka "string"


                    switch($value.render){
                        case "dropdownList":

                            /*
                            THe only drop down that works right now is.... incidentTypes
                            */
                            switch($value.listSource){
                                case "incidentTypes":
                                    let strPlaceholder:string = "";
                                    if($value.placeholder){
                                        strPlaceholder = $value.placeholder;
                                    }
                                    jsxItem = createBasicEditField($value,$index,(                                    
                                        <UIIncidentTypeDropDown
                                            notSelectedValue={strPlaceholder}
                                            onItemSelected={this._onIncidentDropDownChange}
                                            incidentTypeId={this.state[$value.fieldName]}
                                        />
                                    ));

                                break;
                            }


                        break;
                        case "text-area":

                            jsxItem = (
                                <UIInput 
                                    fieldItem
                                    key={$index+"edit_"+$value.fieldName} 
                                    isRequired={$value.required} 
                                    title={$value.fieldLabel} 
                                    showTitleAsLabel
                                    type="textarea" 
                                    name={$value.fieldName} 
                                    showTitleAsLabel_Placeholder={$value.placeholder}                            
                                    onChange={this._onInputChange}  
                                    value={this.state[$value.fieldName]}/>
                            );

                        break;
                        default://aka "text-input"
                        jsxItem = (
                            <UIInput 
                                fieldItem
                                key={$index+"edit_"+$value.fieldName} 
                                isRequired={$value.required} 
                                title={$value.fieldLabel} 
                                showTitleAsLabel 
                                name={$value.fieldName} 
                                showTitleAsLabel_Placeholder={$value.placeholder}      
                                onChange={this._onInputChange}  
                                value={this.state[$value.fieldName]}/>
                        );
                    }
                
            }

            return jsxItem;
        })


        let isReplacement:boolean=false;
        if(this.props.data || this.state.file){
            isReplacement=true;
        }

        let mimeTypes = this.props.type.mimeTypes.split(",");

        return (
            <UIEditFields validationError={this.state.validationError} onValidationErrorClose={this._onValidationErrorClose}>
                {items}
                <UIFileDropArea
                    file={this.state.file}
                    singularLabel={this.props.type.singularLabel}
                    mimeTypes={mimeTypes}
                    isReplacement={isReplacement}
                    onFileDropped={this._onFileDropped}
                />
                {jsxImgPos}
            </UIEditFields>
        );
    }
}
