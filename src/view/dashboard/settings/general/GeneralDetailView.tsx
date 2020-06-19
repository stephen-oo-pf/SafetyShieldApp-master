import * as React from 'react';
import UIView from '../../../../ui/UIView';
import Api, { IErrorType } from '../../../../api/Api';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import GeneralView from './GeneralView';
import User, { IResultNotification } from '../../../../data/User';
import UIViewFields, { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import { Organization, getOrgType, parseOrgLandmarkPolygon } from '../../../../data/Organization';
import UIMapPolygonEditor from '../../../../ui/map/UIMapPolygonEditor';
import { RouteComponentProps } from 'react-router-dom';
import OrgsEditFields, { OrgsEditFieldsState } from '../../orgs/OrgsEditFields';
import LoadingOverlay from '../../../../overlay/LoadingOverlay';
import AlertOverlay from '../../../../overlay/AlertOverlay';

export interface IGeneralDetailViewProps extends RouteComponentProps{
    mode:string;
}

export interface IGeneralDetailViewState {
    loading:boolean;
    data?:Organization;
    error?:IErrorType;
    savingError?:string;
    resultNotification?:IResultNotification;
}

export default class GeneralDetailView extends React.Component<IGeneralDetailViewProps, IGeneralDetailViewState> {
    static ID:string = "generalDetail";

    _isUnmounting:boolean=false;
    _saving:boolean=false;

    
    editFields:React.RefObject<OrgsEditFields> = React.createRef();
    
    constructor(props: IGeneralDetailViewProps) {
        super(props);

        this.state = {
            loading:true
        }
    }

    
    componentDidMount(){
        this._loadData();
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

                Api.orgManager.getOrg(User.selectedOrg.orgId,($success:boolean, $results:any)=>{
                    
                    User.checkResultNotification("general",($notif)=>{
                        this.setState({resultNotification:$notif});
                    });
                    if($success){

                        let org:Organization = new Organization();
                        org.populate($results);
                            
                        if(!this._isUnmounting){
                            this.setState({loading:false, data:org});
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


    _onClearResultNotification=()=>{
        this.setState({resultNotification:undefined});
    }
    _onClearSavingError=()=>{
        this.setState({savingError:undefined});
    }
    _onClickSaveEdit=()=>{
        this._save();
    }

    _save=()=>{
        
        let isValid:boolean = false;
        if(this.editFields.current){ 
            isValid = this.editFields.current.validate();
        }

        if(isValid){
            if(!this._saving){
                this._saving=true;
                const hideLoading = LoadingOverlay.show("generalSave","Saving...","Loading Please Wait");
                
                if(this.editFields.current && this.editFields.current.polygonEditor.current && this.state.data){
                    
                    
                    let {orgName} = this.editFields.current.state;

                    let accountDetails:any = this.editFields.current.getBasicOrgData();
                    accountDetails.orgId = User.selectedOrg.orgId;  //add the orgId                    
                    if(this.state.data.landmarks && this.state.data.landmarks.length>0){                  
                        accountDetails.landmarks[0].orgLandmarkId=this.state.data.landmarks[0].orgLandmarkId;//add the id if editing.
                    }

                    
                    let singularType = User.selectedOrg.terminologyList.parent_org.singular;

                                           
                    Api.orgManager.updateOrg(accountDetails,($success:boolean, $results:any)=>{    
                        
                        if($success){
                            
                            Api.access.validateToken(($successVali:boolean, $resultsVali:any)=>{
                                hideLoading();
                                this._saving=false;                                
                                
                                if(!this._isUnmounting){
                                    User.setSuccessEditedNotification("general",singularType,orgName);                                    
                                    this.props.history.push(GeneralView.PATH);
                                }
                            });
                            
                        }else{
                            hideLoading();
                            this._saving=false;
                            AlertOverlay.show("errorSaving","Error Saving");
                        }

                    });



                }
            }
        }
    }

    render() {


        let parentTypeLbl = User.selectedOrg.terminologyList.parent_org.singular;
        let childTypeLbl = User.selectedOrg.terminologyList.child_org.singular;
        
        let jsxContent:JSX.Element = <></>;

        let isAccount:boolean=false;

        
        /*
        The UIDetailFrame below was originally built with a Master in mind. This section doesn't have a master so no real detailPath/detailName is needed.
        */
        let detailPath:string="";
        let detailName:string="";

        let forceShowEditBtn:boolean=false;

        if(this.state.data){

            
            let orgType = getOrgType(this.state.data.orgTypeId,User.state.orgTypes);

            if(this.state.data.isAccount){
                isAccount=true;
            }
            
            let street = "";
            let cityStateZip = "";
            if(this.state.data.primaryAddress){

                street = this.state.data.primaryAddressStreet;
                cityStateZip =this.state.data.primaryAddressCityStateZip;
            }
            
            let parsedPolygon = parseOrgLandmarkPolygon(this.state.data);

            let initPoints:google.maps.LatLng[] = [];
            let initMapCenter;

            if(parsedPolygon){
                initPoints = parsedPolygon.initPoints;
                initMapCenter = parsedPolygon.initMapCenter;
            }
            
            switch(this.props.mode){
                case UIDetailFrame.MODE_VIEW:


                    jsxContent = (
                        <>
                            <UIViewFields>
                                <UIViewFieldsItem title={isAccount?parentTypeLbl+" Name":childTypeLbl+" Name"} value={this.state.data.orgName}/>
                                
                                {orgType && (
                                    <UIViewFieldsItem title={"Type"} value={orgType.orgType}/>
                                )}                                    
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
                        </>
                    );
                break;
                case UIDetailFrame.MODE_EDIT:
                    forceShowEditBtn=true;
        
                    if(this.state.data){
                        jsxContent = (
                            <OrgsEditFields onlyShowLocationDetails data={this.state.data} ref={this.editFields} />
                        );
                    }
                break;
            }
        }



        return (            
            <UIView id={GeneralDetailView.ID} usePadding useScrollContainer>
                <UIDetailFrame
                    mode={this.props.mode}
                    loading={this.state.loading}
                    error={this.state.error}
                    baseIcon={GeneralView.ICON}
                    basePath={GeneralView.PATH}
                    baseTitle={"General"}
                    detailPath={detailPath}
                    detailName={detailName}
                    forceShowEditBtn={forceShowEditBtn}
                    contentIsWhiteBox={true}
                    canEdit={true}
                    onSaveEdit={this._onClickSaveEdit}
                    savingError={this.state.savingError}
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
