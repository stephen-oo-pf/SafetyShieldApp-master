import React from 'react';
import UIView from '../../../ui/UIView';
import { IAssetTypeData, IAssetData } from '../../../data/AssetData';
import { RouteComponentProps } from 'react-router-dom';
import UIDetailFrame from '../../../ui/UIDetailFrame';
import Api, { IErrorType } from '../../../api/Api';
import UIButton, { UIDeleteButton } from '../../../ui/UIButton';

import UIWhiteBox from '../../../ui/UIWhiteBox';

import UIViewFields, { UIViewFieldsItem } from '../../../ui/UIViewFields';
import UIAssetTableEditFields from './AssetEditFields';

import LoadingOverlay from '../../../overlay/LoadingOverlay';
import { unlisten, listen } from '../../../dispatcher/Dispatcher';
import WorkerEvent from '../../../event/WorkerEvent';
import { FILETYPE_GIF, FILETYPE_JPG, FILETYPE_PNG, FILETYPE_PDF, getFileType, getFileTypeURL, FILETYPE_JPEG } from '../../../data/FileTypeData';
import BrowserUtil from '../../../util/BrowserUtil';
import ConfirmOverlay from '../../../overlay/ConfirmOverlay';
import {  IRightGroup } from '../../../data/UserRights';
import User from '../../../data/User';
import UIIncidentTypeIcon from '../../../ui/UIIncidentTypeIcon';

import UIPDFViewer from '../../../ui/UIPDFViewer';

import FloorPlansData, {IFloorPlanPositionData} from '../../../data/FloorPlansData';
import ERPData from '../../../data/ERPData';

import FormatUtil from '../../../util/FormatUtil';
import UIMapImageViewer from '../../../ui/map/UIMapImageViewer';



import deleteIcon from '@iconify/icons-mdi/delete';
import mapMarker from '@iconify/icons-mdi/map-marker';
import fileImage from '@iconify/icons-mdi/file-image';
import downloadIcon from '@iconify/icons-mdi/download';
import launchIcon from '@iconify/icons-mdi/launch';

import './AssetDetailView.scss';
import AlertOverlay from '../../../overlay/AlertOverlay';


export interface IAssetDetailViewProps extends RouteComponentProps{
    assetId?:string;
    viewID:string;
    basePath:string;
    icon:object;
    type:IAssetTypeData;
    mode:string;
    rg:IRightGroup;
}

export interface IAssetDetailViewState {
    loading:boolean;
    error?:IErrorType;
    data:IAssetData | null;
    dataURL:string;
    displayFloorPlanOnMap:boolean;
    
}

export default class AssetDetailView extends React.Component<IAssetDetailViewProps, IAssetDetailViewState> {


    editFields:React.RefObject<UIAssetTableEditFields> =  React.createRef();

    _isUnmounting:boolean=false;

    _saving:boolean=false;

    constructor(props: IAssetDetailViewProps) {
        super(props);



        let startsLoading:boolean=false;
        if(this.props.assetId){
            startsLoading=true;
        }

        this.state = {
            loading:startsLoading,
            
            data:null,
            dataURL:"",
            displayFloorPlanOnMap:false
        }
    }
    componentDidMount(){
        if(this.props.assetId){
            this._loadData();
        }
    }
    componentDidUpdate($prevProps:IAssetDetailViewProps){
        if(this.props.assetId && this.props.assetId!==$prevProps.assetId){
            this._loadData();
        }
    }
    componentWillUnmount(){
        this._isUnmounting=true;
    }
    
    _loadData=()=>{
        if(!this._isUnmounting){
            this.setState({
                loading:true,  
                error:undefined,
                data:null,
            },()=>{
                
                Api.assetManager.getAsset(this.props.assetId!,($success:boolean, $results:any)=>{
                    if($success){

                        let asset:IAssetData = $results;

                        Api.assetManager.getAssetContentURL(this.props.assetId!,asset.assetContent.currentVersion.version,true,($contentSuccess:boolean, $contentResults:any)=>{
                            if(!this._isUnmounting){
                                if($contentSuccess){
                                    this.setState({loading:false, data:$results, dataURL:$contentResults});
                                }else{
                                    this.setState({loading:false, error:$contentResults});
                                }
                            }
                        });
                    }else{
                        if(!this._isUnmounting){
                            this.setState({loading:false, error:$results});
                        }
                    }
                });
            });
        }
    }


    
    _savingName:string = "";
    _curWorkerID:string = "";
    _listeningForWorkerResponse=false;

