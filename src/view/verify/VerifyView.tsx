import React from 'react';
import UIView from '../../ui/UIView';
import UILoginFrame from '../../ui/UILoginFrame';
import UIStatusBanner from '../../ui/UIStatusBanner';
import User from '../../data/User';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import LoginView from '../login/LoginView';
import UIInput from '../../ui/UIInput';
import './VerifyView.scss';
import UIButton, { UICancelButton } from '../../ui/UIButton';
import LoadingOverlay from '../../overlay/LoadingOverlay';
import Api, { IErrorType } from '../../api/Api';
import DashboardView from '../dashboard/DashboardView';
import FormatUtil from '../../util/FormatUtil';

export interface IVerifyViewProps extends RouteComponentProps{
}

export interface IVerifyViewState {
    statusMsg?:string;
    validationError?:string;
    error?:IErrorType;
    viewState:string;
    selectedMethodTypeId:string;
    enteredCode:string;
}

export default class VerifyView extends React.Component<IVerifyViewProps, IVerifyViewState> {

    static VIEWSTATE_CHOOSE_METHOD:string = "chooseMethod";
    static VIEWSTATE_ENTER_CODE:string = "enterCode";

    static ID:string = "verification";
    static PATH:string = "/verification";



    _sending:boolean=false;

    constructor(props: IVerifyViewProps) {
        super(props);

        let strSelectedMethodId:string = "";

        if(User.state.tfa && User.state.tfa.tfaMethods && User.state.tfa.tfaMethods.length===1){
            strSelectedMethodId = User.state.tfa.tfaMethods[0].tfaMethodId;
        }

        this.state = {
            viewState:VerifyView.VIEWSTATE_CHOOSE_METHOD,
            selectedMethodTypeId:strSelectedMethodId,
            enteredCode:"",
        }

    }

    _onStatusClose=()=>{
        this.setState({validationError:undefined, statusMsg:undefined});
    }
    _onMethodChange=($value:string, $name?:string)=>{
        this.setState({selectedMethodTypeId:$value});
    }
    _onCodeChange=($value:string, $name?:string)=>{
        
        if($value==="" || FormatUtil.isNumber($value)){
            this.setState({enteredCode:$value});
        }
    }
    _onConfirmCode=()=>{
        if(this.state.enteredCode===""){
            this.setState({validationError:"You must enter the code."});
            return;
        }
        
        if(!this._sending){
            this._sending=true;

            this.setState({validationError:undefined, statusMsg:undefined},()=>{
                const hideLoading = LoadingOverlay.show("confirmCode","Confirming Code...","Loading Please Wait");

                Api.access.confirmUserTFA(this.state.enteredCode,($success:boolean, $results:any)=>{
                    if($success){
                        Api.access.validateToken(($successValidate, $resultsValidate)=>{
                            if($successValidate){
                                Api.getInitInfo(($successInfo, $resultsInit)=>{
                                    this._sending=false;
                                    hideLoading();  
                                    if($successInfo){
                                        this.props.history.push(DashboardView.ID);
                                    }else{
                                        this.setState({error:$resultsInit});                                            
                                    }
                                }); 
                            }else{
                                this._sending=false;
                                hideLoading();  
                                this.setState({error:$resultsValidate});
                            }
                        });

                    }else{
                        this._sending=false;
                        hideLoading();
                        this.setState({error:$results});
                    }
                });

            });
        }

    }


