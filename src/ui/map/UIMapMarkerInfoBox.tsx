import * as React from 'react';
import { InfoBox } from '@react-google-maps/api';
import UIWhiteBox from '../UIWhiteBox';
import './UIMapMarkerInfoBox.scss';
import UIInfoBoxContentWrapper from './UIMapInfoBoxContentWrapper';
import UIButton from '../UIButton';
import closeIcon from '@iconify/icons-mdi/close';

export interface IUIMapMarkerInfoBoxProps {
    position:google.maps.LatLng;
    extraClassName?:string;
    width:number;
    yOffset?:number;
    disableMapDrag:()=>void;
    enableMapDrag:()=>void;
    onClickClose?:()=>void;
}

export default class UIMapMarkerInfoBox extends React.Component<IUIMapMarkerInfoBoxProps> {

    infoBoxContentWrapper:React.RefObject<UIInfoBoxContentWrapper> = React.createRef();

    _onClickClose=()=>{
        if(this.props.onClickClose){
            this.props.onClickClose();
        }
    }
    render() {

        let strCN:string = "mapMarkerInfoBox";

        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }

        let xOffset:number = -(this.props.width/2);
        let yOffset:number = 0;
    
        if(this.props.yOffset){
            yOffset = this.props.yOffset;
        }
        
// 
        return (
            <InfoBox 
                position={this.props.position}
                options={{closeBoxURL:"", disableAutoPan:true,  alignBottom:true, enableEventPropagation:true,pixelOffset:new google.maps.Size(xOffset,yOffset)}}
            >
                <UIInfoBoxContentWrapper ref={this.infoBoxContentWrapper} width={this.props.width} disableMapDrag={this.props.disableMapDrag} enableMapDrag={this.props.enableMapDrag}  >
                    <UIWhiteBox noPadding extraClassName={strCN} extraStyle={{width:this.props.width+"px"}}>
                        {this.props.onClickClose && (
                            <UIButton extraClassName="closeBtn" icon={closeIcon} onClick={this._onClickClose} isSquare size={UIButton.SIZE_TINY} color={UIButton.COLOR_WHITE}/>
                        )}
                        {this.props.children}
                    </UIWhiteBox>
                </UIInfoBoxContentWrapper>
        </InfoBox>
        );
    }
}
