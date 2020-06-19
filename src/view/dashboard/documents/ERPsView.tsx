import React from 'react';

import fileDocument from '@iconify/icons-mdi/file-document';
import AssetView from './AssetView';
import AssetMasterView from './AssetMasterView';
import UIWindowTable, { UIWindowTableHeaderRenderer } from '../../../ui/UIWindowTable';
import { SortDirectionType, Column, TableCellDataGetterParams } from 'react-virtualized';
import { IAssetData } from '../../../data/AssetData';
import User from '../../../data/User';
import ERPData from '../../../data/ERPData';
import UIIncidentTypeIcon from '../../../ui/UIIncidentTypeIcon';
import { NavLink } from 'react-router-dom';


export interface IERPsViewProps {
}

export default class ERPsView extends React.Component<IERPsViewProps> {

    static ID:string = "ERPs";
    static PATH:string = "/documents/erps";
    static ICON:object = fileDocument;


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
            case "incidentType":
                strA = $a.assetMeta.incidentTypeId;
                strB = $b.assetMeta.incidentTypeId;
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
                
                numRet = UIWindowTable.BASIC_SORT($direction,$a[$sortBy],$b[$sortBy]);
        }

        return numRet;
    }

    render() {

        let assetType = User.state.allAssetTypes.find(($value)=>{
            return $value.assetTypeId===ERPData.TYPE;
        });




        return (
            
            <AssetView 
                viewID={ERPsView.ID}
                icon={ERPsView.ICON}               
                basePath={ERPsView.PATH}
                rg={User.selectedOrg.rgERPs}
                assetType={assetType!}   
                extraClassName={ERPsView.ID}
                sort={this._sort}
            >
                {AssetMasterView.COLUMN_NAME()}
                <Column
                    width={55}
                    label="Type"
                    className="incidentType"
                    headerRenderer={UIWindowTableHeaderRenderer}
                    dataKey="incidentType"
                    flexGrow={1}    
                    cellRenderer={($value:TableCellDataGetterParams)=>{ 
                        let data = $value.rowData as IAssetData;

                        let incidentType = User.state.allIncidentTypes.find(($value)=>{
                            return $value.incidentTypeId===data.assetMeta.incidentTypeId;
                        });

                        if(!incidentType){
                            return "";
                        }
                        return (
                            <NavLink to={ERPsView.PATH+"/"+data.asset.assetId} title={incidentType.incidentType}>
                                <UIIncidentTypeIcon type={incidentType}/>
                            </NavLink>
                        )
                    }}               
                />
                {AssetMasterView.COLUMN_DATE()}  
                {User.selectedOrg.rgERPs.canEdit && AssetMasterView.COLUMN_ACTIONS(ERPsView.PATH)}               
            </AssetView> 
        );
    }
}
