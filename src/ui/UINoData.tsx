import React from 'react';
import UICenterBox from './UICenterBox';
import { IErrorType } from '../api/Api';
import './UINoData.scss';
import { FilterTagGroup } from '../overlay/FilterOverlay';

interface UINoDataProps{
    customMsg?:string;
    filter?:string;
    filterTags?:FilterTagGroup[];
    error?:IErrorType;
    customFilterMsg?:string;
}

export default class UINoData extends React.Component<UINoDataProps>{

    render(){

        let msg:string = "No Results Available";
        if(this.props.customMsg){
            msg = this.props.customMsg;
        }


        let content:JSX.Element = (
            <div className="noDataMsg">
                {msg}
            </div>
        );

        if(this.props.error){
            content = (
                <>
                    {this.props.error.desc}
                </>
            );
        }

        let tagCount:number=0;
        
        if(this.props.filterTags){
            this.props.filterTags.forEach(($group)=>{
                tagCount+=$group.tags.length;
            });
        }


        if(this.props.filter || tagCount>0){

            let filterMsg:string = "No results match the filter:";

            
            if(this.props.customFilterMsg){
                filterMsg = this.props.customFilterMsg;
            }
            
            if(tagCount>0){
                filterMsg = "No results match the applied filter"+(tagCount>1?"s":"")+".";
            }


            content = (
                <>
                    <div className="noDataMsg">{filterMsg}</div>
                    {this.props.filter && tagCount===0 &&  (
                        <div className="noDataFilter">{this.props.filter}</div>
                    )}
                </>
            );
        }

        return (
            <UICenterBox extraClassName="noData">
                {content}
            </UICenterBox>
        );
    }
}