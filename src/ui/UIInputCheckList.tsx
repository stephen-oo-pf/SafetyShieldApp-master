import React from 'react';
import './UIInputCheckList.scss';
import closeIcon from '@iconify/icons-mdi/close';
import UIInput from './UIInput';
import UICheckbox from './UICheckbox';
import UIScrollContainer from './UIScrollContainer';
import magnifyIcon from '@iconify/icons-mdi/magnify';
import UIIcon from './UIIcon';
import UINoData from './UINoData';
import TimerUtil from '../util/TimerUtil';

export interface IUIInputCheckListProps {
    checked:string[];
    options:{label:string, id:string, readonly?:boolean}[];
    allOption?:boolean;
    onChange:($checked:string[])=>void;
    disabled?:boolean;
}

export interface IUIInputCheckListState {
    filter:string;
    inputFilter:string;
}

export default class UIInputCheckList extends React.Component<IUIInputCheckListProps, IUIInputCheckListState> {
    constructor(props: IUIInputCheckListProps) {
        super(props);

        this.state = {
            filter:"",
            inputFilter:""
        }
    }

    _onFilterChange=($value:string, $name?:string)=>{

        TimerUtil.debounce("checklistFilter",()=>{
            
            this.setState({filter:$value});
        },300);

        this.setState({inputFilter:$value});

    }
    _onClearFilter=()=>{
        this.setState({filter:"", inputFilter:""});
    }

    _onItemChange=($checked:boolean, $id:string)=>{


        if($id==="all"){

            if($checked){

                let allChecked = this.props.options.map(($value)=>{
                    return $value.id
                });
                this.props.onChange(allChecked);
            }else{

                //we need to uncheck all values except read only... so pass only the readonly values.
                let allReadonly = this.props.options.filter(($value)=>{
                    return $value.readonly;
                }).map(($value)=>{
                    return $value.id;
                });

                this.props.onChange(allReadonly);
            }

        }else{
            let checked = [...this.props.checked];

        
            let checkedIndex = this.props.checked.findIndex(($value)=>{
                return $value===$id;
            });
    
            if($checked){
    
                //add it
                if(checkedIndex===-1){
                    checked.push($id);
                }
    
            }else{
                //remove it
                if(checkedIndex!==-1){
                    checked.splice(checkedIndex,1);
                }
            }
    
            this.props.onChange(checked);
        }

    }

    render() {
        let strCN:string = "inputCheckList";

        let options = this.props.options;
        
        if(this.state.filter){
            
            let filters = this.state.filter.toLowerCase().split(" ");
            options = this.props.options.filter(($value)=>{

                let isOk:boolean=false;
                let filterOk:number=0;

                filters.forEach(($filter)=>{
                    if($value.label.toLowerCase().indexOf($filter)!==-1){
                        filterOk++;
                    }
                });
                if(filterOk===filters.length){
                    isOk=true;
                }

                return isOk;
            })
        }
        
        
        let inputIcon = magnifyIcon;
        let strClearIconCN:string = "clear";
        if(this.state.filter!==""){          
            strClearIconCN+=" searching";  
            inputIcon = closeIcon;
        }


        let allChecked:boolean =false;
        if(this.props.checked.length===this.props.options.length){
            allChecked=true;
        }
        
        if(this.props.disabled){
            strCN+=" disabled";
        }

        return (
            <div className={strCN}>
                <div className="inputCheckListHeader">
                    <UIInput disabled={this.props.disabled} fullWidth title="Filter" name="inputCheckListFilter" onChange={this._onFilterChange} value={this.state.inputFilter}>                        
                        <UIIcon extraClassName={strClearIconCN} icon={inputIcon} onClick={this._onClearFilter}/>
                    </UIInput>
                </div>
                <UIScrollContainer extraClassName="inputCheckListContainer">
                    {this.props.allOption && options.length>0 && this.state.filter==="" &&  (
                        <UIInputCheckListItem disabled={this.props.disabled} onItemChange={this._onItemChange} key={"inputCheckListItemAll"} index={-1} checked={allChecked} data={{id:"all", label:"ALL"}} />
                    )}
                    {options.map(($option, $index)=>{

                        let checked:boolean = false;

                        let match = this.props.checked.find(($checkedItem)=>{
                            return $checkedItem===$option.id;
                        });

                        if(match){
                            checked=true;
                        }


                        return (
                            <UIInputCheckListItem disabled={this.props.disabled} readonly={$option.readonly} indent={this.props.allOption} onItemChange={this._onItemChange} key={"inputCheckListItem"+$index+""+$option.id} index={$index} checked={checked} data={$option} />
                        );
                    })}
                    {options.length===0 && (
                        <UINoData filter={this.state.filter}/>
                    )}
                </UIScrollContainer>
            </div>
        );
    }
}



interface IUIInputCheckListItemProps {
    data:{label:string, id:string};
    checked?:boolean;
    index:number;
    indent?:boolean;
    disabled?:boolean;
    readonly?:boolean;
    onItemChange:($checked:boolean, $id:string)=>void;
}

class UIInputCheckListItem extends React.Component<IUIInputCheckListItemProps> {

    _onChange=($value:boolean, $name?:string)=>{

        this.props.onItemChange($value,this.props.data.id);
    }
    render() {
        let checked:boolean=false;
        if(this.props.checked){
            checked=true;
        }

        let strCN:string = "inputCheckListItem";
        if(this.props.indent){
            strCN+=" indent";
        }


        return (
            <UICheckbox disabled={this.props.disabled} readonly={this.props.readonly} extraClassName={strCN} name={"inputCheckListItemCheckbox"+this.props.data.id} label={this.props.data.label} checked={checked} onChange={this._onChange}/>
        );
    }
}
