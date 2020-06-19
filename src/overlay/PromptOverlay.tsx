import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { showOverlay, hideOverlay } from './OverlayController';
import './PromptOverlay.scss';

import UIButton from '../ui/UIButton';
import UIInput from '../ui/UIInput';
import UITitle from '../ui/UITitle';
import UIStatusBanner from '../ui/UIStatusBanner';


interface IPromptOverlayState{
    prompt:string;
    validationError?:string;
}

export default class PromptOverlay extends React.Component<BaseOverlayProps,IPromptOverlayState> {

    static ID:string = "prompt";
    static ID2:string = "prompt prompt2";

    static show($name:string, $confirmAction:($value:string)=>void, $placeholder:string="", $promptTitle:string="Prompt", $promptYes:string="Submit", $promptNo:string="Cancel", $validationMsg:string="", $id:string=""){
        let id:string = PromptOverlay.ID;
        if($id){
            id = $id;
        }
        showOverlay($name, id,{confirmAction:$confirmAction, promptTitle:$promptTitle, placeholder:$placeholder, promptYes:$promptYes, promptNo:$promptNo, validationMsg:$validationMsg});
    }
    static hide($name:string, $id:string=""){  
        let id:string = PromptOverlay.ID;
        if($id){
            id = $id;
        }      
        hideOverlay($name, id,{});
    }


    constructor($props:BaseOverlayProps){
        super($props);

        this.state = {
            prompt:""
        }
    }

    _onBGClick=()=>{
        this._onNo();
    }
    _hide=()=>{

        PromptOverlay.hide(this.props.data.name, this.props.data.id);

    }
    _onNo=()=>{
        this._hide();
    }
    _onYes=()=>{
        if(this.state.prompt===""){
            
            let validationMsg:string = "You must enter a value.";
            if(this.props.data.details.validationMsg){
                validationMsg = this.props.data.details.validationMsg;
            }

            this.setState({validationError:validationMsg});
            return;
        }

        this.setState({validationError:undefined},()=>{

            this._hide();
            this.props.data.details.confirmAction(this.state.prompt);        
        });

    }

    _onInputChange=($value:string, $name?:string)=>{
        this.setState({prompt:$value});
    }
    _onCloseError=()=>{
        this.setState({validationError:undefined});
    }

    render() {

        let strYes:string = "Submit";
        if(this.props.data.details.promptYes){
            strYes = this.props.data.details.promptYes;
        }
        let strNo:string = "Cancel";
        if(this.props.data.details.promptNo){
            strNo = this.props.data.details.promptNo;
        }

        let strTitle:string = "Prompt";
        if(this.props.data.details.promptTitle){
            strTitle = this.props.data.details.promptTitle;
        }

        


        let footerContent = (<>
            <UIButton extraClassName="btnNo" size={UIButton.SIZE_SMALL} onClick={this._onNo} color={UIButton.COLOR_TRANSPARENT_PURPLE} label={strNo}/>
            <UIButton extraClassName="btnYes" size={UIButton.SIZE_SMALL} onClick={this._onYes} label={strYes} />
        </>);

        return (
            <Overlay 
                state={this.props.data.state} 
                id={this.props.data.id} 
                zIndex={510} 
                key={this.props.data.id}
                headerTitle={(
                    <>
                        <UITitle title={(
                            <>
                                {strTitle}
                                <span className="required">*</span>
                            </>
                        )}/>
                    </>
                )} 
                onBGClick={this._onBGClick} 
                footerContent={footerContent} 
                smallMaxWidth
            >
                <div className="promptInside">
                    {this.state.validationError && (
                        <UIStatusBanner type={UIStatusBanner.STATUS_ERROR} text={this.state.validationError} onClose={this._onCloseError}/>
                    )}
                    <UIInput type="textarea" name="prompt" title={this.props.data.details.placeholder} value={this.state.prompt} onChange={this._onInputChange}/>
                </div>
            </Overlay>
        );
    }
}
