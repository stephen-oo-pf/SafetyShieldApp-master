import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { hideOverlay, showOverlay } from './OverlayController';

import UIButton from '../ui/UIButton';
import UIInput from '../ui/UIInput';
import User from '../data/User';

import sendIcon from '@iconify/icons-mdi/send';
import './BroadcastOverlay.scss';
import UIEditFields from '../ui/UIEditFields';
import LoadingOverlay from './LoadingOverlay';
import Api from '../api/Api';
import AlertOverlay from './AlertOverlay';
import { dispatch } from '../dispatcher/Dispatcher';
import AppEvent from '../event/AppEvent';


export interface IBroadcastOverlayProps extends BaseOverlayProps{

}

export interface IBroadcastOverlayState{
    broadcastId:string;
    validationError?:string;

}


export default class BroadcastOverlay extends React.Component<IBroadcastOverlayProps,IBroadcastOverlayState> {

    static ID:string = "broadcastOverlay";

    static show($name:string){
        showOverlay($name, BroadcastOverlay.ID,{});
    }
    static hide($name:string){        
        hideOverlay($name, BroadcastOverlay.ID,{});
    }

    constructor($props:IBroadcastOverlayProps){
        super($props);

        this.state = {
            broadcastId:"",
        }
    }

    _onBGClick=()=>{
        this._hide();
    }

    _sending:boolean=false;

    _onYes=()=>{
        if(!this._sending){
            
            if(this.state.broadcastId===""){
                this.setState({validationError:"You must select a Broadcast name."});
                return;
            }

            this._sending=true;

            let hideLoading = LoadingOverlay.show("sendingManualBN","Delivering Broadcast Notification...","Sending");
            this.setState({validationError:""},()=>{


                if(User.selectedOrg.broadcastList){


                    let broadcast = User.selectedOrg.broadcastList.find(($broadcast)=>{
                        return $broadcast.broadcastId+""===this.state.broadcastId;
                    });
                    

                    if(broadcast){

                        Api.orgManager.triggerBroadcast(this.state.broadcastId,broadcast.username,($success,$results)=>{
                            this._sending=false;
                            hideLoading();
                            this._hide();
                            if($success){
                                dispatch(new AppEvent(AppEvent.BROADCAST_SUCCESS, broadcast!.name));
                            }else{
                                AlertOverlay.show("errorManualBN","Error Sending Broadcast");
                            }
                        });
                    }
                }

            });

        }


    }
    _onNo=()=>{
        this._hide();
    }
    _hide=()=>{
        BroadcastOverlay.hide(this.props.data.name);
    }
    _onBroadcastChange=($value:string, $name?:string)=>{
        this.setState({broadcastId:$value});
    }
    render() {


        let footerContent = (<>
            <UIButton extraClassName="btnNo" size={UIButton.SIZE_SMALL} onClick={this._onNo} color={UIButton.COLOR_TRANSPARENT} label="Cancel"/>
            <UIButton extraClassName="btnYes" size={UIButton.SIZE_SMALL} onClick={this._onYes} icon={sendIcon} label="Send"/>
        </>);
        return (
            <Overlay 
                mediumMaxWidth 
                state={this.props.data.state} 
                id={BroadcastOverlay.ID} 
                zIndex={450} 
                onBGClick={this._onBGClick} 
                headerTitle="Send Broadcast" 
                footerContent={footerContent}
            >
                <UIEditFields validationError={this.state.validationError}>
                    <UIInput fieldItem fullWidth isRequired showTitleAsLabel title="SchoolMessenger Broadcast Name" name="broadcastId" onChange={this._onBroadcastChange} type="select" options={User.selectedOrg.broadcastListAsUIOptions} value={""+this.state.broadcastId} />
                </UIEditFields>
            </Overlay>
        );
    }
}
