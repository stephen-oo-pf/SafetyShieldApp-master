import * as React from 'react';
import { MarkerClusterer } from '@react-google-maps/api';

import { Clusterer,ClusterIconStyle, Cluster, TCalculator } from '@react-google-maps/marker-clusterer';
import { ClustererProps } from '@react-google-maps/api/dist/components/addons/MarkerClusterer';
import './UIMapClusterer.scss';

export interface IUIMapClustererProps {
    maxZoom:number;
    styles:IClusterStyle[];
    calculator?:TCalculator;
    children:(markerClusterer: Clusterer) => React.ReactNode;
    onClusteringEnd?:($markerClusterer:Clusterer)=>void;
    onClick:($cluster:Cluster, $markerBoundary:google.maps.LatLngBounds)=>void;
    
}

export interface IClusterStyle{
    w:number;
    h:number;
    url:string;
}

export default class UIMapClusterer extends React.Component<IUIMapClustererProps> {
    
    static STYLE_ORANGE_RD:IClusterStyle =      {w:36,h:52, url:"static/media/pins/cluster-orange-reddot.png"};
    static STYLE_ORANGE:IClusterStyle =         {w:36,h:52, url:"static/media/pins/cluster-orange.png"};
    static STYLE_RED:IClusterStyle =            {w:52,h:36, url:"static/media/pins/cluster-red.png"};


    _onClick=($cluster:Cluster)=>{
        let boundary:google.maps.LatLngBounds = new google.maps.LatLngBounds();
        $cluster.markers.forEach(($marker)=>{
            let position = $marker.getPosition();
            if(position){
                boundary.extend(position);
            }
        });
        this.props.onClick($cluster,boundary);

    }

    render() {


        let clusterTitle:string = "Click to Zoom";

        const clustererOptions:ClustererProps = {
            children:()=><></>,
            clusterClass:"eventCluster",
            averageCenter:true,
            enableRetinaIcons:true,
            zoomOnClick:false,
            gridSize:60,
            maxZoom:this.props.maxZoom,
            title:clusterTitle,
        }



        let baseStyle:ClusterIconStyle = {
            textColor:"#FFFFFF",
            textSize:16,
            fontFamily:"Roboto",
            width:52,
            height:52,
            url:""
        }

        let scale:number = 1;


        return (            
            <MarkerClusterer
                {...clustererOptions}     
                styles={this.props.styles.map(($style, $index)=>{

                    let style:ClusterIconStyle = {...baseStyle};
                    style.url = $style.url;
                    style.width = $style.w*scale;
                    style.height = $style.h*scale;
                    style.textSize = 18*scale;
                    return style
                })}   
                onClusteringEnd={this.props.onClusteringEnd}       
                onClick={this._onClick} 
                calculator={this.props.calculator}
            >
                {($clusterer:Clusterer)=>{
                    return this.props.children($clusterer);
                }}
            </MarkerClusterer>   
        );
    }
}
