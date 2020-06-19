import React from 'react';
import { IFloorPlanPositionData } from '../../data/FloorPlansData';
import './UIMapImageViewer.scss';
import { GoogleMap, OverlayView } from '@react-google-maps/api';
import UIMapCustomControl from './UIMapCustomControl';
import UIMapImageOpacityControl from './UIMapImageOpacityControl';
import UIMapGroundOverlay from './UIMapGroundOverlay';

export interface IUIMapImageViewerProps {
    url:string;
    position:IFloorPlanPositionData;
}

export interface IUIMapImageViewerState {
    imgOpacity:number;
}

export default class UIMapImageViewer extends React.Component<IUIMapImageViewerProps, IUIMapImageViewerState> {

    _googleMap:google.maps.Map | null = null;

    _numPadding:number = 50;
    _imgBounds:google.maps.LatLngBounds;

    constructor(props: IUIMapImageViewerProps) {
        super(props);

        this.state = {
            imgOpacity:this.props.position.imgOpacity
        }

        let sw:google.maps.LatLng = new google.maps.LatLng(this.props.position.imgBounds.south, this.props.position.imgBounds.west);
        let ne:google.maps.LatLng = new google.maps.LatLng(this.props.position.imgBounds.north, this.props.position.imgBounds.east);
        this._imgBounds = new google.maps.LatLngBounds(sw,ne);
        
    }


    _onMapLoaded=($map:google.maps.Map)=>{

        this._googleMap = $map;
        if(this._googleMap){

            this._googleMap.fitBounds(this._imgBounds,this._numPadding);  
            this._googleMap.setTilt(0);

            this.forceUpdate();
            window.setTimeout(()=>{
                if(this._googleMap){
                    this._googleMap.fitBounds(this._imgBounds,this._numPadding);  
                }
            },2000);
        }

    }

    _onOpacityChange=($value:number)=>{
        this.setState({imgOpacity:$value});
    }

    render() {
        let strCN:string = "mapImageViewer";


        let jsxCustomControls:JSX.Element = <></>;

        if(this._googleMap){
            jsxCustomControls = (
                <UIMapCustomControl map={this._googleMap} position={google.maps.ControlPosition.LEFT_CENTER}>
                    <UIMapImageOpacityControl opacity={this.state.imgOpacity} onOpacityChange={this._onOpacityChange}/>
                </UIMapCustomControl>
            );
        }


        let jsxGroundOverlay = (
            <UIMapGroundOverlay
                bounds={this._imgBounds}
                url={this.props.url}
                opacity={this.state.imgOpacity/100}
                rotation={this.props.position.imgRotation}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            />
        );

        return (
            
            <div className={strCN}>
                <GoogleMap
                    onLoad={this._onMapLoaded}
                    mapContainerClassName="mapImageViewerContainer"
                    clickableIcons={false}    
                >  
                    {jsxCustomControls}
                    {jsxGroundOverlay}
                </GoogleMap>          

            </div>
        );
    }
}
