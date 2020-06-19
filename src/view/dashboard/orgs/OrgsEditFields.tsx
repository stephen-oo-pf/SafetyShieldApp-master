import React from 'react';
import UIInput from '../../../ui/UIInput';

import { Organization, parseOrgLandmarkPolygon } from '../../../data/Organization';
import UIEditFields from '../../../ui/UIEditFields';
import UIMapPolygonEditor from '../../../ui/map/UIMapPolygonEditor';
import User from '../../../data/User';
import FormatUtil from '../../../util/FormatUtil';

import UIButton from '../../../ui/UIButton';
import closeIcon from '@iconify/icons-mdi/close';

import checkIcon from '@iconify/icons-mdi/check';

import informationOutline from '@iconify/icons-mdi/information-outline';

import mapMarker from '@iconify/icons-mdi/map-marker';
import { UIViewFieldsItem } from '../../../ui/UIViewFields';
import LoadingOverlay from '../../../overlay/LoadingOverlay';
import AlertOverlay from '../../../overlay/AlertOverlay';
import Api, { IErrorType, ApiData } from '../../../api/Api';
import UITabBar, { UITabBarItem } from '../../../ui/UITabBar';
import UIIcon from '../../../ui/UIIcon';
import './OrgEditFields.scss';
import UIStatusBanner from '../../../ui/UIStatusBanner';
import UIErrorBox from '../../../ui/UIErrorBox';
import ConfirmOverlay from '../../../overlay/ConfirmOverlay';
import UILoadingBox from '../../../ui/UILoadingBox';
import UILoadingIcon from '../../../ui/UILoadingIcon';
import UITitle from '../../../ui/UITitle';


export interface OrgsEditFieldsProps {
    data?:Organization;
    addingParent?:Organization;
    onlyShowLocationDetails?:boolean;
    onlyShowSMDetails?:boolean;
}

export interface OrgsEditFieldsState {
    curSection:string;
    validationError:string;
    orgName:string;
    orgTypeId:string;
    description:string;
    address1:string;
    address2:string;
    city:string;
    state:string;
    zip:string;
    country:string;
    initPoints:google.maps.LatLng[];
    mapCenter?:google.maps.LatLng;

    smLoading:boolean;
    smError?:IErrorType;
    smCustomerURL:string;
    smUsername:string;
    smInvalid:boolean;
    smValid:boolean;
    smValidationError:string;
    smLoadedAsValid:boolean;

    [key:string]:any;
}

export default class OrgsEditFields extends React.Component<OrgsEditFieldsProps, OrgsEditFieldsState> {

    static SECTION_LOCATION:string = "location";
    static SECTION_SM_INTEGRATION:string = "schoolMessengerIntegration";

    polygonEditor:React.RefObject<UIMapPolygonEditor> = React.createRef();

    _tabs:UITabBarItem[] = [
        {label:"Location", id:OrgsEditFields.SECTION_LOCATION},
        {label:"School Messenger Integration", id:OrgsEditFields.SECTION_SM_INTEGRATION},
    ];
    _unmounting:boolean=false;

    

    constructor(props: OrgsEditFieldsProps) {
        super(props);

        let orgName:string = "";
        let description:string = "";
        let orgTypeId:string = "";
        let address1:string = "";
        let address2:string = "";
        let city:string = "";
        let state:string = ""
        let zip:string = "";
        let country:string = "";

        let initPoints:google.maps.LatLng[] = [];


        let smLoading:boolean=false;

        let initMapCenter;
        let initialOrgSection:string = OrgsEditFields.SECTION_LOCATION;

        if(this.props.data){
            smLoading=true;

            if(this.props.onlyShowLocationDetails){
                smLoading=false;
            }
            if(this.props.onlyShowSMDetails){
                initialOrgSection = OrgsEditFields.SECTION_SM_INTEGRATION;
            }


            orgName = this.props.data.orgName;
            description = this.props.data.description;
            orgTypeId = this.props.data.orgTypeId;

            if(this.props.data.primaryAddress){
                address1 = this.props.data.primaryAddress.address1;
                address2 = this.props.data.primaryAddress.address2;
                city = this.props.data.primaryAddress.city;
                state = this.props.data.primaryAddress.state;
                zip = this.props.data.primaryAddress.zip;
                country = this.props.data.primaryAddress.country;
            }
            
            let parsedPolygon = parseOrgLandmarkPolygon(this.props.data);

            if(parsedPolygon){
                initPoints = parsedPolygon.initPoints;
                initMapCenter = parsedPolygon.initMapCenter;
            }
        }

        if(this.props.addingParent){
            orgTypeId = this.props.addingParent.orgTypeId;
        }

        this.state = {
            curSection:initialOrgSection,
            validationError:"",
            orgName:orgName,
            orgTypeId:orgTypeId,
            description:description,
            address1:address1,
            address2:address2,
            city:city,
            state:state,
            zip:zip,
            country:country,
            initPoints:initPoints,
            mapCenter:initMapCenter,
            smLoading:smLoading,
            smCustomerURL:"",
            smUsername:"",
            smInvalid:false,
            smValid:false,
            smValidationError:"",
            smLoadedAsValid:false,
        }
    }

