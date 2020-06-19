import * as React from 'react';

import mapMarker from '@iconify/icons-mdi/map-marker';
import UIView from '../../../../ui/UIView';
import { RouteComponentProps } from 'react-router-dom';
import './EventMapView.scss';
import EventMapSidebar from './EventMapSidebar';
import { Clusterer, Cluster, ClusterIconStyle,ClusterIconInfo } from '@react-google-maps/marker-clusterer';
import { GoogleMap, MarkerClusterer, Polygon } from '@react-google-maps/api';
import User from '../../../../data/User';
import UIButton from '../../../../ui/UIButton';

import chevronDoubleLeft from '@iconify/icons-mdi/chevron-double-left';
import { IIncidentReportData, ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA } from '../../../../data/IncidentData';
import { IAlert_ACTIVE_INCIDENT } from '../../../../data/AlertData';
import FormatUtil from '../../../../util/FormatUtil';
import AppEvent from '../../../../event/AppEvent';
import { unlisten, listen } from '../../../../dispatcher/Dispatcher';
import Api from '../../../../api/Api';
import MapEvent from '../../../../event/MapEvent';
import EventMapMarker from './EventMapMarker';
import MapIncidentData, { getMapInitialLocation } from '../../../../data/MapIncidentData';


import alarmLight from '@iconify/icons-mdi/alarm-light';
import UIMapClusterer from '../../../../ui/map/UIMapClusterer';
import EventMapInfoBox from './EventMapInfoBox';
import UIMapUtil from '../../../../ui/map/UIMapUtil';
import UIMapOrgContent from '../../../../ui/map/UIMapOrgContent';
import UIMapCustomControl from '../../../../ui/map/UIMapCustomControl';
import UIMapTypeControl from '../../../../ui/map/UIMapTypeControl';
import UIMapMyLocationControl from '../../../../ui/map/UIMapMyLocationControl';
import NextFrame from '../../../../util/NextFrame';

export type IEventMapItem =  IIncidentReportData | IAlert_ACTIVE_INCIDENT;


export interface IEventMapViewProps extends RouteComponentProps{
}

export interface IEventMapViewState {
    showSidebar:boolean;
    initLoading:boolean;
    canDragMap:boolean;
}

export default class EventMapView extends React.Component<IEventMapViewProps, IEventMapViewState> {

    static ID:string = "eventMap";
    static PATH:string = "/event-response/event-map";
    static ICON:object = mapMarker;


    selectedMapInfoBox:React.RefObject<EventMapInfoBox> = React.createRef();

    _unmounting:boolean=false;
    _googleMap?:google.maps.Map;
    _mapZoomAdjustTimeoutID:number = -1;

    
    _clusterer_ActiveIncidents?:Clusterer;
    _clusterer_ReportedIncidents?:Clusterer;

    constructor(props: IEventMapViewProps) {
        super(props);

        this.state = {
            showSidebar:true,
            initLoading:true,
            canDragMap:true,
        }


    }

    componentDidMount(){

        Api.alertsManager.getAlerts(()=>{
            this.setState({initLoading:false});
        });

        listen(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);

        listen(MapEvent.MAP_INCIDENT_SELECTED_CHANGE, this._onMapIncidentSelectedChange);


    }
    componentWillUnmount(){
        this._unmounting=true;
        window.clearTimeout(this._timeoutCenterSelectedID);
        unlisten(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);
        unlisten(MapEvent.MAP_INCIDENT_SELECTED_CHANGE, this._onMapIncidentSelectedChange);
    }

    _onMapIncidentSelectedChange=()=>{
        this.forceUpdate();

        this._centerOnSelected();

    }


    _centerOnSelected=()=>{
        if(User.state.selectedMapIncident){
            if(this._googleMap){
                let zoom = this._googleMap.getZoom();

                if(!zoom){
                    this._googleMap.setZoom(UIMapUtil.MAX_CLUSTER_ZOOM+1);
                }
                let position = User.state.selectedMapIncident.mapPosition;
                if(User.state.selectedMapIncident.clusterPosition){
                    position = User.state.selectedMapIncident.clusterPosition;
                }

                //we have to let the mount finish to know the height, so lets do next frame
                NextFrame(()=>{

                    if(this._googleMap){

                        this._googleMap.panTo(position);

                        let infoBoxHeight:number = 0;
                        
                        if(this.selectedMapInfoBox.current?.infoBox.current?.infoBoxContentWrapper.current?.contentWrapper.current){
                            infoBoxHeight = this.selectedMapInfoBox.current.infoBox.current.infoBoxContentWrapper.current.contentWrapper.current.clientHeight;
                            this._googleMap.panBy(0,-infoBoxHeight/2);
                        }
                    }
                });
                
                
            }
        }
    }

    _onAlertsUpdate=()=>{
        this.forceUpdate();
    }

    _timeoutCenterSelectedID:number = -1;