    _save=($isNew:boolean)=>{

        let isValid:boolean = false;

        if(this.editFields.current){
            isValid = this.editFields.current.validate();

            if(isValid && !this._saving){

                this._curWorkerID = Math.round(Math.random()*100000)+"-"+Date.now();

                this._saving=true;
    
                let {file, validationError, ...restState} = this.editFields.current.state;
                    
                if(restState.name){
                    this._savingName = restState.name;
                }else{
                    this._savingName = "";
                }

                let metaDetails = {
                    ...restState
                };
                //manually add back in complex types
                this.props.type.metaConfig.forEach(($value)=>{
                    switch($value.dataType){
                        case "floorplan-pos":
                            if(this.editFields.current && this.editFields.current.imgPositioner.current){
                                metaDetails[$value.fieldName] = JSON.stringify(this.editFields.current.imgPositioner.current.getPositionDetails());
                            }
                        break;
                    }
                });

                
                let loadingSaveMsg:string = "Saving ";
                let loadingSaveTitle:string = "Saving Please Wait";

                if($isNew){
                    loadingSaveMsg = "Saving New ";
                }
                if(file){
                    loadingSaveTitle = "Uploading Please Wait";                    
                }

                LoadingOverlay.show("saveAsset",loadingSaveMsg+this.props.type.singularLabel+"...",loadingSaveTitle);


                
                this._listeningForWorkerResponse=true;

                listen(WorkerEvent.WORKER_RESPONSE, this._onWorkerResponse);
                Api.assetManager.saveAsset(this.props.type.assetTypeId,this._curWorkerID,metaDetails,file,this.state.data?.asset.assetId);

                
            }

        }


    }
    _workerDone=()=>{
        if(this._listeningForWorkerResponse){
            this._listeningForWorkerResponse=false;
            unlisten(WorkerEvent.WORKER_RESPONSE, this._onWorkerResponse);
        }
        this._saving=false;
        LoadingOverlay.hide("saveAsset");
    }
    _onWorkerResponse=($event:WorkerEvent)=>{
        if($event.details.id===this._curWorkerID){
            switch($event.details.action){
                case Api.assetManager.WORKER_ACTION_UPLOAD_COMPLETE:
                    this._workerDone();
                    if(!this._isUnmounting){

                        switch(this.props.mode){
                            case UIDetailFrame.MODE_NEW:
                                User.setSuccessAddedNewNotification(this.props.type.assetTypeId, this.props.type.singularLabel,this._savingName);
                            break;
                            case UIDetailFrame.MODE_EDIT:
                                User.setSuccessEditedNotification(this.props.type.assetTypeId, this.props.type.singularLabel,this._savingName);
                            break;
                        }

                        this.props.history.push(this.props.basePath); 
                    }
                break;
                case Api.assetManager.WORKER_ACTION_UPLOAD_ERROR:
                    
                    AlertOverlay.show("errorSaving",$event.details.error);
                    this._workerDone();
                break;
            }
        }
    }
    
    _download=($openInNewWindow:boolean=false)=>{
        
        if(this.state.data){
            const hideLoading = LoadingOverlay.show("downloadAsset",this.state.data.assetContent.currentVersion.fileName,"Downloading File");
            Api.assetManager.getAssetContentURL(this.props.assetId!,this.state.data.assetContent.currentVersion.version,$openInNewWindow,($contentSuccess:boolean, $contentResults:any)=>{
                if($contentSuccess){
                    let strContentURL:string = $contentResults;

                    if(!this._isUnmounting){

                        if($openInNewWindow){
                            window.open(strContentURL,"_blank");
                        }else{
                            BrowserUtil.downloadFile(strContentURL,this.state.data?.assetContent.currentVersion.fileName);
                        }
                    }
                }else{

                }
                hideLoading();
            });
        }
    }

