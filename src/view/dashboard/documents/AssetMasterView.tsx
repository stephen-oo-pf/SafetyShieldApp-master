
import React from 'react';
import { RouteComponentProps } from 'react-router';

import { SortDirectionType, Column, TableCellDataGetterParams, TableRowProps } from 'react-virtualized';
import { NavLink } from 'react-router-dom';
import FormatUtil from '../../../util/FormatUtil';

import { UIEditButton } from '../../../ui/UIButton';


import uploadIcon from '@iconify/icons-mdi/upload';

import UIMasterFrame from '../../../ui/UIMasterFrame';
import { IAssetTypeData, IAssetData } from '../../../data/AssetData';
import UIWindowTable , { UIWindowTableHeaderRenderer }  from '../../../ui/UIWindowTable';
import UIView from '../../../ui/UIView';
import Api, { IErrorType } from '../../../api/Api';
import User, {IResultNotification} from '../../../data/User';
import UINoData from '../../../ui/UINoData';
import {IRightGroup } from '../../../data/UserRights';
import MasterDetailSwitch from '../../../util/MasterDetailSwitch';
import UIWhiteBox from '../../../ui/UIWhiteBox';
import UILoadingBox from '../../../ui/UILoadingBox';
import UIErrorBox from '../../../ui/UIErrorBox';
import TimerUtil from '../../../util/TimerUtil';

interface IAssetMasterViewProps extends RouteComponentProps{
    extraClassName?:string;
    basePath:string;
    icon:object;
    viewID:string;
    rg:IRightGroup;    
    sort:($sortBy:string, $direction:SortDirectionType, $a:IAssetData, $b:IAssetData)=>number;
    type:IAssetTypeData;
    onDelete:($file:IAssetData)=>void;
}

interface IAssetMasterViewState {
    
    data:IAssetData[];
    filter:string;
    inputFilter:string;
    loading:boolean;
    resultNotification?:IResultNotification;
    error?:IErrorType;
}
export default class AssetMasterView extends React.Component<IAssetMasterViewProps, IAssetMasterViewState> {


    view:React.RefObject<UIView> = React.createRef();


    static COLUMN_NAME():JSX.Element{
        return (
            <Column
                width={200}
                label="Name"
                className="name"
                
                headerRenderer={UIWindowTableHeaderRenderer}
                dataKey="name"
                flexGrow={1}   
                cellDataGetter={($value:TableCellDataGetterParams)=>{
                    let data:IAssetData = $value.rowData as IAssetData;
                    return data.assetMeta.name;
                }}   
            />
        );
    }
    static COLUMN_DATE():JSX.Element{
        return (
            <Column
                label="Modified"
                dataKey="dateModified"
                headerRenderer={UIWindowTableHeaderRenderer}
                width={200}
                flexGrow={1}    
                cellDataGetter={($value:TableCellDataGetterParams)=>{
                    let data:IAssetData = $value.rowData as IAssetData;
                    let ms:number = 0;
                    if(data.asset.createDts){
                        ms = data.asset.createDts;
                    }
                    if(data.asset.updateDts){
                        ms = data.asset.updateDts;
                    }
                    let date:Date = new Date(ms*1000)
                    
                    return FormatUtil.dateHMS(date,true,false)+" "+FormatUtil.dateMDY(date,true,false,false,true);
                }}
                  
            /> 
        )
    }
    /*

    static COLUMN_FILESIZE():JSX.Element{
        return (
            <Column
                label="Size"
                dataKey="fileSize"                        
                width={90}
                className="fileSize"
                cellRenderer={(data:{rowData:any, rowIndex:number})=>{
                    let strSize:string = FormatUtil.bytesToSize(data.rowData.fileSize);
                    let split:string[] = strSize.split(" ");

                    return (
                        <>
                            <span>{split[0]}</span>
                            <span className="suffix">{split[1]}</span>
                        </>
                    )
                }}
            />
        )
    }*/
    static COLUMN_ACTIONS($basePath:string):JSX.Element{
        return (
            <Column
                dataKey="actions"
                className="actions"
                headerRenderer={UIWindowTableHeaderRenderer}
                width={42}
                flexShrink={0}
                disableSort={true}
                cellRenderer={($value:TableCellDataGetterParams)=>{
                    
                    let data:IAssetData = $value.rowData as IAssetData;

                    return (
                        <>
                            <UIEditButton path={$basePath+"/"+data.asset.assetId+MasterDetailSwitch.PATH_EDIT} isSquare/>
                        </>
                    )
                }}
            /> 
        );
    }
    

    _isUnmounting:boolean=false;

