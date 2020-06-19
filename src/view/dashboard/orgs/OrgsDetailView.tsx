import React from 'react';
import UIView from '../../../ui/UIView';
import UIDetailFrame from '../../../ui/UIDetailFrame';
import OrgsView from './OrgsView';
import UIButton, { UIDeleteButton, } from '../../../ui/UIButton';
import { RouteComponentProps, NavLink } from 'react-router-dom';

import Api, { IErrorType, ApiCallback, ApiData } from '../../../api/Api';
import { Organization, getOrgType, parseOrgLandmarkPolygon } from '../../../data/Organization';


import OrgsEditFields, { OrgsEditFieldsState } from './OrgsEditFields';
import LoadingOverlay from '../../../overlay/LoadingOverlay';

import UIViewFields, { UIViewFieldsItem } from '../../../ui/UIViewFields';
import ConfirmOverlay from '../../../overlay/ConfirmOverlay';

import User, { IResultNotification } from '../../../data/User';

import deleteIcon from '@iconify/icons-mdi/delete';
import UIWhiteBox from '../../../ui/UIWhiteBox';
import viewDashboard from '@iconify/icons-mdi/view-dashboard';
import AlertOverlay from '../../../overlay/AlertOverlay';
import UIMapPolygonEditor from '../../../ui/map/UIMapPolygonEditor';
import MasterDetailSwitch from '../../../util/MasterDetailSwitch';
import UITabBar, {UITabBarItem, UITabBarContentContainer} from '../../../ui/UITabBar';
import UILoadingBox from '../../../ui/UILoadingBox';
import UIErrorBox from '../../../ui/UIErrorBox';
import UIIcon from '../../../ui/UIIcon';


import closeIcon from '@iconify/icons-mdi/close';

import checkIcon from '@iconify/icons-mdi/check';


export interface IOrgsDetailViewProps extends RouteComponentProps{
    orgId?:string;
    mode:string;
}

export interface IOrgsDetailViewState {
    curViewTab:string;
    loading:boolean;
    error?:IErrorType;
    organization?:Organization;
    parentOrganization?:Organization;
    
    resultNotification?:IResultNotification;


    
    smLoading:boolean;
    smLoadingError?:IErrorType;
    smSavingError?:string;
    smCustomerURL:string;
    smUsername:string;
    smInvalid:boolean;
    smValid:boolean;
    smLoadedAsValid:boolean;
}

export default class OrgsDetailView extends React.Component<IOrgsDetailViewProps, IOrgsDetailViewState> {
    static ID:string = "orgsDetail";

    static SECTION_LOCATION:string = "location";
    static SECTION_SM_INTEGRATION:string = "schoolMessengerIntegration"



    _saving:boolean=false;
    _deleting:boolean=false;

    editFields:React.RefObject<OrgsEditFields> = React.createRef();

    _isUnmounting:boolean=false;


    
    _viewTabs:UITabBarItem[] = [
        {
            id:OrgsDetailView.SECTION_LOCATION,
            label:"Location"
        },
        {
            id:OrgsDetailView.SECTION_SM_INTEGRATION,
            label:"SchoolMessenger Integration"
        }
    ];