    _onClickSaveNew=()=>{
        this._save(true);
    }
    _onClickSaveEdit=()=>{
        this._save(false);
    }
    _onClickDownload=()=>{
        this._download();
    }
    _onClickOpenNewWindow=()=>{
        this._download(true);
    }
    _onClickDisplayFloorPlanOnMap=()=>{
        this.setState({displayFloorPlanOnMap:true});
    }
    _onClickDisplayFloorPlanNormally=()=>{
        this.setState({displayFloorPlanOnMap:false});
    }
    _onClickDelete=()=>{

        if(this.state.data){

            ConfirmOverlay.show("confirmDeleteAsset",()=>{
                const hideLoading = LoadingOverlay.show("deleteAsset","Deleting Asset...","Loading Please Wait");

                Api.assetManager.deleteAsset(this.props.assetId!,($success:boolean, $results:any)=>{
                    hideLoading();
                    
                    if(!this._isUnmounting){

                        if($success){
                            this.props.history.push(this.props.basePath);
                        }else{
    
                        }
                    }
                });

            },"Are you sure you want to delete "+this.state.data.assetMeta.name+"?", "Confirm Delete","Delete","Cancel",deleteIcon);
    
        }
    }


    render() {

        let jsxContent:JSX.Element = <></>;
        let jsxViewEditContent:JSX.Element = <></>;

        let strDetailName:string = "";

        if(this.state.data){
            strDetailName = this.state.data.assetMeta.name;
        }

        switch(this.props.mode){
            case UIDetailFrame.MODE_NEW:

                jsxContent = (
                    <>
                        <UIWhiteBox extraClassName="assetTableDetailContent">             
                            <UIAssetTableEditFields ref={this.editFields} type={this.props.type}/>
                        </UIWhiteBox>
                    </>
                );
             
            break;
            case UIDetailFrame.MODE_VIEW:

                if(this.state.data){


                    let fileType = getFileType(this.state.data.assetContent.currentVersion.contentType);

                    let jsxContentElement:JSX.Element = <></>;
                    switch(this.state.data.assetContent.currentVersion.contentType){
                        case FILETYPE_GIF:
                        case FILETYPE_JPEG:
                        case FILETYPE_JPG:
                        case FILETYPE_PNG:


                            let contentImageCN:string = "contentImage";

                            //check for floor plan pos dataType
                            let floorPlanPosMeta = this.props.type.metaConfig.find(($value)=>{
                                return $value.dataType==="floorplan-pos"
                            });
                            let jsxFloorPlanImageViewer:JSX.Element = <></>;
                           
                            if(this.state.displayFloorPlanOnMap){
                                contentImageCN+=" displayMap";
                            }

                            if(floorPlanPosMeta){
                                let floorPlanPosData:IFloorPlanPositionData = this.state.data.assetMeta[floorPlanPosMeta.fieldName];
                                
                                jsxFloorPlanImageViewer = (
                                    <UIMapImageViewer
                                        url={this.state.dataURL}
                                        position={floorPlanPosData}
                                    />
                                );
                            }
                            jsxContentElement = (
                                <>
                                    <div className={contentImageCN}>
                                        <div className="contentImageContainer">
                                            <img src={this.state.dataURL} alt={this.state.data.assetMeta.name}/>
                                        </div>
                                        {jsxFloorPlanImageViewer}
                                    </div>
                                </>
                            );

                        break;
                        case FILETYPE_PDF:
                            if(fileType){

                                jsxContentElement = (
                                    <UIPDFViewer
                                        fileSize={this.state.data.assetContent.currentVersion.contentSize}
                                        type={this.props.type}
                                        url={this.state.dataURL}
                                    />
                                );
                            }
                                    
                        break;
                        default:
                            jsxContentElement = (
                                <div className="downloadToView">
                                    You can not view this file online. In order to view this {this.props.type.singularLabel}. Please click the download button below.
                                    <UIButton onClick={this._onClickDownload} label={"Download "+this.props.type.singularLabel} color={UIButton.COLOR_LIGHTGREY} icon={downloadIcon} horizontalAlign={UIButton.ALIGN_LEFT} iconOnLeft/>
                                </div>
                            );
                    }


                    jsxViewEditContent = (
                        <div className="contentElement">
                            {jsxContentElement}
                        </div>
                    );
                }
            break;
            case UIDetailFrame.MODE_EDIT:

                if(this.state.data){

                    jsxViewEditContent = (
                        <>
                            <UIAssetTableEditFields ref={this.editFields} data={this.state.data} dataURL={this.state.dataURL} type={this.props.type}/>
                            <div className="footerOptions">
                                {this.props.rg.canDelete && (
                                    <UIDeleteButton onClick={this._onClickDelete} />
                                )}
                            </div>
                        </>
                    );

                }
            break;

        }

        switch(this.props.mode){
            case UIDetailFrame.MODE_EDIT:
            case UIDetailFrame.MODE_VIEW:
                if(this.state.data){    
                    
                    let whiteBoxCN:string = "detailMainContent twocolumnsA";
                    let noContentPadding:boolean=false;
                    if(this.props.mode===UIDetailFrame.MODE_VIEW){
                        noContentPadding=true;
                    }
                    jsxContent = (
                        <div className="twocolumns">
                            <UIWhiteBox noPadding={noContentPadding} extraClassName={whiteBoxCN}>
                                {jsxViewEditContent}
                            </UIWhiteBox>
                            <UIAssetTableDetailMeta 
                                displayFloorPlanOnMap={this.state.displayFloorPlanOnMap}
                                onDownload={this._onClickDownload}
                                onOpenNewWindow={this._onClickOpenNewWindow}
                                onDisplayFloorPlanOnMap={this._onClickDisplayFloorPlanOnMap}
                                onDisplayFloorPlanNormally={this._onClickDisplayFloorPlanNormally}
                                mode={this.props.mode}
                                data={this.state.data} 
                                type={this.props.type}/>
                        </div>
                    );
                }
            break;
        }


        let detailPath;

        if(this.props.assetId){
            detailPath = "/"+this.props.assetId;
        }


        return (
            <UIView id={this.props.viewID+" assetDetail"} usePadding useScrollContainer>
                
                <UIDetailFrame
                    singularLabel={this.props.type.singularLabel}
                    mode={this.props.mode}
                    loading={this.state.loading}
                    error={this.state.error}
                    detailPath={detailPath}
                    detailName={strDetailName}
                    baseIcon={this.props.icon}
                    basePath={this.props.basePath}
                    baseTitle={""}   
                    canEdit={this.props.rg.canEdit}
                    canNew={this.props.rg.canAdd}   
                    onSaveEdit={this._onClickSaveEdit}
                    onSaveNew={this._onClickSaveNew}        
                >
                    {jsxContent}
                </UIDetailFrame>
            </UIView>
        );
    }
}