    _onMapLoaded=($map:google.maps.Map)=>{
        this._googleMap = $map;
        if(this._googleMap && !this._unmounting){
            
            this._googleMap.setTilt(0);

            let bounds = getMapInitialLocation();
            this._googleMap.fitBounds(bounds,100);

            if(User.state.selectedMapIncident){
                this._centerOnSelected();
            }

            /*
            if(User.state.selectedMapIncident){
                this._fitMapToIncidents();
                this._centerOnSelected();
            }else{
                this._fitMapToIncidents();
            }
            */

        }
    }

    _fitMapToIncidents=()=>{
        if(this._googleMap){

            let bounds = new google.maps.LatLngBounds();
            User.state.mapIncidents.forEach(($incident)=>{
                if($incident.mapPosition){
                    bounds.extend($incident.mapPosition);
                }
            });            
            this._googleMap.fitBounds(bounds,100);
        }
    }

    _toggleSidebar=()=>{
        if(this.state.showSidebar){
            this._hideSidebar();
        }else{
            this._showSidebar();
        }
    }
    _hideSidebar=()=>{
        this.setState({showSidebar:false});
    }
    _showSidebar=()=>{        
        this.setState({showSidebar:true});
    }

    _onMarkerClick=($data:MapIncidentData)=>{
        $data.toggleSelected();

    }

    _enableMapDrag=()=>{
        this.setState({canDragMap:true});
    }
    _disableMapDrag=()=>{
        this.setState({canDragMap:false});
    }

    _onClusterClick=($cluster:Cluster, $markerBounds:google.maps.LatLngBounds)=>{
        if(this._googleMap){
            this._googleMap.fitBounds($markerBounds);
        }
    }

    _onClusteringEnd_ACTIVE_INCIDENTS=($clusterer:Clusterer)=>{        
        this._checkClusteringStatus(User.state.mapIncidents_ACTIVE_INCIDENTS,$clusterer);        
    }

    _onClusteringEnd_INCIDENT_REPORTS=($clusterer:Clusterer)=>{
        this._checkClusteringStatus(User.state.mapIncidents_INCIDENT_REPORTS,$clusterer);        
    }

    _checkClusteringStatus=($data:MapIncidentData[], $clusterer:Clusterer)=>{

            
        //First we clear all cluster positions from our data to reset...
        $data.forEach(($data)=>{
            $data.setClusterPosition(undefined);
        });


        //we check the clusterer's cluster's markers... lol
        $clusterer.clusters.forEach(($cluster)=>{

            let clusterPosition = $cluster.getCenter();

            //no matter what all markers are inside of a cluster.... but it's only clustered if there is at least 2
            let isClustered:boolean = $cluster.markers.length>=2;

            let zoom = this._googleMap!.getZoom();
            
            if(zoom>UIMapUtil.MAX_CLUSTER_ZOOM){
                isClustered=false;
            }else{

            }

            $cluster.markers.forEach(($marker)=>{
                //next we access the custom data property we stored when the marker was loaded (see: EventMapMarker)
                if($marker.get("data")){
                    let data:MapIncidentData = $marker.get("data");
                    if(isClustered){
                        data.setClusterPosition(clusterPosition);
                    }else{
                        data.setClusterPosition(undefined);
                    }
                    
                }
            });
        });
        this.forceUpdate();
    }


    _onZoomChanged=()=>{
        this.forceUpdate();
    }

    _onCloseInfoBox=()=>{
        if(User.state.selectedMapIncident){
            User.state.selectedMapIncident.toggleSelected();
        }
    }