    constructor(props: IOrgsDetailViewProps) {
        super(props);

        let loading:boolean=false;
        if(this.props.orgId){
            loading=true;
        }

        this.state = {
            loading:loading,
            smLoading:loading,
            curViewTab:OrgsDetailView.SECTION_LOCATION,
            
            smCustomerURL:"",
            smUsername:"",
            smInvalid:false,
            smValid:false,
            smLoadedAsValid:false,
        }
    }
    componentDidMount(){
        if(this.props.orgId){
            this._loadData();
        }
    }
    componentWillUnmount(){
        this._isUnmounting=true;
    }
    componentDidUpdate($prevProps:IOrgsDetailViewProps){
        if(this.props.orgId && this.props.orgId!==$prevProps.orgId!){
            this._loadData();
        }
    }
    checkForResults=()=>{
        User.checkResultNotification("orgs",($notif)=>{
            this.setState({resultNotification:$notif});
        });
        User.checkErrorResultNotification("orgs",($notif)=>{         
            this.setState({smSavingError:$notif.result});
        });
    }
    _loadData=()=>{
        if(!this._isUnmounting){
            this.setState({
                loading:true,  
                smLoading:true,
                error:undefined,
                organization:undefined,
                parentOrganization:undefined,
            },()=>{


                Api.orgManager.getOrgBroadcastConfiguration(this.props.orgId!,($success:boolean, $results:any)=>{
                    if($success){
                        
                        let customerURL:string = "";
                        let username:string = "";
                        let failures:string[] = [];
    
                        let success:boolean=false;

                        if($results.summary.success){
                            success=true;
    
                            if($results.data){
                                if($results.data.customerUrl){
                                    customerURL = $results.data.customerUrl;
                                }
                                if($results.data.usernames && $results.data.usernames.length>0){
                                    username = $results.data.usernames[0];
                                }
                                failures = $results.data.failures;
                            }
                        }

                        if(success){

                            let isValid:boolean=false;
                            let isInvalid:boolean=false;
                            if(customerURL!=="" && username!==""){
                                //if the username is NOT inside the failures array its valid, if it IS its invalid
                                let found = failures.find($failure=>$failure===username);
                                if(!found){
                                    isValid=true;
                                }else{
                                    isInvalid=true;
                                }
                            }

                            this.setState({smLoading:false, smValid:isValid, smInvalid:isInvalid, smLoadedAsValid:isValid, smCustomerURL:customerURL, smUsername:username});

                        }else{
                            this.setState({smLoading:false, smLoadingError:ApiData.ERROR_LOADING});
                        }

                    }else{
                        this.setState({smLoading:false, smLoadingError:$results});
                    }
                });


                Api.orgManager.getOrg(this.props.orgId!,($success:boolean, $results:any)=>{
                    if($success){

                        let org:Organization = new Organization();
                        org.populate($results);

                        if(org.parentOrgId!==null){
                            //also load parent
                            if(!this._isUnmounting){                                
                                Api.orgManager.getOrg(org.parentOrgId, ($successParent:boolean, $resultsParent:any)=>{

                                    if(!this._isUnmounting){

                                        if($successParent){

                                            let parentOrg:Organization = new Organization();
                                            parentOrg.populate($resultsParent);
                                            this.setState({loading:false, organization:org, parentOrganization:parentOrg});

                                            this.checkForResults();
                                        }else{
                                            this.setState({loading:false, error:$results});
                                        }
                                    }

                                });
                            }
                        }else{
                            
                            if(!this._isUnmounting){
                                this.setState({loading:false, organization:org});
                                
                                this.checkForResults();
                                
                            }
                        }
        
                    }else{
                        if(!this._isUnmounting){
                            this.setState({loading:false, error:$results});
                        }
                    }
                });
            });
            
        }
        
    }


    _onClickSaveEdit=()=>{
        this._submit();
    }
    _onClickSaveNew=()=>{
        this._submit();
    }

