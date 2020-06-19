import React from 'react';
import UIView from '../../ui/UIView';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import './LoginView.scss';
import UIInput from '../../ui/UIInput';
import UIButton from '../../ui/UIButton';

import User from '../../data/User';
import DashboardView from '../dashboard/DashboardView';
import FormatUtil from '../../util/FormatUtil';
import LoadingOverlay from '../../overlay/LoadingOverlay';
import Api, { IErrorType } from '../../api/Api';
import AppData from '../../data/AppData';

import loginIcon from '@iconify/icons-mdi/login';
import UIStatusBanner from '../../ui/UIStatusBanner';
import UILoginFrame from '../../ui/UILoginFrame';
import VerifyView from '../verify/VerifyView';
import UICheckbox from '../../ui/UICheckbox';
import ForgotView from '../forgot/ForgotView';
import TitleUtil from '../../util/TitleUtil';
import AlertOverlay from '../../overlay/AlertOverlay';

export interface ILoginViewProps extends RouteComponentProps{
}

export interface ILoginViewState {
    username:string;
    password:string;
    error:IErrorType | null
    validationError:string;
    [key:string]:any;
}

export default class LoginView extends React.Component<ILoginViewProps, ILoginViewState> {

    static ID:string = "login";
    static PATH:string = "/login";

    constructor(props: ILoginViewProps) {
        super(props);


        let username:string = "";
        if(User.savedData.userEmail){
            username = User.savedData.userEmail;
        }

        this.state = {
            username:username,
            password:"",
            error:null,
            validationError:""
        }
    }

    _saving:boolean=false;

    componentDidMount(){
        TitleUtil.setPageTitle("Login");
        
        User.setInvitationId(undefined);
        User.setForgotPWId(undefined);
    }
    _onInputChange=($value:string, $name?:string)=>{
        let state:{[key:string]:any} = {};
        if($name){
            state[$name] = $value;
            this.setState(state);
        }
    }
    _onFormSubmit=($event:React.FormEvent<HTMLFormElement>)=>{
        $event.preventDefault();
    }
    _onClickSubmit=()=>{
        this._submit();        
    }
    _onToggleRemember=($value:boolean, $name?:string)=>{
        User.setRememberMe($value);
        this.forceUpdate();
    }
    _submit=()=>{


        if(this.state.username===""){
            this.setState({validationError:"You must enter an email address."});
            return;
        }
        if(this.state.password===""){
            this.setState({validationError:"You must enter a password"});
            return;
        }

        
        if(!this._saving){
            this._saving=true;
            this.setState({validationError:""},()=>{

                const hideOverlay = LoadingOverlay.show("loginLoader","Logging In", "Loading...");
                let {username, password} = this.state;
                
                Api.access.login(username,password,($success:boolean, $results:any)=>{
        
                    if($success){


                        if(User.savedData.rememberLogin){
                            User.setUserEmail(username);
                        }else{
                            User.setUserEmail("");
                        }


                        switch($results.data.action){
                            case "tfa":
                                this.props.history.push(VerifyView.PATH);
                                hideOverlay();
                            break;
                            case "dashboard":
                        
                                Api.getInitInfo(($success:boolean, $results:any)=>{
                                    if($success){
                                        this.props.history.push(DashboardView.PATH);
                                    }else{
                                        this.setState({error:$results});
                                    }
                                    this._saving=false;
                                    hideOverlay();
                                });
                            break;
                        }
        
                    }else{
                        this.setState({error:$results});
                        this._saving=false;
                        hideOverlay();
                    }
                });
            });


        }
    }

    _onStatusClose=()=>{
        this.setState({error:null, validationError:""});
    }
    render() {

        let strVersion:string = AppData.version;
        let strBuildDate:string = ""+FormatUtil.dateMDHM(AppData.buildDate);


        let strStatusType:string = "";
        let strStatus:string = "";
        if(this.state.validationError){
            strStatusType = UIStatusBanner.STATUS_ERROR;
            strStatus = this.state.validationError;
        }
        if(this.state.error){
            strStatusType = UIStatusBanner.STATUS_ERROR;
            strStatus = this.state.error.desc;
        }


        return (
            <UIView id={LoginView.ID}>
                <UILoginFrame
                    title="Log In"
                    animateIntro={!User.state.hasAppIntroed}
                    statusText={strStatus}
                    statusType={strStatusType}
                    onStatusClose={this._onStatusClose}
                >
                    <form onSubmit={this._onFormSubmit}>
                        <UIInput movableTitle fullWidth showTitleAsLabel isRequired title="Email" name="username" value={this.state.username} onChange={this._onInputChange}/>
                        <UIInput movableTitle fullWidth showTitleAsLabel isRequired title="Password" name="password" type="password" value={this.state.password} onChange={this._onInputChange}/>
                        <UIButton fullWidth useButton horizontalAlign={UIButton.ALIGN_CENTER} icon={loginIcon} iconEdge extraClassName="loginBtn" label="Log In" size={UIButton.SIZE_NORMAL} onClick={this._onClickSubmit}/>
                    </form>
                    <div className="options">
                        <UIButton iconEdge extraClassName="forgotPW" color={UIButton.COLOR_TRANSPARENT_PURPLE} label="Forgot Password?" size={UIButton.SIZE_SMALL} fontSize={UIButton.SIZE_SMALL} path={ForgotView.PATH} />
                        <div className="rememberMe">
                            <UICheckbox label="Remember Me" name="remember" onChange={this._onToggleRemember} checked={User.savedData.rememberLogin}  />
                        </div>
                    </div>
                </UILoginFrame>            
                <div className="footer">
                    <span className="version">{strVersion}</span>
                    <span className="build">{strBuildDate}</span>
                </div>
                {User.state.isLoggedIn && (
                    <Redirect to={DashboardView.PATH}/>
                )}
            </UIView>
        );
    }
}