interface UIAssetTableDetailMetaProps{
    type:IAssetTypeData;
    mode:string;
    data:IAssetData;
    displayFloorPlanOnMap:boolean;
    onDownload:()=>void;
    onOpenNewWindow:()=>void;
    onDisplayFloorPlanOnMap:()=>void;
    onDisplayFloorPlanNormally:()=>void;
    
}

class UIAssetTableDetailMeta extends React.Component<UIAssetTableDetailMetaProps>{
    _fieldsToShowFloorPlans = ["name","floor","publishToADR","author","keywords","comments"];
    _fieldsToShowERPs = ["name","incidentTypeId","author","keywords","comments"];
    render(){
        let strCN:string = "detailMetaContent twocolumnsB";

        let arrFieldsToShow:string[] = [];
        let jsxMetaItems:JSX.Element[] = [];

        
        let isFloorPlan:boolean = false;


        switch(this.props.type.assetTypeId){
            case FloorPlansData.TYPE:
                isFloorPlan=true;
                arrFieldsToShow = this._fieldsToShowFloorPlans;
            break;
            case ERPData.TYPE:
                arrFieldsToShow = this._fieldsToShowERPs;
            break;
        }




        arrFieldsToShow.forEach(($value)=>{
            if(this.props.data.assetMeta.hasOwnProperty($value)){
                let metaConfig = this.props.type.metaConfig.find(($metaValue)=>{
                    return $metaValue.fieldName===$value;
                });

                if(metaConfig){
                    let value:string | JSX.Element = "";

                    switch(metaConfig.dataType){
                        case "boolean":

                            if(this.props.data.assetMeta[$value]){
                                value = metaConfig.yesLabel!;
                            }else{
                                value = metaConfig.noLabel!;
                            }

                        break;
                        default:// aka "text"

                            switch(metaConfig.render){
                                case "dropdownList":
                                    switch(metaConfig.listSource){
                                        case "incidentTypes":

                                            let incidentType = User.state.allIncidentTypes.find(($typeValue)=>{
                                                return ($typeValue.incidentTypeId===this.props.data.assetMeta[$value]);
                                            });

                                            if(incidentType){
                                                value = (
                                                    <UIIncidentTypeIcon type={incidentType} showLabel/>
                                                );
                                            }else{
                                                value = this.props.data.assetMeta[$value];
                                            }
                                        break;
                                        default:
                                            value = this.props.data.assetMeta[$value];
                                    }

                                break;
                                default://aka "text-input"
                                    value = this.props.data.assetMeta[$value];
                            }
                    }
                    if(value){

                        jsxMetaItems.push((
                            <UIViewFieldsItem key={jsxMetaItems.length+""+$value} title={metaConfig.fieldLabel} value={value}/>
                        ));
                    }
                }
            }
        });

        let createDate = new Date(this.props.data.asset.createDts*1000);

        let lastUpdate = new Date(this.props.data.asset.updateDts*1000);
        
        let strCreateDate:string = FormatUtil.dateHMSMDY(createDate,true,false);
        let strLastUpdate:string = FormatUtil.dateHMSMDY(lastUpdate,true,false);


        let fileSizeBytes = this.props.data.assetContent.currentVersion.contentSize;
        let strFileSize = FormatUtil.bytesToSize(fileSizeBytes);

        let fileTypeURL = getFileTypeURL(this.props.data.assetContent.currentVersion.contentType);

        
        jsxMetaItems.push((
            <UIViewFieldsItem extraClassName="fileSize" key={this.props.data.asset.assetId+"fileSize"} title={"File Size"} value={(
                <>
                    {strFileSize}
                    <img src={fileTypeURL} alt=""/>
                </>
            )}/>
        ));

        jsxMetaItems.push((
            <UIViewFieldsItem key={this.props.data.asset.assetId+"lastUpdate"} title={"Last Update"} value={strLastUpdate}/>
        ));
        jsxMetaItems.push((
            <UIViewFieldsItem key={this.props.data.asset.assetId+"created"} title={"Created"} value={strCreateDate}/>
        ));


        return (
            <UIWhiteBox extraClassName={strCN}>
                <div className="detailMetaButtons">
                    {this.props.mode===UIDetailFrame.MODE_VIEW && isFloorPlan && (
                        <>
                            {this.props.displayFloorPlanOnMap && (
                                <UIButton size={UIButton.SIZE_SMALL} onClick={this.props.onDisplayFloorPlanNormally} label="View Full Image" color={UIButton.COLOR_LIGHTGREY} icon={fileImage} horizontalAlign={UIButton.ALIGN_LEFT} iconEdge/>
                            )}
                            {!this.props.displayFloorPlanOnMap && (
                                <UIButton size={UIButton.SIZE_SMALL} onClick={this.props.onDisplayFloorPlanOnMap} label="View Map Position" color={UIButton.COLOR_LIGHTGREY} icon={mapMarker} horizontalAlign={UIButton.ALIGN_LEFT} iconEdge/>
                            )}
                        </>
                    )}
                    <UIButton size={UIButton.SIZE_SMALL} onClick={this.props.onDownload} label="Download" color={UIButton.COLOR_LIGHTGREY} icon={downloadIcon} horizontalAlign={UIButton.ALIGN_LEFT} iconEdge/>
                    <UIButton size={UIButton.SIZE_SMALL} onClick={this.props.onOpenNewWindow} label="Open in New Window" color={UIButton.COLOR_LIGHTGREY} icon={launchIcon} horizontalAlign={UIButton.ALIGN_LEFT} iconEdge/>
                </div>
                <UIViewFields>
                    {jsxMetaItems}
                </UIViewFields>
            </UIWhiteBox>
        )
    }
}