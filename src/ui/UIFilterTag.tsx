import * as React from 'react';
import './UIFilterTag.scss';
import UIButton from './UIButton';

import closeCircle from '@iconify/icons-mdi/close-circle';
import { FilterTagGroup } from '../overlay/FilterOverlay';

export interface IFilterTagData{
    type:string;
    value:string;
}

export interface IUIFilterTagProps {
    data:IFilterTagData
    groupIndex:number;
    onRemove:($data:IFilterTagData)=>void;
}
interface IUIFilterTagState{
    removing:boolean;
}

export default class UIFilterTag extends React.Component<IUIFilterTagProps, IUIFilterTagState> {

    constructor($props:IUIFilterTagProps){
        super($props);
        this.state = {
            removing:false
        }
    }

    _onClick=()=>{
        this.remove();
    }
    remove=()=>{
        if(!this.state.removing){
            this.setState({removing:true},()=>{
                window.setTimeout(()=>{
                    this.props.onRemove(this.props.data);
                },300);
            });
        }
    }

    render() {
        let strCN:string = "filterTag";
        if(this.state.removing){
            strCN+=" removing";
        }

        return (
            <div className={strCN}>
                <div className="labels">
                    <div className="labelType">
                        {this.props.data.type}
                    </div>
                    <div className="labelValue">
                        {this.props.data.value}
                    </div>
                </div>
                <UIButton isSquare size={UIButton.SIZE_SMALL} color={UIButton.COLOR_TRANSPARENT_PURPLE} icon={closeCircle} onClick={this._onClick} />                
            </div>
        );
    }
}


export interface IUIFilterTagGroupProps {
    data:FilterTagGroup;
    groupIndex:number;
    onRemove:($data:IFilterTagData)=>void;
}

export class UIFilterTagGroup extends React.Component<IUIFilterTagGroupProps> {

    tagRefs:UIFilterTag[] = [];

    remove=()=>{
        if(this.tagRefs.length){
            this.tagRefs.forEach(($tag,$index)=>{
                window.setTimeout(()=>{
                    $tag.remove();
                },100*($index+this.props.groupIndex));
            });
        }
    }

    render() {
        this.tagRefs.length=0;
        return (
        <>
            {this.props.data.tags.map(($tag,$index)=>{
                return (
                    <UIFilterTag ref={($value)=>{
                        if($value) this.tagRefs.unshift($value);
                    }} key={"tagItem"+this.props.data.label+$tag} groupIndex={this.props.groupIndex} data={{type:this.props.data.label, value:$tag}} onRemove={this.props.onRemove}/>
                );
            })}            
        </>
        );
    }
}

