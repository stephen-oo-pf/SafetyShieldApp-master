import React from 'react';
import './UIMasterFrame.scss';

import closeIcon from '@iconify/icons-mdi/close';
import magnifyIcon from '@iconify/icons-mdi/magnify';
import UIButton, { UIAddButton } from './UIButton';
import UIBreadcrumbNav from './UIBreadcrumbNav';
import User, { IResultNotification } from '../data/User';
import UIStatusBanner from './UIStatusBanner';
import UIFilterInput from './UIFilterInput';
import UIAlertsBanner from './banner/UIAlertsBanner';

import filterVariant from '@iconify/icons-mdi/filter-variant';
import FilterOverlay, { FilterTagGroup } from '../overlay/FilterOverlay';

import filterVariantPlus from '@iconify/icons-mdi/filter-variant-plus';
import { UIFilterTagGroup, IFilterTagData } from './UIFilterTag';



export interface UIMasterFrameProps {
    baseTitle:string;
    baseIcon:object;
    basePath:string;
    filter?:string;
    filterPlaceholder?:string;
    filterTags?:FilterTagGroup[];
    filterTagsSelected?:FilterTagGroup[];
    onFilterChange?:($value:string)=>void;
    onFilterTagsChanged?:($selectedTags:FilterTagGroup[])=>void;
    extraClassName?:string;
    addBtn?:{
        path:string;
        label:string;
        icon?:object;
    }
    additionalOptions?:JSX.Element;
    breadcrumbs?:{label:string, to:string}[];
    resultNotification?:IResultNotification;
    onClearResultNotification?:()=>void;
}


export default class UIMasterFrame extends React.Component<UIMasterFrameProps> {

    static FILTER_DEBOUNCE_SPEED_MS:number = 300;

    tagRefs:UIFilterTagGroup[] = [];

    render() {
        let strCN:string = "masterFrame";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }


        let resultNotificationText:JSX.Element = <></>;
        if(this.props.resultNotification){
            resultNotificationText = (
                <>
                    {this.props.resultNotification.result}                    
                    {this.props.resultNotification.resultBold && this.props.resultNotification.resultBold!=="" && (
                        <span>
                            {this.props.resultNotification.resultBold}
                        </span>
                    )}
                </>
            );
        }

        let hasFilter:boolean=false;
        if(this.props.filter || this.props.filter===""){
            hasFilter=true;
        }

        let hasFilterTags:boolean=false;
        if(this.props.filterTags){
            hasFilterTags=true;
        }


        let jsxMasterOptions = (
            <>
                {(hasFilter || this.props.addBtn || hasFilterTags) && (
                    <div className="masterOptions">
                        <div className="masterOptionsBtns">
                            {this.props.addBtn && (
                                <UIAddButton path={this.props.addBtn.path} label={this.props.addBtn.label} icon={this.props.addBtn.icon}/>  
                            )}
                            {this.props.additionalOptions}
                        </div>
                        {(hasFilter || hasFilterTags) && (                            
                            <UIMasterFrameFilterSystem
                                filter={this.props.filter}
                                filterPlaceholder={this.props.filterPlaceholder}
                                filterTags={this.props.filterTags}
                                filterTagsSelected={this.props.filterTagsSelected}
                                onFilterChange={this.props.onFilterChange}
                                onFilterTagsChanged={this.props.onFilterTagsChanged}
                            />
                        )}
                    </div>
                )}
            </>
        );


        return (
            <>
                <UIAlertsBanner/>
                <div className={strCN}>
                    <div className="masterHeader">
                        <UIBreadcrumbNav 
                            titleIcon={this.props.baseIcon} 
                            title={this.props.baseTitle}
                            basePath={this.props.basePath} 
                            breadcrumbs={this.props.breadcrumbs}
                            />
                    </div>
                    {this.props.resultNotification && (
                        <UIStatusBanner type={this.props.resultNotification.type} text={resultNotificationText} onClose={this.props.onClearResultNotification!}  />
                    )}
                    {jsxMasterOptions}                                        
                    <div className="masterContent">
                        {this.props.children}
                    </div>
                </div>
            </>
        );
    }
}





export interface IUIMasterFrameFilterSystemProps {
    filter?:string;
    filterPlaceholder?:string;
    filterTags?:FilterTagGroup[];
    filterTagsSelected?:FilterTagGroup[];
    onFilterChange?:($value:string)=>void;
    onFilterTagsChanged?:($selectedTags:FilterTagGroup[])=>void;
}

