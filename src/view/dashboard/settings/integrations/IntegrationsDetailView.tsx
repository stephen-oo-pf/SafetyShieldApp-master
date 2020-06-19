import * as React from 'react';
import TitleUtil from '../../../../util/TitleUtil';
import UIView from '../../../../ui/UIView';
import { RouteComponentProps } from 'react-router-dom';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import Api, { IErrorType, ApiData } from '../../../../api/Api';
import User, { IResultNotification } from '../../../../data/User';
import IntegrationsView from './IntegrationsView';
import UIViewFields, { UIViewFieldsItem } from '../../../../ui/UIViewFields';
import OrgsEditFields, { OrgsEditFieldsState } from '../../orgs/OrgsEditFields';
import LoadingOverlay from '../../../../overlay/LoadingOverlay';
import UITitle from '../../../../ui/UITitle';

export interface IIntegrationsDetailViewProps extends RouteComponentProps{
    mode:string;
}

export interface IIntegrationsDetailViewState {
    loading:boolean;
    error?:IErrorType;
    savingError?:string;
    resultNotification?:IResultNotification;


    smCustomerURL:string;
    smUsername:string;
    smInvalid:boolean;
    smValid:boolean;
    smValidationError:string;
    smLoadedAsValid:boolean;

}

export default class IntegrationsDetailView extends React.Component<IIntegrationsDetailViewProps, IIntegrationsDetailViewState> {
    static ID:string = "integrationsDetail";

    
    editFields:React.RefObject<OrgsEditFields> = React.createRef();

    _unmounting:boolean=false;
    _saving:boolean=false;

    constructor(props: IIntegrationsDetailViewProps) {
        super(props);


        let loadDetail:boolean=false;

        if(this.props.mode===UIDetailFrame.MODE_VIEW){
            loadDetail=true;



        }

        this.state = {
            loading:loadDetail,
            smCustomerURL:"",
            smUsername:"",
            smInvalid:false,
            smValid:false,
            smValidationError:"",
            smLoadedAsValid:false,
        }
    }
    
    componentDidMount(){
        
        if(this.props.mode===UIDetailFrame.MODE_VIEW){
            this._loadData();
        }

    }
    componentWillUnmount(){
        this._unmounting=true;
    }

    _loadData=()=>{
        Api.orgManager.getOrgBroadcastConfiguration(User.selectedOrg.orgId,($success:boolean, $results:any)=>{
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
                    
                    User.checkResultNotification("integrations",($notif)=>{
                        this.setState({resultNotification:$notif});
                    });

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

                        this.setState({loading:false, smLoadedAsValid:isValid, smCustomerURL:customerURL, smUsername:username});


                    }else{
                        this.setState({loading:false, error:ApiData.ERROR_LOADING});

                    }

                    
                }
            }
        });

        
    }
    _save=()=>{

        let isValid:boolean = false;
        if(this.editFields.current){ 
            isValid = this.editFields.current.validate();
        }

        if(isValid){
            if(!this._saving){

                if(this.editFields.current && this.editFields.current.polygonEditor.current){
                    this._saving=true;

                    const hideLoading = LoadingOverlay.show("integrationsSave","Saving...","Loading Please Wait");

                    let editFieldsState:OrgsEditFieldsState = this.editFields.current.state;
                    let {smValid, smLoadedAsValid, smCustomerURL, smUsername, smError, ...rest} = editFieldsState;

                    let usernames:string[] = [];
                    if(smUsername && smUsername!==""){
                        usernames.push(smUsername);
                    }
            
                    Api.orgManager.setOrgBroadcastConfiguration(User.selectedOrg.orgId,smCustomerURL,usernames,($success, $results)=>{
                        hideLoading();
                        if($success){
                            
                            let singularType = User.selectedOrg.terminologyList.parent_org.singular;
                            if(!User.selectedOrg.isAccount){
                                singularType = User.selectedOrg.terminologyList.child_org.singular;
                            }

                            User.setSuccessEditedNotification("integrations","School Messenger for ",User.selectedOrg.orgName);
                            this.props.history.push(IntegrationsView.PATH);
                        }else{
                            User.setErrorResultNotification("integrations","School Messenger Integration failed to save. Please try saving the School Messenger Integration again. Error: "+$results.desc);
                            this.props.history.push(IntegrationsView.PATH);
                        }
                    });

                }


            }
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

    render() {



        let forceShowEditBtn:boolean=false;

        let jsxContent:JSX.Element = <></>;
        
        switch(this.props.mode){
            case UIDetailFrame.MODE_VIEW:
                jsxContent = (
                    <>
                        <UIViewFields>
                            <UIViewFieldsItem
                                fullWidth
                                value={<UITitle isSubtitle title={"School Messenger"}/>}
                            />   
                            <UIViewFieldsItem title={"Customer URL"} value={this.state.smCustomerURL}/>                            
                            <UIViewFieldsItem title={"SchoolMessenger Username"} value={this.state.smUsername}/>                                                        
                        </UIViewFields>
                    </>
                );
            break;
            case UIDetailFrame.MODE_EDIT:
                forceShowEditBtn=true;
                jsxContent = (
                    <>
                        <OrgsEditFields onlyShowSMDetails data={User.selectedOrg} ref={this.editFields} />
                    </>
                );
                
            break;
        }

        /*
        The UIDetailFrame below was originally built with a Master in mind. This section doesn't have a master so no real detailPath/detailName is needed.
        */
       let detailPath:string="";
       let detailName:string="";

        return (
            <UIView id={IntegrationsDetailView.ID} usePadding useScrollContainer>
                
                <UIDetailFrame
                    mode={this.props.mode}
                    loading={this.state.loading}
                    error={this.state.error}
                    baseIcon={IntegrationsView.ICON}
                    basePath={IntegrationsView.PATH}
                    baseTitle={"Integrations"}
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
