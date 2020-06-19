import React from 'react';

import floorPlan from '@iconify/icons-mdi/floor-plan';
import AssetView from './AssetView';
import FloorPlansData from '../../../data/FloorPlansData';
import AssetMasterView from './AssetMasterView';
import { Column, TableCellDataGetterParams, SortDirectionType } from 'react-virtualized';
import User from '../../../data/User';
import { IAssetData} from '../../../data/AssetData';
import UIWindowTable, { UIWindowTableHeaderRenderer } from '../../../ui/UIWindowTable';


export interface IFloorPlansViewProps {
}

export default class FloorPlansView extends React.Component<IFloorPlansViewProps> {

    static ID:string = "floorPlans";
    static PATH:string = "/documents/floor-plans";
    static ICON:object = floorPlan;


    _sort=($sortBy:string, $direction:SortDirectionType, $a:IAssetData, $b:IAssetData):number=>{
        let numRet:number;
        

        let strA:string = "";
        let strB:string = "";

        
        switch($sortBy){
            case "name":
                strA = $a.assetMeta.name;
                strB = $b.assetMeta.name;
                numRet = UIWindowTable.BASIC_SORT($direction, strA,strB);
            break;
            case "floor":
                strA = $a.assetMeta.floor;
                strB = $b.assetMeta.floor;
                numRet = UIWindowTable.BASIC_SORT($direction, strA,strB);
            break;
            case "dateModified":
                
                let dmA = $a.asset.createDts;
                let dmB = $b.asset.createDts;

                if($a.asset.updateDts){
                    dmA = $a.asset.updateDts;
                }
                if($b.asset.updateDts){
                    dmB = $b.asset.updateDts;
                }

                numRet = UIWindowTable.BASIC_SORT($direction, dmA,dmB);
            break;
            default:
                numRet = UIWindowTable.BASIC_SORT($direction,$a.assetMeta[$sortBy],$b.assetMeta[$sortBy]);
        }

        return numRet;
    }
    render() {

        let assetType = User.state.allAssetTypes.find(($value)=>{
            return $value.assetTypeId===FloorPlansData.TYPE;
        });
        
        return (
            <AssetView 
                viewID={FloorPlansView.ID}
                icon={FloorPlansView.ICON}               
                basePath={FloorPlansView.PATH}
                rg={User.selectedOrg.rgFloorPlans}
                assetType={assetType!}   
                extraClassName={FloorPlansView.ID}
                sort={this._sort}
            >
                {AssetMasterView.COLUMN_NAME()}
                <Column
                    width={100}
                    
                    headerRenderer={UIWindowTableHeaderRenderer}
                    label="Floor"
                    className="floor"
                    dataKey="floor"
                    flexGrow={1}     
                    cellDataGetter={($value:TableCellDataGetterParams)=>{
                        let data:IAssetData = $value.rowData as IAssetData;
                        return data.assetMeta.floor;
                    }}              
                />
                {AssetMasterView.COLUMN_DATE()}  
                {User.selectedOrg.rgFloorPlans.canEdit && AssetMasterView.COLUMN_ACTIONS(FloorPlansView.PATH)}
            </AssetView>  
        );
    }
}
