import * as React from 'react';
import Widget from './Widget';
import { GoogleMap } from '@react-google-maps/api';
import './EventsMapWidget.scss';
import User from '../../../../data/User';
import UIMapMarker from '../../../../ui/map/UIMapMarker';
import { listen, unlisten, dispatch } from '../../../../dispatcher/Dispatcher';
import AppEvent from '../../../../event/AppEvent';
import { Organization } from '../../../../data/Organization';
import FormatUtil from '../../../../util/FormatUtil';
import UIMapClusterer from '../../../../ui/map/UIMapClusterer';
import { Clusterer, Cluster, ClusterIconStyle, ClusterIconInfo } from '@react-google-maps/marker-clusterer';
import UIMapUtil from '../../../../ui/map/UIMapUtil';
import MapIncidentData, { getMapInitialLocation } from '../../../../data/MapIncidentData';
import EventMapMarker from '../../er/eventMap/EventMapMarker';
import UILoadingBox from '../../../../ui/UILoadingBox';
import UIMapOrgContent from '../../../../ui/map/UIMapOrgContent';
import { ALERT_ALT_TYPE_ROLLED_INCIDENT_REPORT_DATA } from '../../../../data/IncidentData';

export interface EventsMapWidgetProps {
}

export interface EventsMapWidgetState {
}

export default class EventsMapWidget extends React.Component<EventsMapWidgetProps, EventsMapWidgetState> {
    static ID:string = "eventsMapWidget";

    
    _googleMap?:google.maps.Map;

    
    
    _clusterer_ActiveIncidents?:Clusterer;
    _clusterer_ReportedIncidents?:Clusterer;

    constructor(props: EventsMapWidgetProps) {
        super(props);

        this.state = {
        }
    }
    
    componentDidMount(){
        listen(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);
    }
    componentWillUnmount(){
        unlisten(AppEvent.ALERTS_UPDATE, this._onAlertsUpdate);
        window.clearTimeout(this.mapZoomAdjustTimeoutID);
    }
    _onAlertsUpdate=($event:AppEvent)=>{
        this.forceUpdate();
    }

    mapZoomAdjustTimeoutID:number = -1;

    _onMapLoaded=($map:google.maps.Map)=>{
        
        this._googleMap = $map;
        if(this._googleMap){
            this._googleMap.setTilt(0);

            let bounds = getMapInitialLocation();

            this._googleMap.fitBounds(bounds,100);


        }

    }

    _onClusterClick=($cluster:Cluster, $markerBounds:google.maps.LatLngBounds)=>{
        if(this._googleMap){
            this._googleMap.fitBounds($markerBounds);
        }
    }
    _enableMapDrag=()=>{
    }
    _disableMapDrag=()=>{
    }

    _onMarkerClick=($data:MapIncidentData)=>{        
        dispatch(new AppEvent(AppEvent.VIEW_MAP_INCIDENT, {data:$data.data, type:$data.alertType}));
    }


    render() {



        let reportedCount = User.state.alerts_PENDING_INCIDENT_REPORT.reduce(($prev:number, $current)=>{
            return $prev+$current.numItems;
        },0);


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
            <Widget id={EventsMapWidget.ID} label="Event Map" useWhiteBoxForContent>
                <div className="eventsMapHeader">
                    <EventsMapWidgetHeaderItem count={""+User.state.alerts_ACTIVE_INCIDENT.length} desc={"Active Events"}/>
                    {User.state.userOrgsHasIncidentControl && (
                        <EventsMapWidgetHeaderItem count={""+reportedCount} desc={"Reported Events"}/>
                    )}
                    <EventsMapWidgetHeaderItem count={""+User.state.alerts_ASSIGNED_CHECKLIST.length} desc={"Checklists to complete"}/>
                </div>
                <div className="eventsMapContent">
                    {!User.state.alertsLastUpdate && (
                        <UILoadingBox fullHeight/>
                    )}
                    {User.state.alertsLastUpdate && (
                        <>
                            <GoogleMap
                                onLoad={this._onMapLoaded}
                                mapContainerClassName="eventsMapContentContainer uiMap"
                                clickableIcons={false}    
                                options={{
                                    mapTypeControl:false,
                                    fullscreenControl:false,
                                    streetViewControl:false
                                }}
                                >  
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
                                >
                                    {($clusterer:Clusterer)=>{
                                        return getReportedIncidentMarkers($clusterer);
                                    }}
                                </UIMapClusterer>   
                                <UIMapClusterer
                                    maxZoom={UIMapUtil.MAX_CLUSTER_ZOOM}
                                    onClick={this._onClusterClick}
                                    styles={[UIMapClusterer.STYLE_RED]}
                                    
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

                            </GoogleMap> 
                            <div className="lastUpdate">Last Update: {FormatUtil.dateHMS(User.state.alertsLastUpdate,true)}</div>
                        </>
                    )} 
                </div>
            </Widget>
        );
    }
}


interface IEventsMapWidgetHeaderItemProps {
    count:string;
    desc:string;
}

class EventsMapWidgetHeaderItem extends React.Component<IEventsMapWidgetHeaderItemProps> {
    render() {
        return (
            <div className="mapHeaderItem">
                <div className="count">{this.props.count}</div>
                <div className="desc">{this.props.desc}</div>
            </div>
        );
    }
}
