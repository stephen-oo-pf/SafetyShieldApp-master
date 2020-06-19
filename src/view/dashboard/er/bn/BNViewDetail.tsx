import * as React from 'react';
import UIView from '../../../../ui/UIView';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import ERView from '../ERView';
import Api, { IErrorType, ApiCallback } from '../../../../api/Api';
import { IBroadcastData } from '../../../../data/BroadcastData';
import BNMasterView from './BNViewMaster';
import User from '../../../../data/User';
import { RouteComponentProps } from 'react-router-dom';
import BNEditFields from './BNEditFields';
import { UIDeleteButton } from '../../../../ui/UIButton';
import ConfirmOverlay from '../../../../overlay/ConfirmOverlay';
import UIViewFields, { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import { getIncidentTypeById, getIncidentStatusById } from '../../../../data/IncidentData';
import UIIncidentTypeIcon from '../../../../ui/UIIncidentTypeIcon';
import LoadingOverlay from '../../../../overlay/LoadingOverlay';
import AlertOverlay from '../../../../overlay/AlertOverlay';
import BNView from './BNView';

export interface IBNViewDetailProps extends RouteComponentProps {
    mode:string;
    incidentBroadcastId?:string;
}

export interface IBNViewDetailState {
    loading:boolean;
    error?:IErrorType;
    data?:IBroadcastData;
}

export default class BNViewDetail extends React.Component<IBNViewDetailProps, IBNViewDetailState> {
    static ID:string = "bnDetail";


    editFields:React.RefObject<BNEditFields> =  React.createRef();

    _saving:boolean=false;

    _unmounting:boolean=false;

    constructor(props: IBNViewDetailProps) {
        super(props);

        this.state = {
            loading:true,
        }
    }

    componentDidMount(){     
        this._loadData();
    }
    componentDidUpdate($prevProps:IBNViewDetailProps){
        if(this.props.incidentBroadcastId!==$prevProps.incidentBroadcastId){
            this._loadData();
        }
    }
    
    componentWillUnmount(){
        this._unmounting=true;
    }
    
    _loadData=()=>{
        this.setState({loading:true, error:undefined, data:undefined},()=>{            
            Api.incidentManager.getBNBasic(($basicsuccess,$basicresults)=>{
                if($basicsuccess){
                    if(this.props.incidentBroadcastId){
                        Api.orgManager.getOrgBroadcast(this.props.incidentBroadcastId!,($success, $results)=>{
                            if(!this._unmounting){            
                                if($success){
                                    this.setState({loading:false, data:$results.data});
                                }else{
                                    this.setState({loading:false, error:$results});
                                }
                            }
                        });
                    }else{
                        if(!this._unmounting){ 
                            this.setState({loading:false});
                        }
                    }
                }else{
                    if(!this._unmounting){      
                        this.setState({loading:false, error:$basicresults});
                    }
                }
            });
        });
    }
    
    _save=()=>{

        let isValid:boolean = false;
        if(this.editFields.current){
            isValid = this.editFields.current.validate();
            this.forceUpdate(()=>{
                if(isValid && !this._saving && this.editFields.current){

                    this._saving=true;
                    
                    let {validationError, ...details} = this.editFields.current.state;

                    let broadcast = User.selectedOrg.getBroadcastListItem(details.broadcastId);
                    
                    const hideLoading = LoadingOverlay.show("saveBN","Saving Broadcast...","Loading Please Wait");


                    const loadingDone:ApiCallback = ($success:boolean,$results:any)=>{
                        hideLoading();
                        this._saving=false;
                        if($success){

                        }else{                            
                            AlertOverlay.show("errorSaving","Error Saving");
                        }

                    }

                    switch(this.props.mode){
                        case UIDetailFrame.MODE_NEW:
                            Api.orgManager.addOrgBroadcast(details,($success,$results)=>{
                                
                                let bname:string="";
                                if(broadcast){
                                    bname = broadcast.name+" ["+broadcast.username+"]";
                                }
                                User.setSuccessAddedNewNotification("broadcast","Broadcast",bname);

                                loadingDone($success,$results);
                                if($success){
                                    if(!this._unmounting){
                                        this.props.history.push(BNView.PATH);
                                    }
                                }
                            });
                        break;
                        case UIDetailFrame.MODE_EDIT:

                            Api.orgManager.updateOrgBroadcast(this.props.incidentBroadcastId!, details,($success,$results)=>{
                                
                                let bname:string="";
                                if(broadcast){
                                    bname = broadcast.name+" ["+broadcast.username+"]";
                                }
                                User.setSuccessEditedNotification("broadcast","Broadcast",bname);

                                loadingDone($success,$results);
                                if($success){
                                    if(!this._unmounting){
                                        this.props.history.push(BNView.PATH);
                                    }
                                }
                            });
                        break;
                    }
                }
            });
        }
    }
    _onSaveNew=()=>{
        this._save();
    }
    _onSaveEdit=()=>{
        this._save();
    }

    _onClickDelete=()=>{
        ConfirmOverlay.show("confirmRemoveBN",()=>{            
            const hideLoading = LoadingOverlay.show("removeBN","Deleting Broadcast...","Loading Please Wait");
            Api.orgManager.deleteOrgBroadcast(this.props.incidentBroadcastId!,($success, $results)=>{
                hideLoading();
                if($success){
                    if(!this._unmounting){
                        this.props.history.push(BNView.PATH);
                    }
                }else{
                    AlertOverlay.show("errorRemovingBN","Error Removing");
                }
            });
        },"Are you sure you want to delete "+this.state.data!.name+"?","Confirm Delete","Delete","Cancel");
    }

    render() {

        let canEdit:boolean=true;
        let canNew:boolean=true;
        let canDelete:boolean=true;

        let detailPath;        
        let detailName;
        let cancelPath = BNView.PATH;


        if(this.state.data){
            detailPath = "/"+this.props.incidentBroadcastId;
            detailName = this.state.data.name;
        }


        let jsxContent:JSX.Element = <></>;
        switch(this.props.mode){
            case UIDetailFrame.MODE_NEW:
                jsxContent = (
                    <>
                        <BNEditFields ref={this.editFields}/>
                    </>
                );
            break;
            case UIDetailFrame.MODE_EDIT:

                cancelPath = BNView.PATH+"/"+this.props.incidentBroadcastId;
                jsxContent = (                    
                    <>
                        <BNEditFields ref={this.editFields} data={this.state.data}/>
                        <div className="footerOptions">
                            {canDelete && (
                                <UIDeleteButton onClick={this._onClickDelete} />
                            )}
                        </div>
                    </>
                );

            break;
            case UIDetailFrame.MODE_VIEW:
                if(this.state.data){

                    let incidentType = getIncidentTypeById(this.state.data.incidentTypeId);

                    let sentWhen = getIncidentStatusById(this.state.data.incidentStatusId);


                    let broadcastName = this.state.data.name+" ["+this.state.data.username+"]";


                    jsxContent = (
                        <>
                            <UIViewFields>
                                {incidentType && (
                                    <UIViewFieldsItem title={"Event Type"} value={(
                                        <UIIncidentTypeIcon type={incidentType} showLabel/>
                                    )}/>
                                )}
                                <UIViewFieldsItem title={"Sent when..."} value={sentWhen?.incidentStatus}/>
                                <UIViewFieldsItem fullWidth title={"SchoolMessenger Broadcast Name"} value={broadcastName}/>
                            </UIViewFields>
                        </>
                    );
                }
            break;
        }

        return (    
            <UIView id={BNViewDetail.ID} usePadding useScrollContainer>
                <UIDetailFrame
                    baseIcon={BNView.ICON}
                    basePath={BNView.PATH}
                    baseTitle="Broadcast Notifications"
                    canEdit={canEdit}
                    canNew={canNew}
                    cancelPath={cancelPath}
                    loading={this.state.loading}
                    mode={this.props.mode}
                    detailPath={detailPath}
                    detailName={detailName}
                    singularLabel={"Automatic Broadcast"}
                    contentIsWhiteBox  
                    onSaveNew={this._onSaveNew}
                    onSaveEdit={this._onSaveEdit}              
                >
                    {jsxContent}
                </UIDetailFrame>
            </UIView>  
        );
    }
}