    _onResendCode=()=>{
        this._sendCode(($success:boolean)=>{
            if($success){
                this.setState({statusMsg:"New Code Sent!"});
            }
        });
    }
    _sendCode=($complete?:($success:boolean)=>void)=>{

        if(!this._sending){
            this._sending=true;
           
            this.setState({validationError:undefined, statusMsg:undefined},()=>{
                const hideLoading = LoadingOverlay.show("sendCode","Sending Code...","Sending Code Please Wait");
                Api.access.sendUserTFA(this.state.selectedMethodTypeId,($success:boolean, $results:any)=>{
                    hideLoading();
                    this._sending=false;
                    if($success){
                        this.setState({viewState:VerifyView.VIEWSTATE_ENTER_CODE});
                    }else{
                        this.setState({error:$results});
                    }
                    if($complete){
                        $complete($success);
                    }
                });
            }); 
        }
    }
    _onSendCode=()=>{

        if(this.state.selectedMethodTypeId===""){
            this.setState({validationError:"You must select a method."});
            return;
        }
        this._sendCode();

    }
    _onFormSubmit=($event:React.FormEvent<HTMLFormElement>)=>{
        $event.preventDefault();
    }
    render() {

        if(User.state.tfa===null){
            return <Redirect to={LoginView.PATH}/>;
        }

        let strStatusType:string = "";
        let strStatus:string = "";

        if(this.state.statusMsg){
            strStatusType = UIStatusBanner.STATUS_INFO;
            strStatus = this.state.statusMsg;
        }

        if(this.state.validationError){
            strStatusType = UIStatusBanner.STATUS_ERROR;
            strStatus = this.state.validationError;
        }

        if(this.state.error){
            strStatusType = UIStatusBanner.STATUS_ERROR;
            strStatus = this.state.error.desc;
        }


        let jsxContent:JSX.Element = <></>;
        switch(this.state.viewState){
            case VerifyView.VIEWSTATE_CHOOSE_METHOD:

                if(User.state.tfa){

                    let radioOptions:{label:string, value:string}[] = User.state.tfa.tfaMethods.map(($value)=>{
                        let firstLetOfType:string = $value.type.substr(0,1);

                        let restOfType:string = $value.type.substr(1,$value.type.length-1);

                        let formatedType:string =firstLetOfType.toUpperCase()+restOfType;

                        return {
                            label:formatedType+": "+$value.value,
                            value:$value.tfaMethodId
                        }
                    });

                    jsxContent = (
                        <>
                            <p className="pageText">
                                You are logging in from an unrecognized device and must be verified. Choose a method to receive a verification code.
                            </p>
                            <UIInput extraClassName="method scrollContainer" fullWidth onChange={this._onMethodChange} name="method" value={this.state.selectedMethodTypeId} type="radio" options={radioOptions}/>
                            <div className="btns">
                                <UICancelButton path={LoginView.PATH}/>
                                <UIButton onClick={this._onSendCode} extraClassName="sendCode" size={UIButton.SIZE_SMALL} label="Send Code"/>
                            </div>
                        </>
                    );
                }
            break;
            case VerifyView.VIEWSTATE_ENTER_CODE:

                let strMethodChoosen:string = "";
                if(this.state.selectedMethodTypeId && User.state.tfa){
                    let method = User.state.tfa.tfaMethods.find($value => $value.tfaMethodId===this.state.selectedMethodTypeId);
                    if(method){
                        strMethodChoosen = method?.value;
                    }
                }

                jsxContent = (
                    <>
                        <form onSubmit={this._onFormSubmit}> 
                            <p className="pageText">
                                Enter verification code sent to {strMethodChoosen}    
                            </p>  
                                <UIInput maxLength={6} extraClassName="enterCode" type="text" name="code" value={this.state.enteredCode} onChange={this._onCodeChange}>
                                    <div className="digitUnderscores">
                                        <div/>
                                        <div/>
                                        <div/>
                                        <div/>
                                        <div/>
                                        <div/>
                                    </div>
                                </UIInput> 
                                <div className="afterInput">
                                    <UIButton fontSize={UIButton.SIZE_SMALL} size={UIButton.SIZE_SMALL} color={UIButton.COLOR_TRANSPARENT_PURPLE} onClick={this._onResendCode} label="Resend code"/>
                                </div>
                            <div className="btns">
                                <UICancelButton path={LoginView.PATH}/>
                                <UIButton useButton onClick={this._onConfirmCode} extraClassName="confirmCode" size={UIButton.SIZE_SMALL} label="Submit"/>
                            </div> 
                        </form>       
                    </>
                );
            break;
        }

        return (
            <UIView id={VerifyView.ID}>
                <UILoginFrame
                    title="Two-Step Verification"
                    statusType={strStatusType}
                    statusText={strStatus}
                    onStatusClose={this._onStatusClose}
                >
                    {jsxContent}                  
                </UILoginFrame>
            </UIView>
        );
    }
}
