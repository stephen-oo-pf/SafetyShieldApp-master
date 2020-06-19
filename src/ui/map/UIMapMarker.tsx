import React from 'react';
import { Marker } from '@react-google-maps/api';

import { Clusterer } from '@react-google-maps/marker-clusterer';

export interface UIMapMarkerProps {
    position:google.maps.LatLng;
    draggable:boolean;
    title:string;
    id:string;
    icon?:string | google.maps.Icon | google.maps.Symbol;
    label:string | google.maps.MarkerLabel;
    onLoad?:($marker:google.maps.Marker)=>void;
    onDrag?:($id:string, $center:google.maps.LatLng)=>void;
    onDragEnd?:($id:string, $center:google.maps.LatLng)=>void;
    onClick?:($id:string)=>void;
    zIndex?:number;
    clusterer?:Clusterer;    
}

export default class UIMapMarker extends React.Component<UIMapMarkerProps> {

    _marker:google.maps.Marker | null = null;

    _customDataKey:string = "eventid";

    _inACluster:boolean=false;

    _onLoaded=($marker: google.maps.Marker)=>{
        this._marker = $marker;
        
        if(this.props.onLoad){
            this.props.onLoad($marker);
        }
    }

    _onClick=()=>{
        if(this.props.onClick){
            this.props.onClick(this.props.id);
        }
    }
    _onDragStart=()=>{
        if(this.props.onClick){
            this.props.onClick(this.props.id);
        }
    }
    _onDrag=(e: google.maps.MouseEvent)=>{

        if(this._marker && this.props.onDrag){
            let position:google.maps.LatLng = this._marker.getPosition() as google.maps.LatLng;
            this.props.onDrag(this.props.id, position);
        }
    }
    _onDragEnd=(e: google.maps.MouseEvent)=>{

        if(this._marker && this.props.onDragEnd){
            let position:google.maps.LatLng = this._marker.getPosition() as google.maps.LatLng;
            this.props.onDragEnd(this.props.id, position);
        }
    }
    
    render() {




        return (
            <Marker 
                zIndex={this.props.zIndex}
                icon={this.props.icon}
                title={this.props.title}
                options={{label:this.props.label}}
                onDragStart={this._onDragStart}
                onDrag={this._onDrag}
                onDragEnd={this._onDragEnd}
                onLoad={this._onLoaded} 
                onClick={this._onClick}
                draggable={this.props.draggable}
                position={this.props.position}
                clusterer={this.props.clusterer}
            >
                {this.props.children}
            </Marker>
        );
    }
}