    _submit=()=>{
        let isValid:boolean = false;
        if(this.editFields.current){ 
            isValid = this.editFields.current.validate();
        }

        if(isValid){
            if(!this._saving){
                this._saving=true;
                const hideLoading = LoadingOverlay.show("orgSave","Saving...","Loading Please Wait");

                if(this.editFields.current && this.editFields.current.polygonEditor.current){
                    let editFieldsState:OrgsEditFieldsState = this.editFields.current.state;
                    let {initPoints, address1, address2, city, state, zip, country, orgName, orgTypeId, description, smValid, smLoadedAsValid, smCustomerURL, smUsername, smError, ...rest} = editFieldsState;

                    let accountDetails:any = this.editFields.current.getBasicOrgData();

                    let singularType = User.selectedOrg.terminologyList.parent_org.singular;
                    if(this.state.parentOrganization){
                        singularType = User.selectedOrg.terminologyList.child_org.singular;
                    }
                    if(this.props.orgId && this.props.mode===UIDetailFrame.MODE_NEW){
                        singularType = User.selectedOrg.terminologyList.child_org.singular;
                    }


                    const loadingComplete=($success:boolean,$successPath?:string, $error?:IErrorType)=>{
                        if($success){
                            
                            Api.access.validateToken(($successVali:boolean, $resultsVali:any)=>{

                                hideLoading();
                                this._saving=false;
                                switch(this.props.mode){
                                    case UIDetailFrame.MODE_NEW:
                                        User.setSuccessAddedNewNotification("orgs",singularType,orgName);
                                    break;
                                    case UIDetailFrame.MODE_EDIT:
                                        User.setSuccessEditedNotification("orgs",singularType,orgName);
                                    break;
                                }
                                
                                if(!this._isUnmounting && $successPath){
                                    this.props.history.push($successPath);
                                }
                            });
                            
                        }else{
                            hideLoading();
                            this._saving=false;
                            
                            let error:string = "Error Saving";
                            if($error){
                                error =$error.desc;
                            }
                            AlertOverlay.show("errorSaving",error);
                        }
                    }

                    const setOrgBroadcastConfiguration = ($orgId:string,$complete:ApiCallback)=>{

                        let usernames:string[] = [];
                        if(smUsername && smUsername!==""){
                            usernames.push(smUsername);
                        }

                        Api.orgManager.setOrgBroadcastConfiguration($orgId,smCustomerURL,usernames,$complete);
                    }

                    
                    switch(this.props.mode){
                        case UIDetailFrame.MODE_NEW:
                            /*
                            For adding, we add the org first then if smValid is true we set the broadcast config after.

                            if the broadcast config is success we proceed as normal
                            if the broadcast config fails we redirect to the newly added orgs Edit page and show a success add status banner && a fail of school messenger banner
                            */

                            if(this.props.orgId){//if this exists during new its because its being added to the parent...
                                accountDetails.parentOrgId = this.props.orgId;
                            }

                            Api.orgManager.addOrg(accountDetails,($success:boolean, $results:any)=>{

                                if($success){
                                    if(smValid && !smError){
                                        //$results is the newly added orgId
                                        let newlyAddedOrgId = $results;
                                        setOrgBroadcastConfiguration(newlyAddedOrgId,($broadcastsuccess, $broadcastresults)=>{
                                            if($broadcastsuccess){
                                                loadingComplete(true,OrgsView.PATH);
                                            }else{
                                                User.setErrorResultNotification("orgs","Although the "+singularType+" was added successfully, the School Messenger Integration failed to save. Please try saving the School Messenger Integration again. Error: "+$broadcastresults.desc);
                                                loadingComplete(true,OrgsView.PATH+"/"+newlyAddedOrgId+MasterDetailSwitch.PATH_EDIT);
                                            }
                                        });
                                    }else{
                                        loadingComplete(true,OrgsView.PATH);
                                    }
                                }else{
                                    loadingComplete(false);
                                }
                            });
                        break;
                        case UIDetailFrame.MODE_EDIT:
                            /*
                            For Editing, we save broadcast config first because we already have an orgId

                            If broadcast is success we continue with the update of the Org
                            if broadcast fails we show an error status banner

                            */

                            if(this.props.orgId){
                                accountDetails.orgId = this.props.orgId;
                                if(this.state.organization && this.state.organization.landmarks && this.state.organization.landmarks.length>0){

                                    accountDetails.landmarks[0].orgLandmarkId=this.state.organization.landmarks[0].orgLandmarkId;//add the id if editing.
                                }
                            }
                            const updateOrg = ()=>{                            
                                Api.orgManager.updateOrg(accountDetails,($success:boolean, $results:any)=>{    
                                    loadingComplete($success,OrgsView.PATH,$results);                      
                                });
                            }


                            if((smValid || smLoadedAsValid) && !smError){
                                setOrgBroadcastConfiguration(this.props.orgId!,($broadcastsuccess, $broadcastresults)=>{

                                    if($broadcastsuccess){
                                        updateOrg();
                                    }else{

                                        this.setState({smSavingError:"The School Messenger Integration failed to save. Please verify your entries and try again. Error: "+$broadcastresults.desc});
                                        hideLoading();
                                        this._saving=false;
                                    }
                                });
                            }else{
                                updateOrg();
                            }

                        break;
                    }

                }

            }
        }
    }
    _onDeleteOrg=()=>{

        if(this.state.organization){

            ConfirmOverlay.show("deleteOrgConfirm",this._deleteOrg,"Please confirm you want to delete "+this.state.organization.orgName,"Confirm Delete","Delete","Cancel",deleteIcon);
        }
    }
    _deleteOrg=()=>{
        if(!this._deleting){
            this._deleting=true;
            const hideLoading = LoadingOverlay.show("orgDelete","Deleting...","Loading Please Wait");
            Api.orgManager.deleteOrg(this.props.orgId!,($success:boolean, $results:any)=>{


                Api.access.validateToken(($successVali:boolean, $resultsVali:any)=>{

                    this._deleting=false;
                    hideLoading();
                    if($success){
                        
                        if(!this._isUnmounting){
                            this.props.history.push(OrgsView.PATH);
                        }
                    }else{
                        
                        AlertOverlay.show("errorDeleting","Error Deleting");
                        
                    }
                });
                

            });
        }
    }
    _onViewDashboard=()=>{
        
        
        if(this.state.organization){
            User.setSelectedOrganizationById(this.state.organization.orgId);
        }
    }