    constructor(props: IAssetMasterViewProps) {
        super(props);


        this.state = {
            filter:"",
            inputFilter:"",
            loading:true,
            data:[]
        }
    }
    componentDidMount(){
     
        this._loadData();
    }
    _loadData=()=>{


        this.setState({
            loading:true,
            error:undefined
        },()=>{

            Api.assetManager.getAssets(this.props.type.assetTypeId, ($success:boolean, $results:any)=>{
                if($success){
                    let arrData:IAssetData[] = $results;
                    
                    if(!this._isUnmounting){

                        
                        this.setState({data:arrData, loading:false});

                        User.checkResultNotification(this.props.type.assetTypeId,($notif)=>{
                            this.setState({resultNotification:$notif});
                        });

                    }
    
                }else{
                    if(!this._isUnmounting){
                        this.setState({error:$results, loading:false});
                    }
    
                }
            });
    
        });

    }

    componentWillUnmount(){
        this._isUnmounting=true;
    }

    
    _onFilterChange=($value:string)=>{

        TimerUtil.debounce("assetFilter",()=>{            
            this.setState({filter:$value});
        },UIMasterFrame.FILTER_DEBOUNCE_SPEED_MS);
       this.setState({inputFilter:$value});
    }

    getContainer=()=>{

        let container:HTMLDivElement | null = null;
        
        if(this.view.current){
            let scroller = this.view.current.getScrollContainer();
            if(scroller){
                container = scroller.container.current;
            }
        }

        return container;
    }

    _onClearResultNotification=()=>{
        this.setState({resultNotification:undefined});
    }

    render() {



        let strCN:string = "tableMaster";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }



        let arrData:IAssetData[] = [...this.state.data];
        
        //apply possible filters
        if(this.state.filter!==""){
            let arrFilters:string[] = this.state.filter.toLowerCase().split(" ");//filtering by each word
            arrData = arrData.filter(($value:IAssetData)=>{
                let countOk:number=0;
                arrFilters.forEach(($filter:string)=>{
                    let isOk:boolean=false;
                    if($filter==="") isOk = true;      
                    
                    this.props.type.metaConfig.forEach(($metaConfigItem)=>{
                        if($metaConfigItem.filterable){
                            for(let i in $value.assetMeta){
                                if(i===$metaConfigItem.fieldName){
                                    let value = String($value.assetMeta[i]).toLowerCase();
                                    if(value.indexOf($filter)!==-1) isOk = true;    
                                    break;
                                }
                            }
                        }
                    });
  
                    if(isOk) countOk++;                
                });
                return countOk===arrFilters.length;
            });
        }


        let middleBox:JSX.Element = <></>;


        if(this.state.loading){
            middleBox = (
                <UILoadingBox/>
            );
        }else{
            if(this.state.error){
                middleBox = (
                    <UIErrorBox error={"Error Loading "+this.props.type.pluralLabel}/>
                );
            }else{
                if(arrData.length===0){
                    middleBox = (
                        <UINoData filter={this.state.filter}/>
                    );
                }
            }
        }



        let numHeaderH:number = 60;
        let numRowH:number = 60;


        let initSortDir:SortDirectionType = this.props.type.sortDir as SortDirectionType;

        let addBtn;
        
        if(this.props.rg.canAdd){
            addBtn = {label:"Upload New "+this.props.type.singularLabel, icon:uploadIcon, path:this.props.basePath+"/new"};
        }

        return (
            <UIView id={this.props.viewID} ref={this.view} usePadding useScrollContainer>
                
                <UIMasterFrame
                    extraClassName={strCN}
                    baseTitle={this.props.type.pluralLabel}
                    baseIcon={this.props.icon}
                    basePath={this.props.basePath}
                    filter={this.state.inputFilter}
                    onClearResultNotification={this._onClearResultNotification}
                    resultNotification={this.state.resultNotification}
                    onFilterChange={this._onFilterChange}                    
                    addBtn={addBtn}
                >
                    <UIWhiteBox noPadding>                        
                        <UIWindowTable
                            scrollElement={this.getContainer()!}
                            data={arrData}
                            headerH={numHeaderH}
                            rowH={numRowH}
                            sort={this.props.sort}
                            initSortBy={this.props.type.sortField}
                            initSortByDirection={initSortDir}
                            rowRenderer={($props:TableRowProps)=>{
                                let data = $props.rowData as IAssetData;
                                return (
                                    <div key={$props.key} className={$props.className} style={$props.style}>
                                        <NavLink to={this.props.basePath+"/"+data.asset.assetId}/>
                                        {$props.columns}
                                    </div>
                                )
                            }}
                        >                        
                            {this.props.children} 
                        </UIWindowTable>
                        {middleBox}
                    
                    </UIWhiteBox>
                </UIMasterFrame>
            </UIView>
        );
    }
}

