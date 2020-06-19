import React from 'react';
import UIView from '../../ui/UIView';
import UILoginFrame from '../../ui/UILoginFrame';
import UIInput from '../../ui/UIInput';
import UIButton from '../../ui/UIButton';

import './ForgotView.scss';
import LoginView from '../login/LoginView';
import UIStatusBanner from '../../ui/UIStatusBanner';
import LoadingOverlay from '../../overlay/LoadingOverlay';
import TitleUtil from '../../util/TitleUtil';
import Api, { IErrorType, ApiData } from '../../api/Api';
import User from '../../data/User';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import BrowserUtil from '../../util/BrowserUtil';
import AppData from '../../data/AppData';
import DashboardView from '../dashboard/DashboardView';
import UILoadingBox from '../../ui/UILoadingBox';

export interface IForgotViewProps extends RouteComponentProps{
}

export interface IForgotViewState {
    loading:boolean;
    validationError?:string;
    error?:IErrorType;
    loadingError?:IErrorType;
    email:string;
    isSent:boolean;
    viewState:string;
    newPassword:string;
    confirmNewPassword:string;
    [key:string]:any;
}

export default class ForgotView extends React.Component<IForgotViewProps, IForgotViewState> {


    static VIEWSTATE_FORGOTPW:string = "forgotPW";
    static VIEWSTATE_SETPW:string = "setPW";

    static ID:string = "forgot";
    static PATH:string = "/forgot";

    constructor(props: IForgotViewProps) {
        super(props);

        let isLoading:boolean = false;
        let viewState:string = ForgotView.VIEWSTATE_FORGOTPW;

        if(User.state.forgotPWId){
            isLoading=true;
            viewState = ForgotView.VIEWSTATE_SETPW;
        }

        this.state = {
            email:"",
            isSent:false,
            loading:isLoading,
            viewState:viewState,
            newPassword:"",
            confirmNewPassword:"",
        }
        
    }

    _saving:boolean=false;

    componentDidMount(){
        
        switch(this.state.viewState){
            case ForgotView.VIEWSTATE_FORGOTPW:
                TitleUtil.setPageTitle("Forgot Password");
            break;
            case ForgotView.VIEWSTATE_SETPW:
                TitleUtil.setPageTitle("Choose New Password");

                BrowserUtil.replaceState(AppData.siteUrl);
                Api.access.getForgotPW(($success:boolean, $results:any)=>{

                    BrowserUtil.replaceState(AppData.siteUrl);

                    if($success){
                        this.setState({loading:false});
                    }else{
                        this.setState({loading:false, loadingError:$results});
                    }
                });

            break;
        }
    }

    _onStatusClose=()=>{
        this.setState({validationError:undefined});
    }
    _onFormSubmit=($event:React.FormEvent<HTMLFormElement>)=>{
        $event.preventDefault();
    }
    _onInputChange=($value:string, $name?:string)=>{
        let state:{[key:string]:any} = {};
        if($name){
            state[$name] = $value;
            this.setState(state);
        }
    }
    
    _onClickSubmit=()=>{        
        this._submit();        
    }
    _submit=()=>{
        switch(this.state.viewState){
            case ForgotView.VIEWSTATE_FORGOTPW:
                this._submitForgotPWRequest();
            break;
            case ForgotView.VIEWSTATE_SETPW:
                this._submitSetPasswordRequest();
            break;
        }
    }
    _submitForgotPWRequest=()=>{

        if(this.state.email===""){
            this.setState({validationError:"You must enter an email address."});
            return;
        }

        if(!this._saving){
            this._saving=true;
            this.setState({validationError:"", isSent:false},()=>{

                const hideOverlay = LoadingOverlay.show("forgotLoader","Sending Email...", "Please Wait");
                Api.access.generateForgotPW(this.state.email, ($success:boolean, $results:any)=>{
                    hideOverlay();
                    if($results && $results.summary){
                        //we treat any real response from server as success
                        this.setState({isSent:true});
                    }else{
                        this.setState({error:ApiData.ERROR_LOADING});
                    }
                    this._saving=false;
                });
            });
        }
    }
    
