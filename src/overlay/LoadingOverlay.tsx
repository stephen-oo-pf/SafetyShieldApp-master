import React from 'react';
import Overlay, { BaseOverlayProps } from './Overlay';
import { showOverlay, hideOverlay} from './OverlayController';
import './LoadingOverlay.scss';
import UILoadingBox from '../ui/UILoadingBox';

export interface ILoadingOverlayProps extends BaseOverlayProps{
    
}

export default class LoadingOverlay extends React.Component<ILoadingOverlayProps> {

    static ID:string = "loading";

    static show($name:string, $loadingMsg:string="", $loadingTitle:string=""){
        showOverlay($name, LoadingOverlay.ID,{loadingMsg:$loadingMsg, loadingTitle:$loadingTitle});
        return ()=>{
            hideOverlay($name,LoadingOverlay.ID,{});
        };
    }
    static hide($name:string){        
        hideOverlay($name, LoadingOverlay.ID,{});
    }

    render() {
        return (
            <Overlay 
                state={this.props.data.state} 
                id={LoadingOverlay.ID} 
                zIndex={530} 
                headerTitle={this.props.data.details.loadingTitle} 
                smallMaxWidth 
                smallHeader
            >
                <UILoadingBox>
                    <div className="loadingMsg">
                        {this.props.data.details.loadingMsg}
                    </div>
                </UILoadingBox>
            </Overlay>
        );
    }
}
