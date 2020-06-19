import React from 'react';
import UIInput from './UIInput';
import TimerUtil from '../util/TimerUtil';
import UIIcon from './UIIcon';
import './UIInputAutoSearch.scss';
import UIWhiteBox from './UIWhiteBox';
import UIScrollContainer from './UIScrollContainer';
import magnifyIcon from '@iconify/icons-mdi/magnify';
import closeIcon from '@iconify/icons-mdi/close';
import UIButton from './UIButton';

export interface IUIInputAutoSearchProps {
    data:{id:string, label:string}[];
    selectedID:string;
    tabIndex?:number;
    placeholder?:string;
    onItemSelected:($id:string)=>void;
}

export interface IUIInputAutoSearchState {
    inputSearch:string;
    search:string;
}

export default class UIInputAutoSearch extends React.Component<IUIInputAutoSearchProps, IUIInputAutoSearchState> {
    constructor(props: IUIInputAutoSearchProps) {
        super(props);

        this.state = {
            search:"",
            inputSearch:""
        }
    }

    _onSearchChange=($value:string,$name?:string)=>{
        TimerUtil.debounce("inputAutoSearch",()=>{
            this.setState({search:$value});
        },400);
        this.setState({inputSearch:$value});
    }
    _onItemClicked=($data:{label:string, id:string})=>{

        TimerUtil.clearDebounce("inputAutoSearch");

        this.setState({search:"", inputSearch:""});
        this.props.onItemSelected($data.id);
    }
    _onClearSelected=()=>{
        this.props.onItemSelected("");
    }
    render() {

        let strCN:string = "inputAutoSearch";
        let iconExtraProps:any = {};
        if(this.state.search!==""){
            strCN+=" showResults";
        }

        //basically....does every filter word exist somewhere in the label
        let filters = this.state.search.toLowerCase().split(" ");

        let dataMatches = this.props.data.filter(($data)=>{

            let isOk:boolean=false;

            let matches:number=0;
            filters.forEach(($filter)=>{
                if($data.label.toLowerCase().indexOf($filter)!==-1){
                    matches++;
                }
            });
            if(matches===filters.length){
                isOk=true;
            }

            return isOk;
        });

        let inputIcon = magnifyIcon;
        let selectedLabel;
        if(this.props.selectedID){
            inputIcon = closeIcon;
            selectedLabel = this.props.data.find(($value)=>{
                return $value.id===this.props.selectedID
            });
        }



        return (
            <div className={strCN}>
                {selectedLabel && (
                    <div className="inputAutoSearchField inputAutoSearchSelected">
                        {selectedLabel.label}
                        <UIButton icon={inputIcon} onClick={this._onClearSelected} size={UIButton.SIZE_SMALL} color={UIButton.COLOR_TRANSPARENT} isSquare/>
                    </div>
                )}
                {!selectedLabel && (                    
                    <UIInput title={this.props.placeholder} tabIndex={this.props.tabIndex} name="inputSearch" extraClassName="inputAutoSearchField" value={this.state.inputSearch} onChange={this._onSearchChange}>
                        <UIIcon icon={inputIcon} {...iconExtraProps}/>
                    </UIInput>
                )}
                <UIWhiteBox noPadding extraClassName="inputAutoSearchContainer">
                    <UIScrollContainer>
                        {dataMatches.map(($value,$index)=>{
                            return (
                                <UIInputAutoSearchItem onClick={this._onItemClicked} key={"inputAutoSearchItem"+$index+$value.id} data={$value}/>
                            );
                        })}
                    </UIScrollContainer>
                </UIWhiteBox>
            </div>
        );
    }
}

interface UIInputAutoSearchItemProps{
    data:{id:string, label:string};
    onClick:($data:{id:string,label:string})=>void;
}

class UIInputAutoSearchItem extends React.Component<UIInputAutoSearchItemProps>{
    _onClick=()=>{
        this.props.onClick(this.props.data);
    }
    render(){
        let strCN:string = "inputAutoSearchItem";
        return (
            <div className={strCN} onClick={this._onClick}>
                {this.props.data.label}
            </div>
        )
    }
}