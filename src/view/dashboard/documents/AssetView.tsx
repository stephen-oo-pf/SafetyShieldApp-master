import React from 'react';
import {withRouter, RouteComponentProps } from 'react-router-dom';
import AssetMasterView from './AssetMasterView';

import { IAssetTypeData, IAssetData } from '../../../data/AssetData';
import AssetDetailView from './AssetDetailView';
import { SortDirectionType } from 'react-virtualized';
import { IRightGroup } from '../../../data/UserRights';
import TitleUtil from '../../../util/TitleUtil';
import MasterDetailSwitch from '../../../util/MasterDetailSwitch';
import UIDetailFrame from '../../../ui/UIDetailFrame';

export interface IAssetViewProps extends RouteComponentProps {
    viewID:string;
    basePath:string;
    extraClassName?:string;
    icon:object;
    assetType:IAssetTypeData;
    rg:IRightGroup;
    sort:($sortBy:string, $direction:SortDirectionType, $a:IAssetData, $b:IAssetData)=>number;
}

export interface IAssetViewParams{
    id:string;
}

class AssetView extends React.Component<IAssetViewProps> {


    componentDidMount(){
        TitleUtil.setPageTitle(this.props.assetType.pluralLabel);
    }
    
    _onDelete=($data:IAssetData)=>{

    }

    _getDetailEdit=($props:RouteComponentProps)=>{
        
        return (
            <AssetDetailView
                viewID={this.props.viewID}
                basePath={this.props.basePath}
                icon={this.props.icon}
                type={this.props.assetType}
                assetId={this._curAssetId}       
                mode={UIDetailFrame.MODE_EDIT}      
                rg={this.props.rg}   
                {...$props}
            />
        )
    }
    _getDetailView=($props:RouteComponentProps)=>{
        return (
            <AssetDetailView 
                viewID={this.props.viewID}
                basePath={this.props.basePath}
                icon={this.props.icon}
                type={this.props.assetType}
                assetId={this._curAssetId}
                mode={UIDetailFrame.MODE_VIEW}
                rg={this.props.rg}
                {...$props}
            />
        )
    }
    _curAssetId:string = "";
    _onSetDetailID=($id:string)=>{
        this._curAssetId = $id;
    }

    _getMaster=($props:RouteComponentProps)=>{
        return (
            <AssetMasterView
                rg={this.props.rg}
                viewID={this.props.viewID}
                basePath={this.props.basePath}
                extraClassName={this.props.extraClassName}
                icon={this.props.icon}
                type={this.props.assetType}
                onDelete={this._onDelete}
                sort={this.props.sort}
                {...$props}
            >                            
                {this.props.children}
            </AssetMasterView>
            
        )
    }
    _getNew=($props:RouteComponentProps)=>{
        return (
            <AssetDetailView 
                rg={this.props.rg}
                viewID={this.props.viewID}
                basePath={this.props.basePath}
                icon={this.props.icon}
                type={this.props.assetType}
                mode={UIDetailFrame.MODE_NEW}
                {...$props}
            />
        );
    }


    render() {

        
        return (
            <MasterDetailSwitch
                basePath={this.props.basePath}
                rg={this.props.rg}
                masterComp={this._getMaster}
                newComp={this._getNew}
                detailComp={this._getDetailView}
                editComp={this._getDetailEdit}
                onSetDetailID={this._onSetDetailID}
            />
        );
    }
}


export default withRouter(AssetView);