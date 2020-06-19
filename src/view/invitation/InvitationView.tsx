import React from 'react';
import UIView from '../../ui/UIView';
import User from '../../data/User';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import LoginView from '../login/LoginView';
import UIInput from '../../ui/UIInput';
import UIButton from '../../ui/UIButton';


import loginIcon from '@iconify/icons-mdi/login';
import Api, { IErrorType} from '../../api/Api';
import BrowserUtil from '../../util/BrowserUtil';
import AppData from '../../data/AppData';
import LoadingOverlay from '../../overlay/LoadingOverlay';
import UIStatusBanner from '../../ui/UIStatusBanner';
import DashboardView from '../dashboard/DashboardView';
import UILoginFrame from '../../ui/UILoginFrame';
import TitleUtil from '../../util/TitleUtil';
import UILoadingBox from '../../ui/UILoadingBox';

export interface InvitationViewProps extends RouteComponentProps {
}

export interface InvitationViewState {
    loading:boolean;
    password:string;
    confirmPassword:string;
    loadingError?:IErrorType;
    error?:IErrorType;

    validationError?:string;

    goToLogin:boolean;
    invitationData?:any;
}

export default class InvitationView extends React.Component<InvitationViewProps, InvitationViewState> {

    static ACTION_SETPASSWORD:string = "set-password";
    static ACTION_LOGIN:string = "login";

    static ID:string = "invitation";
    static PATH:string = "/invitation";
    

    _saving:boolean=false;

    constructor(props: InvitationViewProps) {
        super(props);

        this.state = {
            loading:true,
            password:"",
            confirmPassword:"",
            goToLogin:false,
        }
    }
    componentDidMount(){

        TitleUtil.setPageTitle("Welcome");

        Api.userManager.getInvitation(User.state.invitationId!,($success:boolean, $results:any)=>{
            
            BrowserUtil.replaceState(AppData.siteUrl);

            if($success){
                
                switch($results.action){
                    case InvitationView.ACTION_LOGIN:
                        this.setState({loading:false, goToLogin:true});
                    break;
                    case InvitationView.ACTION_SETPASSWORD:
                        this.setState({loading:false, invitationData:$results});
                    break;
                }

            }else{
                
                this.setState({loading:false, loadingError:$results});
            }

        });
    }

    _onFormSubmit=($event:React.FormEvent<HTMLFormElement>)=>{
        $event.preventDefault();
    }

    _onInputChange=($value:string, $name?:string)=>{
        switch($name){
            case "confirmPassword":
                this.setState({confirmPassword:$value});
            break;
            case "password":
                this.setState({password:$value});
            break;
        }
    }
    _onStatusClose=()=>{
        this.setState({validationError:undefined});
    }

    _onClickSubmit=()=>{
        this._submit();
    }
    _submit=()=>{

        
        

        let passwordRegex = new RegExp(AppData.config.general.js_password_regex);

        if(this.state.password===""){
            this.setState({validationError:"You must enter a password."});
            return;
        }

        if(!passwordRegex.test(this.state.password)){
            this.setState({validationError:AppData.config.general.password_policy});
            return;
        }
        
        if(this.state.confirmPassword===""){
            this.setState({validationError:"You must enter a confirm password."});
            return;
        }
        if(this.state.confirmPassword!==this.state.password){
            this.setState({validationError:"The password must match the confirm password."});
            return;
        }

        if(!this._saving){
            this._saving=true;
            this.setState({validationError:""},()=>{

                if(this.state.invitationData){

                    const hideLoading = LoadingOverlay.show("setPass","Completing Signup...","Loading Please Wait");
                   
                    Api.access.setInitPassword(this.state.password,($success:boolean, $results:any)=>{
                        if($success){
                            Api.access.validateToken(($successValidate, $resultsValidate)=>{
                                if($successValidate){
                                    Api.getInitInfo(($successInfo, $resultsInit)=>{
                                        this._saving=false;
                                        hideLoading();  
                                        if($successInfo){
                                            User.setInvitationId(undefined);
                                            this.props.history.push(DashboardView.ID);
                                        }else{
                                            this.setState({error:$resultsInit});                                            
                                        }
                                    }); 
                                }else{
                                    this._saving=false;
                                    hideLoading();  
                                    this.setState({error:$resultsValidate});
                                }
                            });
                        }else{
                            this._saving=false;
                            hideLoading();
                            this.setState({error:$results});
                        }
                        
    
                    });

                }

            });
        }

    }
    render() {
        
        
        let ssLogoLabel = (
            <>
                Welcome to  <span className="purple">{AppData.config.general.short_produce_name}</span>
            </>
        );
        let title:string | JSX.Element = "";
        let strStatus = "";
        let strStatusType = "";

        if(this.state.validationError){
            strStatusType = UIStatusBanner.STATUS_ERROR;
            strStatus = this.state.validationError;
        }
        
        if(this.state.error){
            strStatusType = UIStatusBanner.STATUS_ERROR;
            strStatus = this.state.error.desc;
        }

        if(this.state.loading){
            title = "Finding your invitation...";
        }

        if(this.state.invitationData){
            title = (
                <>
                    Welcome {this.state.invitationData.user.firstName} {this.state.invitationData.user.lastName}!<br/>To complete the sign up process, please enter a password.
                </>
            );
        }

        return (
            <UIView id={InvitationView.ID}>

                {this.state.loading && (
                    <>
                        <UILoadingBox/>
                    </>
                )}   
                {!this.state.loading && (
                    <UILoginFrame
                        title={title}
                        ssLogoLabel={ssLogoLabel}
                        statusText={strStatus}
                        statusType={strStatusType}
                        animateIntro={!User.state.hasAppIntroed}
                        onStatusClose={this._onStatusClose}
                    >
                        

                        {!this.state.loading && !this.state.error && this.state.invitationData &&  (
                            <>
                                <form onSubmit={this._onFormSubmit}>
                                    <UIInput movableTitle fullWidth showTitleAsLabel isRequired title="Password" name="password" type="password" value={this.state.password} onChange={this._onInputChange}/>
                                    <UIInput movableTitle fullWidth showTitleAsLabel isRequired title="Confirm Password" name="confirmPassword" type="password" value={this.state.confirmPassword} onChange={this._onInputChange}/>
                                    <UIButton fullWidth useButton horizontalAlign={UIButton.ALIGN_CENTER} icon={loginIcon} iconEdge extraClassName="loginBtn" label="Complete Sign Up!" size={UIButton.SIZE_NORMAL} onClick={this._onClickSubmit}/>
                                </form>
                            </>
                        )}  

                        {(!User.state.invitationId || this.state.loadingError || this.state.goToLogin) && (
                            <Redirect to={LoginView.PATH}/>
                        )}
                    </UILoginFrame>
                )}
            </UIView>
        );
    }
}