    componentDidMount(){

        if(this.props.data){
            
            let loadBroadcastConfigDetails:boolean=true;

            if(this.props.onlyShowLocationDetails){
                loadBroadcastConfigDetails=false;
            }


            if(loadBroadcastConfigDetails){

                Api.orgManager.getOrgBroadcastConfiguration(this.props.data.orgId,($success:boolean, $results:any)=>{
                    if($results.summary){
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
    
                        if(!this._unmounting){ 
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
                                this.setState({smLoading:false, smError:ApiData.ERROR_LOADING});
                            }
                        }
                    }else{
                        if(!this._unmounting){ 
                            this.setState({smLoading:false, smError:$results});
                        }
                        
                    }
                });
            }else{

            }

        }

    }

    componentWillUnmount(){
        this._unmounting=true;
    }

    _onInputChange=($value:string, $name?:string)=>{
        let data:{[key:string]:any} = {};
        data[$name!] = $value;
        this.setState(data);
    }
    _onSMInputChange=($value:string, $name?:string)=>{
        let data:any = {smInvalid:false, smValid:false};
        data[$name!] = $value;
        this.setState(data);
    }
    validate(){
        

        let checkSMValidation:boolean=true;

        let checkBasicValidation:boolean=true;

        if(this.props.onlyShowLocationDetails){
            checkSMValidation=false;
        }


        if(this.props.onlyShowSMDetails){
            checkBasicValidation=false;

        }
        
        if(checkBasicValidation){

            if(this.state.orgName===""){
                this.setState({validationError:"You must enter a Name."});
                return false;
            }
            if(this.state.orgTypeId===""){
                this.setState({validationError:"You must Select a Type."});
                return false;
            }
        }


        if(checkSMValidation){

            if(this.state.smInvalid){
                this.setState({validationError:"The Customer URL / SchoolMessenger Username is invalid"});
                return false;
            }
    
            if(!this.state.smValid && (this.state.smCustomerURL!=="" || this.state.smUsername!=="")){

                let smValidationMsg:string = "You must validate the provided Customer URL / SchoolMessenger Username. Leave blank if you do not with to integrate with SchoolMessenger at this time.";
                if(this.props.onlyShowSMDetails){
                    smValidationMsg = "You must validate the provided Customer URL / SchoolMessenger Username in order to save.";
                }

                this.setState({validationError:smValidationMsg});
                return false;
            }

            if(!checkBasicValidation){
                return true;
            }
        }
        


        let isOk = false;
        
        if(checkBasicValidation){
            isOk = this.validateAddress();
        }
        if(isOk){
            if(this.polygonEditor.current){
                let polyState = this.polygonEditor.current.state;
                if(polyState.points.length<=2){
                    this.setState({validationError:"You must create a Boundary Area."});                
                    return false;
                }
            }
            
            return true;
    
        }else{
            return false;
        }
    }

    validateAddress(){
        
        if(this.state.country===""){
            this.setState({validationError:"You must select a Country."});
            return false;
        }
        if(this.state.address1===""){
            this.setState({validationError:"You must enter an Address."});
            return false;
        }
        if(this.state.city===""){
            this.setState({validationError:"You must enter a City."});
            return false;
        }
        if(this.state.state===""){
            this.setState({validationError:"You must select a State/Province."});
            return false;
        }
        if(this.state.zip===""){
            this.setState({validationError:"You must enter a Zip/Postal Code."});
            return false;
        }
        return true;
    }

    _onErrorClose=()=>{
        this.setState({validationError:""});
    }

    _onTabChange=($id:string)=>{
        this.setState({curSection:$id});
    }

    _onCloseSMValidation=()=>{
        this.setState({smValidationError:""});
    }

    getBasicOrgData(){

        let {initPoints, address1, address2, city, state, zip, country, orgName, orgTypeId, description, ...rest} = this.state;

        let {points} = this.polygonEditor.current!.state;
        
        let strPoints = points.reduce(($prev,$cur)=>{
            let strLoc:string = $cur.lat()+","+$cur.lng()+";"
            return $prev+strLoc;
        },"");


        return {
            orgName:orgName,
            orgTypeId:orgTypeId,
            description:description,
            addresses:[{
                label:"Primary Address",
                primaryFlag:true,
                address1:address1,
                address2:address2,
                city:city,
                state:state,
                zip:zip,
                country:country,
            }],
            landmarks:[{
                landmarkType:"org",
                name:"Organization Footprint",
                positioningData:{
                    polygon:strPoints
                },
            }]
        };
    }

    _onClickSetLocation=()=>{

        
        

        if(this.validateAddress()){
            if(this.polygonEditor.current && this.polygonEditor.current.state.points.length>0){
                ConfirmOverlay.show("confirmResetPoints",()=>{
                    this._geoCodeAddress();
                },"Setting a new map location will reset the current 9-1-1 Boundary Area polygon. Are you sure you wish to continue?","Confirm Reset Boundary Area","Continue","Cancel");

            }else{
                this._geoCodeAddress();
            }
        }
    }
    _geoCodeAddress=()=>{
        
        const hideLoading = LoadingOverlay.show("geocoding","Finding Location...","Loading Please Wait");

        let fullAddress:string = "";
        fullAddress+=this.state.address1+" ";
        fullAddress+=this.state.address2+", ";
        fullAddress+=this.state.city+", ";
        fullAddress+=this.state.state+" ";
        fullAddress+=this.state.zip+" ";

        Api.googleMapsManager.getLatLngFromAddress(fullAddress,($success:boolean, $results:any)=>{
            hideLoading();
            if($success){

                if(!this._unmounting){
                    this.setState({mapCenter:$results});
                }
            }else{
                AlertOverlay.show("errorgeocode","Error Finding Location");
            }
        });  
    }

    _validatingSM:boolean=false;
    _onClickValidateSM=()=>{

        if(this.state.smCustomerURL===""){
            this.setState({smValidationError:"You must enter a Customer URL."});
            return;
        }
        if(this.state.smUsername===""){
            this.setState({smValidationError:"You must enter a Username."});
            return;
        }

        if(!this._validatingSM){
            this._validatingSM=true;
            const hideLoading = LoadingOverlay.show("validatingBN","Checking URL and username","Validating");

            Api.orgManager.validateOrgBroadcastConfiguration(this.state.smCustomerURL,[this.state.smUsername],($success,$results)=>{
                
                hideLoading();
                this._validatingSM=false;
                if(!this._unmounting){
                    if($success){
                        this.setState({smValid:true});
                    }else{
                        if($results.code===506){
                            this.setState({smInvalid:true});
                        }else{
                            this.setState({smValidationError:$results.desc});
                        }
                    }
                }
            });
        }
    }

    render() {


        let orgTypeDisabled:boolean = false;
        
        if(this.props.addingParent){
            orgTypeDisabled=true;
        }
        if(this.props.data?.parentOrgId){
            orgTypeDisabled=true;
        }

        let strLocationCN:string = "locationEditFields";
        let strSMIntegrationCN:string = "smEditFields";

        switch(this.state.curSection){
            case OrgsEditFields.SECTION_LOCATION:
                strLocationCN+=" showing";
            break;
            case OrgsEditFields.SECTION_SM_INTEGRATION:
                strSMIntegrationCN+=" showing";
            break;
        }

        let nameFieldTitle:string = User.selectedOrg.terminologyList.parent_org.singular+" Name";
        if(this.props.addingParent || this.props.data?.parentOrgId){
            nameFieldTitle = User.selectedOrg.terminologyList.child_org.singular+" Name";
        }

        /*
        <UIInput fieldItem fullWidth extraClassName="description" showTitleAsLabel type="textarea" name="description" title="Description" value={this.state.description} onChange={this._onInputChange}/>
                
        */


        let stateOptions = FormatUtil.STATES_US_AS_UI_OPTIONS;
        switch(this.state.country){
            case "CA":
                stateOptions = FormatUtil.STATES_CA_AS_UI_OPTIONS;
            break;
        }

        let strEditFieldsSectionsCN:string = "editFieldsSections fieldItem fullWidth";

        let showOrgNameAndType:boolean=true;

        let showTabs:boolean=true;

        let soloTitle:string = "";
        if(this.props.onlyShowLocationDetails || this.props.onlyShowSMDetails){
            showTabs=false;
            orgTypeDisabled=true;

            if(this.props.onlyShowSMDetails){
                showOrgNameAndType=false;
                soloTitle = "School Messenger";
            }
            if(this.props.onlyShowLocationDetails){
                soloTitle = "Location";
            }
        }


        if(showTabs){
            strEditFieldsSectionsCN+=" whiteBox";
        }


        


        return (
            <UIEditFields
                extraClassName="orgEditFields"
                validationError={this.state.validationError}
                onValidationErrorClose={this._onErrorClose}
            >
                {showOrgNameAndType && (
                    <>
                        <UIInput fieldItem extraClassName="orgName" isRequired showTitleAsLabel type="textfield" name="orgName" title={nameFieldTitle} value={this.state.orgName} onChange={this._onInputChange}/>
                        <UIInput fieldItem disabled={orgTypeDisabled} options={User.state.orgTypesAsUIOptions} extraClassName="orgTypeId" isRequired showTitleAsLabel type="select" name="orgTypeId" title="Type" value={this.state.orgTypeId} onChange={this._onInputChange}/>
                    </>
                )}
                <div className={strEditFieldsSectionsCN}>
                    {showTabs && (
                        <UITabBar horizontal data={this._tabs} onChange={this._onTabChange} selectedID={this.state.curSection}/>
                    )}
                    <UIEditFields extraClassName={strLocationCN}>                        
                        {!showTabs && (
                            <UIViewFieldsItem
                            fullWidth
                            value={<UITitle isSubtitle title={soloTitle}/>}
                        />   
                        )}
                        <UIInput fieldItem isRequired options={FormatUtil.COUNTRIES_AS_UI_OPTIONS} extraClassName="country" showTitleAsLabel type="select" name="country" title="Country" value={this.state.country} onChange={this._onInputChange}/>
                        <UIInput fieldItem extraClassName="address1" isRequired showTitleAsLabel type="textfield" name="address1" title="Address" value={this.state.address1} onChange={this._onInputChange}/>
                        <UIInput fieldItem extraClassName="address2" showTitleAsLabel type="textfield" name="address2" title="Address 2" value={this.state.address2} onChange={this._onInputChange}/>
                        <UIInput fieldItem isRequired extraClassName="city" showTitleAsLabel type="textfield" name="city" title="City" value={this.state.city} onChange={this._onInputChange}/>
                        <UIInput fieldItem isRequired options={stateOptions} extraClassName="state" showTitleAsLabel type="select" name="state" title="State/Province" value={this.state.state} onChange={this._onInputChange}/>
                        <UIInput fieldItem isRequired extraClassName="zip" showTitleAsLabel type="textfield" name="zip" title="Zip/Postal Code" value={this.state.zip} onChange={this._onInputChange}/>
                        <UIViewFieldsItem
                            title={" "}
                            value={<UIButton label="Set as Map Location" size={UIButton.SIZE_SMALL} color={UIButton.COLOR_LIGHTGREY} icon={mapMarker} onClick={this._onClickSetLocation}/>}
                        />                
                        <UIMapPolygonEditor ref={this.polygonEditor} initPoints={this.state.initPoints} initCenter={this.state.mapCenter}/>
                    </UIEditFields>                    
                    <UIEditFields extraClassName={strSMIntegrationCN}>
                                             
                        {!showTabs && (
                                <UIViewFieldsItem
                                fullWidth
                                value={<UITitle isSubtitle title={soloTitle}/>}
                            />   
                            )}
                        {this.state.smLoading && (
                            <UIViewFieldsItem
                                value={<div><UILoadingBox/></div>}
                            />   
                        )}
                        {this.state.smError && (
                            <UIErrorBox error={this.state.smError.desc}/>
                        )}
                        {!this.state.smError && !this.state.smLoading &&  (
                            <>
                                {this.state.smValidationError && this.state.smValidationError!=="" && (
                                    <UIStatusBanner text={this.state.smValidationError} type={UIStatusBanner.STATUS_ERROR} onClose={this._onCloseSMValidation}/>
                                )}
                                <div className="smValidatorDesc fieldItem fullWidth">
                                    <UIIcon icon={informationOutline}/>One valid URL and username combination is required for Broadcast Notifications.
                                </div>                        
                                <div className="smValidator fieldItem fullWidth">
                                    <div className="smValidateP1">
                                        <div className="smValidateTitle">
                                            Customer URL
                                        </div>
                                        <UIInput fullWidth value={this.state.smCustomerURL} name="smCustomerURL" onChange={this._onSMInputChange}/>
                                    </div>
                                    <div className="smValidateP2">
                                        <div className="smValidateTitle">
                                            SchoolMessenger Username
                                        </div>
                                        <UIInput fullWidth value={this.state.smUsername} name="smUsername" onChange={this._onSMInputChange}/>
                                    </div>
                                    {!this.state.smInvalid && !this.state.smValid && (
                                        <UIButton color={UIButton.COLOR_LIGHTGREY} label="Validate" size={UIButton.SIZE_SMALL} onClick={this._onClickValidateSM}/>
                                    )}
                                    {this.state.smInvalid &&  (
                                        <div className="smValidateState invalid"><UIIcon icon={closeIcon}/>Invalid</div>
                                    )}
                                    {this.state.smValid &&  (
                                        <div className="smValidateState valid"><UIIcon icon={checkIcon}/>Valid</div>
                                    )}
                                </div>
                            </>
                        )}
                    </UIEditFields>
                </div>
            </UIEditFields>
        );
    }
}