    render() {

        let strExtraCN:string = "";
        if(this.state.showSidebar){
            strExtraCN+=" showingSidebar";
        }

        let strBtnShowSidebarCN:string = "btnShowSidebar";

        let mapOptions:google.maps.MapOptions = {
            draggable:this.state.canDragMap,
            streetViewControl:false,
            mapTypeControl:false,
            fullscreenControlOptions:{
                position:google.maps.ControlPosition.RIGHT_BOTTOM
            },
            rotateControl:false,
            
        }



        const getIncidentMarkers=($data:MapIncidentData[],$clusterer?:Clusterer):JSX.Element[]=>{
            return $data.map(($incident,$index)=>{
                return (     
                    <EventMapMarker clusterer={$clusterer} disableMapDrag={this._disableMapDrag} enableMapDrag={this._enableMapDrag} onClick={this._onMarkerClick} data={$incident} key={$incident.id+$index}/>
                );
            })
        }

        const getActiveIncidentMarkers=($clusterer?:Clusterer)=>{
            this._clusterer_ActiveIncidents = $clusterer;
            return getIncidentMarkers(User.state.mapIncidents_ACTIVE_INCIDENTS, $clusterer);
        };
        const getReportedIncidentMarkers=($clusterer?:Clusterer)=>{
            this._clusterer_ReportedIncidents = $clusterer;
            return getIncidentMarkers(User.state.mapIncidents_INCIDENT_REPORTS, $clusterer);
        }

        
        return (
            <UIView id={EventMapView.ID} extraClassName={strExtraCN} >
                <div className="eventMapContent">                    
                    <GoogleMap
                        onLoad={this._onMapLoaded}
                        mapContainerClassName="eventMapContentContainer uiMap"
                        clickableIcons={false}   
                        options={mapOptions} 
                        onZoomChanged={this._onZoomChanged}
                    >      
                        {this._googleMap && (
                            <UIMapCustomControl map={this._googleMap} position={google.maps.ControlPosition.RIGHT_BOTTOM} >
                                <UIMapMyLocationControl map={this._googleMap}/>
                            </UIMapCustomControl>
                        )}            
                        {this._googleMap && (
                            <UIMapCustomControl map={this._googleMap} position={google.maps.ControlPosition.RIGHT_BOTTOM} >
                                <UIMapTypeControl map={this._googleMap}/>
                            </UIMapCustomControl>
                        )}
                        <UIMapOrgContent/>
                                
                        <UIMapClusterer
                            maxZoom={UIMapUtil.MAX_CLUSTER_ZOOM}
                            onClick={this._onClusterClick}
                            styles={[UIMapClusterer.STYLE_ORANGE, UIMapClusterer.STYLE_ORANGE_RD]}
                            calculator={($markers,$num)=>{                                        
                                //THIS IS BASED ON FIRST INDEX OF 1 NOT 0 (Thank you google maps?!?!?)
                                let styleIndex:number=1;
                                let hasRolledIncidentReport = $markers.some(($marker)=>{
                                    let data:MapIncidentData = $marker.get("data");
                                    return data.alertType===ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA
                                });
                                let title:string = $num+" Event Reports";

                                if(hasRolledIncidentReport){
                                    styleIndex=2;
                                }
                                let iconInfo:ClusterIconInfo = {
                                    index:styleIndex,
                                    text:""+$markers.length,
                                    title:title
                                }
                                return iconInfo;
                            }}
                            onClusteringEnd={this._onClusteringEnd_INCIDENT_REPORTS}
                        >
                            {($clusterer:Clusterer)=>{
                                return getReportedIncidentMarkers($clusterer);
                            }}
                        </UIMapClusterer>   
                        <UIMapClusterer
                            maxZoom={UIMapUtil.MAX_CLUSTER_ZOOM}
                            onClick={this._onClusterClick}
                            styles={[UIMapClusterer.STYLE_RED]}
                            onClusteringEnd={this._onClusteringEnd_ACTIVE_INCIDENTS}
                            
                            calculator={($markers,$num)=>{

                                let lbl:string = $num+" Active Events";
                                return {
                                    index:1,
                                    text:""+$markers.length,
                                    title:lbl
                                }
                            }}
                        >
                            {($clusterer:Clusterer)=>{
                                return getActiveIncidentMarkers($clusterer);
                            }}
                        </UIMapClusterer>     
                        {User.state.selectedMapIncident && (
                            <EventMapInfoBox ref={this.selectedMapInfoBox} key={User.state.selectedMapIncident.id} data={User.state.selectedMapIncident} onClickClose={this._onCloseInfoBox} disableMapDrag={this._disableMapDrag} enableMapDrag={this._enableMapDrag} />
                        )}                               
                    </GoogleMap> 

                    <UIButton extraClassName="triggerNewEventBtn" size={UIButton.SIZE_SMALL} label="Trigger New Event" color={UIButton.COLOR_RED} iconOnLeft icon={alarmLight}/>
                       

                    <UIButton
                        extraClassName={strBtnShowSidebarCN}
                        icon={chevronDoubleLeft}
                        color={UIButton.COLOR_TRANSPARENT}
                        onClick={this._toggleSidebar}
                    />
                    <EventMapTime/>
                </div>
                <EventMapSidebar initLoading={this.state.initLoading}/>
            </UIView>
        );
    }
    

}



interface IEventMapTimeProps {
}

export class EventMapTime extends React.PureComponent<IEventMapTimeProps> {

    intervalID:number = -1;
    componentDidMount(){
        User.setCheckIncidentReports(true);     
        this.intervalID = window.setInterval(this._onUpdate,1000);
    }

    _onUpdate=()=>{
        this.forceUpdate();
    }

    componentWillUnmount(){
        User.setCheckIncidentReports(false);
        window.clearInterval(this.intervalID);
    }
    render() {
        let strCN:string = "eventMapTime";

        let lastUpdate:string = "";
        if(User.state.alertsLastUpdate){
            lastUpdate = FormatUtil.dateHMS(User.state.alertsLastUpdate,true,false);
        }
        let currentTime:string = FormatUtil.dateHMS(new Date(),true,false);
        
        return (
            <div className={strCN}>
                <div className="timeItem">
                    <div className="timeItemTitle">Last Update</div>
                    <div className="timeItemValue">{lastUpdate}</div>
                </div>
                <div className="timeItem">
                    <div className="timeItemTitle">Current Time</div>
                    <div className="timeItemValue">{currentTime}</div>
                </div>
            </div>
        );
    }
}