    _submitSetPasswordRequest=()=>{


        let passwordRegex = new RegExp(".*^(?=.{5,20})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$");

        if(this.state.newPassword===""){
            this.setState({validationError:"You must enter a New Password"});
            return;
        }

        if(!passwordRegex.test(this.state.newPassword)){
            this.setState({validationError:"Passwords must be between 5-20 characters, contain at least 1 uppercase letter and a number."});
            return;
        }

        if(this.state.confirmNewPassword===""){
            this.setState({validationError:"You must enter a Confirmation Password"});
            return;
        }
        
        if(this.state.newPassword!==this.state.confirmNewPassword){
            this.setState({validationError:"The password must match the confirm password."});
            return;
        }

        if(!this._saving){
            this._saving=true;
            this.setState({validationError:"", isSent:false},()=>{

                const hideLoading = LoadingOverlay.show("setPWLoader","Setting Password...", "Please Wait");
            
                Api.access.setForgotPassword(this.state.newPassword, ($success:boolean, $results:any)=>{
                    if($success){

                        Api.access.validateToken(($successValidate, $resultsValidate)=>{
                            if($successValidate){
                                Api.getInitInfo(($successInfo, $resultsInit)=>{
                                    this._saving=false;
                                    hideLoading();  
                                    if($successInfo){
                                        
                                        User.setForgotPWId(undefined);
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
                        this.setState({error:ApiData.ERROR_LOADING});
                    }
                });
                
            });
        }
    }



    render() {


        let title:string | JSX.Element = "Forgot Password?";
        let strStatus = "";
        let strStatusType = "";


        let jsxContent:JSX.Element = <></>;

        switch(this.state.viewState){
            case ForgotView.VIEWSTATE_SETPW:
                title = "Choose a New Password";
                
                if(this.state.loading){
                    jsxContent = (
                        <UILoadingBox/>
                    );
                }else{
                    if(!this.state.error){
                        jsxContent = (
                            <>
                               <form onSubmit={this._onFormSubmit}>
                                    <UIInput movableTitle fullWidth showTitleAsLabel isRequired title="New Password" name="newPassword" type="password" value={this.state.password} onChange={this._onInputChange}/>
                                    <UIInput movableTitle fullWidth showTitleAsLabel isRequired title="Confirm Password" name="confirmNewPassword" type="password" value={this.state.confirmPassword} onChange={this._onInputChange}/>
                                    <UIButton fullWidth useButton horizontalAlign={UIButton.ALIGN_CENTER}  extraClassName="forgotBtn" label="Submit" size={UIButton.SIZE_NORMAL} onClick={this._onClickSubmit}/>
                                </form>                  
                                <div className="options">
                                    <UIButton extraClassName="backToLogin" color={UIButton.COLOR_TRANSPARENT_PURPLE} label="Go To Login" size={UIButton.SIZE_SMALL} fontSize={UIButton.SIZE_SMALL} path={LoginView.PATH} />
                                </div>
                            </>
                        );
                    }
                }
            break;
            case ForgotView.VIEWSTATE_FORGOTPW:
                jsxContent = (
                    <>
                        <p className="pageText">Enter your email address to retrieve your password.</p>
                        <form onSubmit={this._onFormSubmit}>
                            <UIInput movableTitle fullWidth showTitleAsLabel isRequired title="Email" name="email" value={this.state.email} onChange={this._onInputChange}/>
                            <UIButton fullWidth useButton horizontalAlign={UIButton.ALIGN_CENTER} extraClassName="forgotBtn" label="Submit" size={UIButton.SIZE_NORMAL} onClick={this._onClickSubmit}/>
                        </form>                    
                        <div className="options">
                            <UIButton extraClassName="backToLogin" color={UIButton.COLOR_TRANSPARENT_PURPLE} label="Back to Login" size={UIButton.SIZE_SMALL} fontSize={UIButton.SIZE_SMALL} path={LoginView.PATH} />
                        </div>
                    </>
                );
            break;
        }

        if(this.state.isSent){
            strStatusType = UIStatusBanner.STATUS_SUCCESS;

            strStatus = AppData.config.blurb.post_pw_reset_blurb;
            
        }

        if(this.state.validationError){
            strStatusType = UIStatusBanner.STATUS_ERROR;
            strStatus = this.state.validationError;
        }

        if(this.state.error){
            strStatusType = UIStatusBanner.STATUS_ERROR;
            strStatus = this.state.error.desc;
        }

        return (
            <UIView id={ForgotView.ID}>
                {this.state.loading && (
                    <UILoadingBox/>
                )}
                {!this.state.loading && (
                    <UILoginFrame
                        animateIntro={!User.state.hasAppIntroed}
                        title={title}
                        statusText={strStatus}
                        statusType={strStatusType}
                        onStatusClose={this._onStatusClose}
                        >   
                        {jsxContent}                    
                    </UILoginFrame>
                )}
                
                {this.state.loadingError && (
                    <Redirect to={LoginView.PATH}/>
                )}
            </UIView>
        );
    }
}