    _onTabChange=($id:string)=>{
        this.setState({curViewTab:$id});
    }

    _onClearSavingError=()=>{
        this.setState({smSavingError:""});
    }

    _onClearResultNotification=()=>{
        this.setState({resultNotification:undefined});
    }
    render() {

        let strDetailName:string = "";
        let strParentDetailName;
        let parentDetailPath;

        let detailPath;

        


        let strSingularLabel:string = User.selectedOrg.terminologyList.parent_org.singular;
        if(this.state.organization){
            strSingularLabel = User.selectedOrg.terminologyList.child_org.singular;
        }
        

        if(this.props.orgId){
            detailPath = "/"+this.props.orgId;
        }
        let isAccount:boolean = false;

        let isAbleToCreateChildren:boolean=false;


        if(this.state.organization){
            if(this.state.organization.isAccount){
                isAccount=true;
                isAbleToCreateChildren=true;
            }
            strDetailName = this.state.organization.orgName;            
            if(this.state.parentOrganization){

                parentDetailPath = "/"+this.state.parentOrganization.orgId;
                strParentDetailName = this.state.parentOrganization.orgName;
            }
        }

        
        
        

        let canEdit = User.selectedOrg.rgOrgs.canEdit;
        let canNew = User.selectedOrg.rgOrgs.canAdd;          
        let canDelete = User.selectedOrg.rgOrgs.canDelete;

        let contentIsWhiteBox:boolean=true;

        let jsxContent:JSX.Element = <></>;

        switch(this.props.mode){
            case UIDetailFrame.MODE_VIEW:

                contentIsWhiteBox=false;

                if(this.state.organization){

                    let orgType = getOrgType(this.state.organization.orgTypeId,User.state.orgTypes);

                    let street = "";
                    let cityStateZip = "";
                    if(this.state.organization.primaryAddress){

                        street = this.state.organization.primaryAddressStreet;
                        cityStateZip =this.state.organization.primaryAddressCityStateZip;
                    }


                    let parsedPolygon = parseOrgLandmarkPolygon(this.state.organization);

                    let initPoints:google.maps.LatLng[] = [];
                    let initMapCenter;

                    if(parsedPolygon){
                        initPoints = parsedPolygon.initPoints;
                        initMapCenter = parsedPolygon.initMapCenter;
                    }

                    let parentTypeLbl = User.selectedOrg.terminologyList.parent_org.singular;
                    let childTypeLbl = User.selectedOrg.terminologyList.child_org.singular;

                    /*
                                    <UIViewFieldsItem title="Description" value={this.state.organization.description}/>

                    */

                    let jsxSubContent = <></>;
                    switch(this.state.curViewTab){
                        case OrgsDetailView.SECTION_LOCATION:
                            jsxSubContent = (
                                <UIViewFields key={this.state.curViewTab}>                 
                                    {street!=="" && (
                                        <UIViewFieldsItem title="Address" value={(
                                            <>
                                                <div className="street">{street}</div>
                                                <div className="cityStateZip">{cityStateZip}</div>
                                            </>
                                        )}/>
                                    )}    
                                    {parsedPolygon && (
                                        <UIMapPolygonEditor 
                                            viewOnlyMode
                                            initPoints={initPoints}
                                            initCenter={initMapCenter}
                                        /> 
                                    )}   
                                </UIViewFields>
                            );
                        break;
                        case OrgsDetailView.SECTION_SM_INTEGRATION:
                            
                            if(this.state.smLoading){
                                jsxSubContent = (
                                    <UILoadingBox/>
                                );
                            }else if(this.state.smLoadingError){
                                jsxSubContent = (
                                    <UIErrorBox error={this.state.smLoadingError.desc}/>
                                )
                            }else{
                                //we can assume here we have loaded something
                                jsxSubContent = (
                                    <UIViewFields key={this.state.curViewTab}>  
                                        <UIViewFieldsItem
                                            title="Customer URL"
                                            value={this.state.smCustomerURL}
                                        />
                                        <UIViewFieldsItem
                                            title="SchoolMessenger Username"
                                            value={this.state.smUsername}
                                        />                                               
                                        {this.state.smInvalid &&  (
                                            <div className="fieldItem smValidateState invalid"><UIIcon icon={closeIcon}/>Invalid</div>
                                        )}
                                        {this.state.smValid &&  (
                                            <div className="fieldItem smValidateState valid"><UIIcon icon={checkIcon}/>Valid</div>
                                        )}    
                                        <UIViewFieldsItem
                                            fullWidth
                                            value={(
                                                <div style={{height:"50px"}}/>
                                            )}
                                        />                                    
                                    </UIViewFields>
                                )
                            }
                        break;
                    }

                    jsxContent = (
                        <div className="twocolumns">
                            <UIWhiteBox extraClassName="twocolumnsA detailMainContent">
                                <UIViewFields>
                                    <UIViewFieldsItem title={isAccount?parentTypeLbl+" Name":childTypeLbl+" Name"} value={this.state.organization.orgName}/>
                                    {this.state.parentOrganization && (
                                        <>
                                            <UIViewFieldsItem title={"Parent "+parentTypeLbl+" Name"} value={(<NavLink to={OrgsView.PATH+"/"+this.state.parentOrganization.orgId}>{this.state.parentOrganization.orgName}</NavLink>)}/>
                                        </>
                                    )}
                                    {orgType && (
                                        <UIViewFieldsItem title={"Type"} value={orgType.orgType}/>
                                    )}      
                                    <UIWhiteBox extraClassName="fieldItem fullWidth" noPadding>
                                        <UITabBar horizontal disableSelected selectedID={this.state.curViewTab} data={this._viewTabs} onChange={this._onTabChange}/>
                                        <UITabBarContentContainer>
                                            {jsxSubContent}
                                        </UITabBarContentContainer>
                                    </UIWhiteBox>                                                                     
                                </UIViewFields>
                            </UIWhiteBox>
                            <UIWhiteBox extraClassName="twocolumnsB detailMetaContent">                                
                                <div className="detailMetaButtons">
                                    <UIButton size={UIButton.SIZE_SMALL} onClick={this._onViewDashboard} label="View Dashboard" color={UIButton.COLOR_LIGHTGREY} icon={viewDashboard} horizontalAlign={UIButton.ALIGN_LEFT} iconEdge fullWidth/>
                                </div>
                            </UIWhiteBox>
                        </div>

                    );
                }
            break;
            case UIDetailFrame.MODE_EDIT:
                
                if(this.state.organization){

                    jsxContent = (
                        <>
                            <OrgsEditFields data={this.state.organization} ref={this.editFields} />
                            <div className="footerOptions">
                                {canDelete && (
                                    <UIDeleteButton onClick={this._onDeleteOrg}/>
                                )}
                            </div>
                        </>
                    );
                }
            break;
            case UIDetailFrame.MODE_NEW:

                jsxContent = (
                    <>
                        <OrgsEditFields addingParent={this.state.organization} ref={this.editFields} />                        
                    </>
                );
            break;
        }

        return (
            <UIView id={OrgsDetailView.ID} usePadding useScrollContainer>
                
                <UIDetailFrame
                    mode={this.props.mode}
                    loading={this.state.loading}
                    error={this.state.error}
                    singularLabel={strSingularLabel}
                    detailPath={detailPath}
                    detailName={strDetailName}
                    parentDetailPath={parentDetailPath}
                    parentDetailName={strParentDetailName}
                    baseIcon={OrgsView.ICON}
                    basePath={OrgsView.PATH}
                    baseTitle={""}
                    contentIsWhiteBox={contentIsWhiteBox}
                    canEdit={canEdit}
                    canNew={canNew}
                    onSaveEdit={this._onClickSaveEdit}
                    onSaveNew={this._onClickSaveNew}
                    isAbleToCreateChildren={isAbleToCreateChildren}
                    savingError={this.state.smSavingError}
                    onClearSavingError={this._onClearSavingError}
                    resultNotification={this.state.resultNotification}
                    onClearResultNotification={this._onClearResultNotification}
                >
                    {jsxContent}
                </UIDetailFrame>

            </UIView>
        );
    }
}