export class UIMasterFrameFilterSystem extends React.Component<IUIMasterFrameFilterSystemProps>{

    tagRefs:UIFilterTagGroup[] = [];


    _onClearAllFilters=()=>{
        if(this.tagRefs){
            this.tagRefs.forEach(($ref:UIFilterTagGroup)=>{
                $ref.remove();
            });
        }
    }

    _onFilterChange=($value:string, $name?:string)=>{
        if(this.props.onFilterChange){
            this.props.onFilterChange($value);
        }
    }
    _onClearFilter=()=>{
        if(this.props.onFilterChange){
            this.props.onFilterChange("");
        }
    }
    _onAddFilter=()=>{
        if(this.props.filterTags && this.props.filterTagsSelected){
            FilterOverlay.show("masterFilter",this.props.filterTags,this.props.filterTagsSelected,($selectedTags:FilterTagGroup[])=>{
                if(this.props.onFilterTagsChanged){
                    this.props.onFilterTagsChanged($selectedTags);
                }
            });
        }
    }
    _onFilterTagRemove=($tag:IFilterTagData)=>{
        if(this.props.filterTagsSelected){
            let selectedTags = [...this.props.filterTagsSelected];

            let groupIndex = -1;
            let group = selectedTags.find(($filterTag,$filterTagIndex)=>{
                let found = $filterTag.label===$tag.type;
                if(found){
                    groupIndex = $filterTagIndex;
                }
                return found;
            });

            if(group){
                let groupTags = [...group.tags];

                let removeIndex = groupTags.findIndex(($grouptag)=>{
                    return $grouptag===$tag.value
                });

                if(removeIndex!==-1){
                    groupTags.splice(removeIndex,1);
                }

                let newGroup:FilterTagGroup = {
                    label:group.label,
                    tags:groupTags,
                    property:group.property
                }

                if(groupIndex!==-1){
                    selectedTags.splice(groupIndex,1,newGroup);
                    if(this.props.onFilterTagsChanged){
                        this.props.onFilterTagsChanged(selectedTags);
                    }
                }

                
            }
        }
    }


    render() {

        let hasFilter:boolean=false;
        if(this.props.filter || this.props.filter===""){
            hasFilter=true;
        }

        let hasFilterTags:boolean=false;
        if(this.props.filterTags){
            hasFilterTags=true;
        }
        

        let strFilterPlaceholder:string = "Filter by Name";
        if(this.props.filterPlaceholder){
            strFilterPlaceholder = this.props.filterPlaceholder;
        }

        
        let filterTagCount:number=0;
        if(this.props.filterTagsSelected){
            filterTagCount = this.props.filterTagsSelected.reduce(($prev:number,$value)=>{
                return $prev+$value.tags.length;
            },0);
        }
        


        let addFilterBtnLbl = "Add Filter";
        let addFilterIcon = filterVariantPlus;

        if(filterTagCount>0){
            addFilterBtnLbl = "Filters ("+filterTagCount+")";
            addFilterIcon = filterVariant;
        }
        


        this.tagRefs.length = 0;

        return (
            <>
                {(hasFilter || hasFilterTags) && (
                    <div className="masterOptionsFiltering">
                        <div className="masterOptionsFilteringOptions"> 
                            {hasFilter && (                                       
                                <UIFilterInput filter={this.props.filter!} onChange={this._onFilterChange} placeholder={strFilterPlaceholder}/>
                            )}
                            {this.props.filterTags && (
                                <>
                                    {filterTagCount>0 && (
                                        <UIButton onClick={this._onClearAllFilters} extraClassName="btnClearFilter" size={UIButton.SIZE_SMALL} label="Clear All" color={UIButton.COLOR_TRANSPARENT_PURPLE}/>
                                    )}
                                    <UIButton onClick={this._onAddFilter} iconOnLeft={true} extraClassName="btnAddFilter" icon={addFilterIcon} size={UIButton.SIZE_SMALL} label={addFilterBtnLbl} color={UIButton.COLOR_TRANSPARENT_PURPLE}/>
                                </>
                            )}
                        </div>
                        {hasFilterTags && this.props.filterTagsSelected && this.props.filterTagsSelected.length>0 && (
                            <div className="masterOptionsFilteringTags">
                                {this.props.filterTagsSelected.map(($group,$groupIndex:number)=>{
                                    return <UIFilterTagGroup groupIndex={$groupIndex} ref={($value)=>{
                                        if($value) this.tagRefs.unshift($value);
                                    }} key={$group.label} data={$group} onRemove={this._onFilterTagRemove}/>
                                })}
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    }
}
