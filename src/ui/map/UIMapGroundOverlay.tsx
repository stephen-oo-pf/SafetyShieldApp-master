import React from 'react';
import { OverlayView } from '@react-google-maps/api';
import './UIMapGroundOverlay.scss';


export interface LIVMapGroundOverlayProps {
    url:string;
    bounds:google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
    opacity?:number;
    rotation?:number;
    mapPaneName?:string;
    imgAlt?:string;
}

/*
This class exists because real GroundOverlays don't have rotation.
*/

export default class UIMapGroundOverlay extends React.Component<LIVMapGroundOverlayProps> {
    render() {

        let mapPaneName:string = OverlayView.OVERLAY_LAYER;

        if(this.props.mapPaneName){
            mapPaneName = this.props.mapPaneName;
        }

        let numOpacity:number = 1;
        if(this.props.opacity){
            numOpacity = this.props.opacity;
        }
        let numRotation:number = 0;
        if(this.props.rotation){
            numRotation = this.props.rotation;
        }


        let alt:string = "";
        if(this.props.imgAlt){
            alt = this.props.imgAlt;
        }

        return (
            <OverlayView
                bounds = {this.props.bounds}
                mapPaneName = {mapPaneName}
                >
                <div className="mapGroundOverlay" style={{opacity:numOpacity, transform:"rotate("+numRotation+"deg)"}}>
                    <img src={this.props.url} alt={alt}/>
                </div>
            </OverlayView>
        );
    }
}
