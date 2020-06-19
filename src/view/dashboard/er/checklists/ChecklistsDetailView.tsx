import React from 'react';
import UIView from '../../../../ui/UIView';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import ChecklistsView from './ChecklistsView';
import Api, { IErrorType } from '../../../../api/Api';
import ChecklistData from '../../../../data/ChecklistData';

import User from '../../../../data/User';
import UIWhiteBox from '../../../../ui/UIWhiteBox';
import ChecklistsEditFields from './ChecklistsEditFields';
import UIViewFields, { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import { UIDeleteButton } from '../../../../ui/UIButton';
import ConfirmOverlay from '../../../../overlay/ConfirmOverlay';
import LoadingOverlay from '../../../../overlay/LoadingOverlay';


import deleteIcon from '@iconify/icons-mdi/delete';
import UIIncidentTypeIcon from '../../../../ui/UIIncidentTypeIcon';
import { getIncidentTypeById } from '../../../../data/IncidentData';
import './ChecklistsDetailView.scss';
import AlertOverlay from '../../../../overlay/AlertOverlay';

export interface IChecklistsDetailViewProps extends RouteComponentProps{
    checklistId?:string;
    mode:string;
    isDetailUserChecklist:boolean;
    
}

export interface IChecklistsDetailViewState {
    loading:boolean;
    error?:IErrorType;
    data?:ChecklistData;
}

export default class ChecklistsDetailView extends React.Component<IChecklistsDetailViewProps, IChecklistsDetailViewState> {
    static ID:string = "checklistsDetail";


    editFields:React.RefObject<ChecklistsEditFields> =  React.createRef();

    _isUnmounting:boolean=false;
    _saving:boolean=false;

    constructor(props: IChecklistsDetailViewProps) {
        super(props);

        let isLoading:boolean=false;
        if(this.props.checklistId){
            isLoading=true;
        }

        this.state = {
            loading:isLoading,
        }
    }
    componentDidMount(){
        if(this.props.checklistId){
            this._loadData();
        }
    }
    componentDidUpdate($prevProps:IChecklistsDetailViewProps){
        if(this.props.checklistId && this.props.checklistId!==$prevProps.checklistId){
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
                data:undefined,
            },()=>{

                const getChecklistComplete = ($success:boolean, $results:any)=>{
                        
                    if($success){
                        if(!this._isUnmounting){

                            let data:ChecklistData = new ChecklistData();
                            data.populate($results);

                            this.setState({loading:false, data:data});                        
                        }
        
                    }else{
                        if(!this._isUnmounting){
                            this.setState({loading:false, error:$results});
                        }
                    }
                }

                if(this.props.isDetailUserChecklist){
                    Api.checklistManager.getUserChecklist(this.props.checklistId!,getChecklistComplete);
                }else{
                    Api.checklistManager.getChecklist(this.props.checklistId!,getChecklistComplete);
                }

            });
            
        }
        
    }


    _save=($isNew:boolean)=>{

        let isValid:boolean = false;
        if(this.editFields.current){
            isValid = this.editFields.current.validate();

            //we let a force update to happen so the above "validate" has time to finish setting its state.
            this.forceUpdate(()=>{

                if(isValid && !this._saving && this.editFields.current){
                    this._saving=true;
    
                    let {validationError, name, appliesTo, incidentTypeId, opsRoleId, checklistItems, ...restState} = this.editFields.current.state;
                    const hideLoading = LoadingOverlay.show("saveChecklist","Saving Checklist...","Loading Please Wait");
    
    
                    let checklistDetails:any = {
                        checklist:name,
                        appliesTo:appliesTo,
                        checklistItems:checklistItems.map(($itemData)=>{
                            return {
                                checklistItem:$itemData.checklistItem
                            }
                        }),
                        incidentTypeIds:[incidentTypeId],
                        opsRoleIds:[opsRoleId]
                    }
    
                    if($isNew){

                        Api.checklistManager.addChecklist(checklistDetails,($success:boolean, $results:any)=>{
                            hideLoading();
                            if($success){

                                User.setSuccessAddedNewNotification("checklist","Checklist",name);

                                this.props.history.push(ChecklistsView.PATH);
                            }else{
                                AlertOverlay.show("errorSaving","Error Saving");
    
                            }
                        });
                    }else{

                        Api.checklistManager.updateChecklist(this.props.checklistId!,checklistDetails,($success:boolean, $results:any)=>{
                            hideLoading();
                            if($success){
                                User.setSuccessEditedNotification("checklist","Checklist",name);
                                this.props.history.push(ChecklistsView.PATH);
                            }else{
                                AlertOverlay.show("errorSaving","Error Saving");
    
                            }
                        });
                    }

    
                }
            })
        }

    }
    _onSaveNew=()=>{
        this._save(true);
    }
    _onSaveEdit=()=>{
        this._save(false);
    }
    _onClickDelete=()=>{
        if(this.state.data){

            ConfirmOverlay.show("confirmDeleteChecklist",()=>{
                const hideLoading = LoadingOverlay.show("deleteChecklist","Deleting Checklist...","Loading Please Wait");
                
                Api.checklistManager.deleteChecklist(this.props.checklistId!,($success:boolean, $results:any)=>{
                    hideLoading();
                    
                    if(!this._isUnmounting){

                        if($success){
                            this.props.history.push(ChecklistsView.PATH);
                        }else{
                            AlertOverlay.show("errorDelete","Error Deleting");
                        }
                    }
                });

            },"Are you sure you want to delete "+this.state.data.name+"?", "Confirm Delete","Delete","Cancel",deleteIcon);
    
        }
    }
    render() {


        let strDetailName:string = "";
        
        let doesDataMatchSelectedOrg:boolean = false;
        let showDistrictLbl:boolean=false;

        if(this.state.data){
            strDetailName = this.state.data.name;

            if(this.state.data.orgId===User.selectedOrg.orgId){
                doesDataMatchSelectedOrg=true;
            }

            if(User.selectedOrg.parentOrgId===this.state.data.orgId){
                showDistrictLbl=true;
            }
        }

        
        

        let canNew = User.selectedOrg.rgChecklists.canAdd;
        let canEdit = User.selectedOrg.rgChecklists.canEdit && doesDataMatchSelectedOrg;
        let canDelete = User.selectedOrg.rgChecklists.canDelete && doesDataMatchSelectedOrg;

        if(this.props.isDetailUserChecklist){
            canEdit=false;
        }



        let basePath:string = ChecklistsView.PATH;

        let jsxContent:JSX.Element = <></>;
        let jsxViewEditContent:JSX.Element = <></>;
        let jsxExtraHeaderOptions:JSX.Element = <></>;

        switch(this.props.mode){
            case UIDetailFrame.MODE_NEW:
                jsxContent = (
                    <>
                        <UIWhiteBox extraClassName="assetTableDetailContent">        
                            <ChecklistsEditFields ref={this.editFields}/>
                        </UIWhiteBox>
                    </>
                );
            break;
            case UIDetailFrame.MODE_VIEW:
                if(this.state.data){

                    jsxExtraHeaderOptions = (
                        <>
                            {!canEdit && showDistrictLbl && (
                                <div className="greyBubble">{User.selectedOrg.terminologyList.parent_org.singular}</div>
                            )}
                        </>
                    );

                    jsxViewEditContent = (
                        <>
                            <UIViewFields extraClassName="singleField">
                                <UIViewFieldsItem fullWidth title="Steps" value={(
                                    <ul className="stepsView">
                                        {this.state.data.checklistItems.map(($value, $index)=>{
                                            return (    
                                                <li key={"stepItem"+$index}>
                                                    <div className="index">{($index+1)}</div>
                                                    <div className="text">{$value.checklistItem}</div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}/>
                            </UIViewFields>
                            
                        </>
                    );
                }
            break;
            case UIDetailFrame.MODE_EDIT:
                if(this.state.data){
                    jsxViewEditContent = (
                        <>
                            <ChecklistsEditFields ref={this.editFields} data={this.state.data}/>
                            <div className="footerOptions">
                                {canDelete && (
                                    <UIDeleteButton onClick={this._onClickDelete} />
                                )}
                            </div>
                            {!canEdit && (
                                <>
                                    <Redirect to={ChecklistsView.PATH}/>
                                </>
                            )}
                        </>                        
                    );                    
                }
            break;
        }


        switch(this.props.mode){
            case UIDetailFrame.MODE_EDIT:
            case UIDetailFrame.MODE_VIEW:

                if(this.props.isDetailUserChecklist){
                    basePath=ChecklistsView.PATH_USER;
                }

                if(this.state.data){    
                    
                    let mainwhiteBoxCN:string = "twocolumnsA detailMainContent";
                    if(this.props.mode===UIDetailFrame.MODE_VIEW){
                        mainwhiteBoxCN+=" lessPadding";
                    }
                    let sideWhiteBoxCN:string = "twocolumnsB detailMetaContent";


                    let incidentType = getIncidentTypeById(this.state.data.firstIncidentTypeId);


                    let strDateTitle:string = "Created";
                    let strDate:string = this.state.data.dateCreated;
                    let strAuthorTitle:string = "Created By";
                    let strAuthor:string = this.state.data.createdBy;
                    if(this.state.data.updatedBy){
                        strAuthorTitle = "Modified By";
                        strAuthor = this.state.data.updatedBy;
                    }
                    if(this.state.data.dateModified){
                        strDateTitle = "Last Modified";
                        strDate = this.state.data.dateModified;
                    }
                    let strAppliesTo:string = "";
                    
                    if(this.state.data.appliesToLabel){
                        strAppliesTo = this.state.data.appliesToLabel;
                    }

                    jsxContent = (
                        <div className="twocolumns">
                            <UIWhiteBox extraClassName={mainwhiteBoxCN}>
                                {jsxViewEditContent}
                            </UIWhiteBox>
                            <UIWhiteBox extraClassName={sideWhiteBoxCN}>
                                <div className="detailMetaButtons"></div>    
                                <UIViewFields>                           
                                    <UIViewFieldsItem title="Checklist Name" value={this.state.data.name}/>     
                                    {incidentType && (
                                        <UIViewFieldsItem title="Event Type" value={(<UIIncidentTypeIcon showLabel type={incidentType}/>)}/>
                                    )}     
                                    <UIViewFieldsItem title="Operational Role" value={this.state.data.firstOpRoleName}/>
                                    <UIViewFieldsItem title="Applies to" value={strAppliesTo}/>
                                    <UIViewFieldsItem title={strAuthorTitle} value={strAuthor}/>
                                    <UIViewFieldsItem title={strDateTitle} value={strDate}/>
                                </UIViewFields>                                
                            </UIWhiteBox>
                        </div>
                    );
                }
            break;
        }

        let overrideRootBasePath;

        //this is to make sure we never end up on /mychecklists by itself.
        if(this.props.isDetailUserChecklist){
            overrideRootBasePath = ChecklistsView.PATH;
        }

        let detailPath;

        if(this.props.checklistId){
            detailPath = "/"+this.props.checklistId;
        }
        
        return (
            <UIView id={ChecklistsDetailView.ID} usePadding useScrollContainer >
                <UIDetailFrame
                    loading={this.state.loading}
                    error={this.state.error}
                    singularLabel="Checklist"
                    mode={this.props.mode}
                    detailPath={detailPath}
                    detailName={strDetailName}
                    baseIcon={ChecklistsView.ICON}
                    baseTitle=""
                    basePath={basePath}
                    overrideRootBasePath={overrideRootBasePath}                    
                    canEdit={canEdit}
                    canNew={canNew}   
                    onSaveNew={this._onSaveNew}
                    onSaveEdit={this._onSaveEdit}
                    extraHeaderOptions={jsxExtraHeaderOptions}
                                     
                >
                    {jsxContent}
                </UIDetailFrame>
            </UIView>
        );
    }
}
