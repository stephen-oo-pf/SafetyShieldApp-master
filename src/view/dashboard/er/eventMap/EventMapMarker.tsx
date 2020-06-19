import * as React from 'react';
import UIMapMarker from '../../../../ui/map/UIMapMarker';
import MapIncidentData from '../../../../data/MapIncidentData';


import { Clusterer } from '@react-google-maps/marker-clusterer';


export interface IEventMapMarkerProps {
    data:MapIncidentData;
    onClick:($data:MapIncidentData)=>void;
    disableMapDrag:()=>void;
    enableMapDrag:()=>void;
    clusterer?:Clusterer;    
}

export default class EventMapMarker extends React.Component<IEventMapMarkerProps> {

    _marker?:google.maps.Marker;

    _onClick=()=>{
        this.props.onClick(this.props.data);
    }
    _onLoad=($marker:google.maps.Marker)=>{
        this._marker = $marker;
        this._marker.set("data",this.props.data);
    }
    _onClickClose=()=>{
        this.props.onClick(this.props.data);
    }

    render() {
        
        let zIndex:number = this.props.data.zIndex;
        if(this.props.data.isSelected){
            zIndex = 9999;//if we have 9998 incidents at this org... its probably the end of the world so its ok if this breaks.
        }

        return (
            <UIMapMarker
                draggable={false}
                id={this.props.data.id}
                icon={this.props.data.mapIcon}
                label={this.props.data.mapLabel}
                position={this.props.data.mapPosition}
                title={this.props.data.incidentType.incidentType}
                zIndex={zIndex}
                onClick={this._onClick}
                onLoad={this._onLoad}
                clusterer={this.props.clusterer}
            />
        );
    }
}
