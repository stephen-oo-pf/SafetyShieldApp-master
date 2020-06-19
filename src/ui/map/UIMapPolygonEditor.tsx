import React from 'react';
import { GoogleMap, Polygon, Polyline } from '@react-google-maps/api';
import './UIMapPolygonEditor.scss';
import UICenterBox from '../UICenterBox';
import { UIViewFieldsItem } from '../UIViewFields';

import UIMapMarker from './UIMapMarker';
import UIMapCustomControl from './UIMapCustomControl';
import UIButton from '../UIButton';
import AlertOverlay from '../../overlay/AlertOverlay';

import mapMarkerRemove from '@iconify/icons-mdi/map-marker-remove';
import UIMapUtil from './UIMapUtil';


export interface IUIMapPolygonEditorProps {
    initCenter?:google.maps.LatLng;
    initPoints:google.maps.LatLng[];
    viewOnlyMode?:boolean;
}

export interface IUIMapPolygonEditorState {
    
    center?:google.maps.LatLng;
    zoom:number;
    points:google.maps.LatLng[];
    selectedPointIndex:number;
    
}

export default class UIMapPolygonEditor extends React.PureComponent<IUIMapPolygonEditorProps, IUIMapPolygonEditorState> {


    mapContainer:React.RefObject<HTMLDivElement> = React.createRef();

    
    _googleMap:google.maps.Map | null = null;
    _polygon:google.maps.Polygon | null = null;
    

    constructor(props: IUIMapPolygonEditorProps) {
        super(props);


        this.state = {
            center:this.props.initCenter,
            zoom:17,
            points:this.props.initPoints,
            selectedPointIndex:-1,
        }
    }
    componentDidMount(){

    }

    componentDidUpdate($prevProps:IUIMapPolygonEditorProps){
        if(this.props.initCenter!==$prevProps.initCenter && !this.props.viewOnlyMode){

            this.setState({points:[], center:this.props.initCenter},()=>{
                this.tryCreatePoints();
            });
        }
    }
    _onPolygonLoad=($polygon:google.maps.Polygon)=>{
        this._polygon = $polygon;
    }
    _onMapLoaded=($map:google.maps.Map)=>{
        this._googleMap = $map;
        this._googleMap.setTilt(0);

        if(this.props.initPoints && this.props.initPoints.length>0){
            let bounds:google.maps.LatLngBounds = new google.maps.LatLngBounds();
            this.props.initPoints.forEach(($latLngPoint)=>{
                bounds.extend($latLngPoint);
            });
            let pad:number = this.props.viewOnlyMode?0:30;
            this._googleMap.fitBounds(bounds,pad);
        }

    }

    _projectionCreated:boolean=false;
    _onProjectionChanged=()=>{
        if(!this._projectionCreated){
            this._projectionCreated=true;
            this.tryCreatePoints();
        }
    }
    tryCreatePoints=()=>{
        if(this._googleMap && this._projectionCreated){

            let projection = this._googleMap.getProjection();
            
            if(this.state.points.length===0 && this.mapContainer.current && this.state.center && projection){
                //create some points in the shape of a rectangle
                
                let scale:number = Math.pow(2,this._googleMap.getZoom());
                let pntCenter = UIMapUtil.latLng2Point(this._googleMap, scale, projection,this.state.center);
    
                //lets make our rectangle half the width/height of the entire container
                let startW:number = this.mapContainer.current.clientWidth/2;
                let startH:number = this.mapContainer.current.clientHeight/2;
    
                let halfStartW:number = startW/2;
                let halfStartH:number = startH/2;
    
                let tl:google.maps.LatLng = UIMapUtil.point2LatLng(this._googleMap,scale,projection,new google.maps.Point(pntCenter.x-halfStartW,pntCenter.y-halfStartH));
                let tr:google.maps.LatLng = UIMapUtil.point2LatLng(this._googleMap,scale,projection,new google.maps.Point(pntCenter.x+halfStartW,pntCenter.y-halfStartH));
                let bl:google.maps.LatLng = UIMapUtil.point2LatLng(this._googleMap,scale,projection,new google.maps.Point(pntCenter.x-halfStartW,pntCenter.y+halfStartH));
                let br:google.maps.LatLng = UIMapUtil.point2LatLng(this._googleMap,scale,projection,new google.maps.Point(pntCenter.x+halfStartW,pntCenter.y+halfStartH));
                
                this.setState({points:[tl,tr,br,bl]});
    
            }
        }
    }

    _onMarkerDrag=($id:string, $pos:google.maps.LatLng)=>{        
        if(this.state.points){
            let index:number = Number($id);        
            let points = [...this.state.points];
            points[index] = $pos;
            this.setState({points:points});
        }
    }
    _onMarkerDragEnd=($id:string, $pos:google.maps.LatLng)=>{
        
    }
    _onMarkerSelect=($id:string)=>{
        this.setState({selectedPointIndex:Number($id)});
    }
    _onPolygonDrag=()=>{
        if(this._polygon){
            let points = this._polygon.getPath().getArray();
            this.setState({points:points});
        }
    }
    _onAddMarkerClick=($index:number, $pnt:google.maps.LatLng)=>{
        if(this.state.points){
            let points = [...this.state.points];
            points.splice($index+1,0,$pnt);

            this.setState({points:points});
        }
    }
    _onDeleteSelected=()=>{

        if(this.state.selectedPointIndex!==-1 && this.state.points){

            if(this.state.points.length>3){

                let points = [...this.state.points];
                points.splice(this.state.selectedPointIndex,1);
                this.setState({points:points, selectedPointIndex:-1});
            }else{
                AlertOverlay.show("deletePolygonMaxPoints","A shape must contain 3 sides");
            }

        }

    }
    render() {

        let strCN:string = "mapPolygonEditor";

        if(this.props.viewOnlyMode){
            strCN+=" viewOnly";
        }

        let jsxContent:JSX.Element = <></>;

        let statusBoxLbl:string | JSX.Element = "";

        let color:string = "#CC0000";
        
        let jsxCustomControls:JSX.Element = <></>;
        let strDeleteControlCN:string = "deleteControl";

        let strDelLbl:string = "Delete Selected Point: "+(this.state.selectedPointIndex+1);
        if(this.state.selectedPointIndex===-1 || (this.state.points && this.state.points.length<=3)){
            strDeleteControlCN+=" hide";
            strDelLbl = "Delete Selected Point";
        }

        if(this._googleMap){
            jsxCustomControls = (
                <UIMapCustomControl map={this._googleMap} position={google.maps.ControlPosition.BOTTOM_CENTER}>
                    <div className={strDeleteControlCN}>
                        <UIButton onClick={this._onDeleteSelected} label={strDelLbl} size={UIButton.SIZE_SMALL} icon={mapMarkerRemove} iconOnLeft/>
                    </div>
                </UIMapCustomControl>
            );
        }


        if(!this.state.center){
            statusBoxLbl = (<>To begin, enter an address above then press <span style={{fontWeight:600}}>Set As Map Location</span></>);

        }else{
            strCN+=" ready";
            statusBoxLbl = "Reticulating Splines...";

            let addMarkers = [];
            let lines = [];
            if(this.state.points && !this.props.viewOnlyMode){
                let numPnts:number = this.state.points.length;
                for(let i=0; i<numPnts; i++){

                    let pntA = this.state.points[i];

                    let pntB = (i===numPnts-1)?this.state.points[0]:this.state.points[i+1];

                    let midPnt = google.maps.geometry.spherical.interpolate(pntA,pntB,0.5);

                    lines.push(<Polyline       
                        key={"line"+i}                     
                        path={[pntA,pntB]}
                        options={{strokeColor:color}}
                        onClick={()=>{
                            this._onAddMarkerClick(i,midPnt);
                        }}
                    />);

                    addMarkers.push((
                        <UIMapMarker
                            key={"addMarker"+i}
                            draggable={false}
                            label=" "
                            icon={{url:"./static/media/pins/add.png", anchor:new google.maps.Point(15,15)}}
                            id={"addMarker"+i}
                            position={midPnt}
                            title={"Add New Point Here"}
                            onClick={()=>{
                                this._onAddMarkerClick(i, midPnt);
                            }}
                        />
                    ));

                }
            }


            let mapOptions:google.maps.MapOptions = {};
            if(this.props.viewOnlyMode){
                mapOptions.fullscreenControl=false;
                mapOptions.streetViewControl=false;

            }

            let polygonOptions:any = {fillColor:color, strokeColor:color};
            if(!this.props.viewOnlyMode){
                polygonOptions.strokeWeight = 0;
            }

            jsxContent = (
                <GoogleMap
                    center={this.state.center}
                    zoom={this.state.zoom}
                    onLoad={this._onMapLoaded}
                    mapContainerClassName="mapPolygonEditorMap"
                    clickableIcons={false}   
                    onProjectionChanged={this._onProjectionChanged} 
                    options={mapOptions}
                >  
                    {jsxCustomControls}
                    {this.state.points && (
                        <>
                            {!this.props.viewOnlyMode && this.state.points.map(($latLngPoint,$index)=>{
                                
                                let icon = UIMapUtil.getIcon(UIMapUtil.ICON_COLOR_RED);
                                if($index===this.state.selectedPointIndex){
                                    icon = UIMapUtil.getIcon(UIMapUtil.ICON_COLOR_PURPLE);
                                }

                                return (
                                    <UIMapMarker 
                                        id={""+$index}
                                        key={"polygonMarker"+$index}
                                        title={"Point "+($index+1)}
                                        position={$latLngPoint}
                                        onDrag={this._onMarkerDrag}
                                        onDragEnd={this._onMarkerDragEnd}
                                        icon={icon}
                                        label={UIMapUtil.getLabel(""+($index+1))}  
                                        draggable={true} 
                                        onClick={this._onMarkerSelect}
                                    />
                                )
                            })}
                            <Polygon onLoad={this._onPolygonLoad}  onDrag={this._onPolygonDrag} draggable={!this.props.viewOnlyMode} options={polygonOptions} path={this.state.points}/>
                            {lines}
                            {addMarkers}

                        </>
                    )}
                </GoogleMap>
            );
        }


        let title;

        if(!this.props.viewOnlyMode){
            title = (
                <>
                    9-1-1 Boundary Area
                    <span className="required">*</span>
                </>
            );
        }

        return (
                <UIViewFieldsItem
                    extraClassName="mapPolygonEditorWrapper"
                    fullWidth
                    title={title}
                    value={
                        (
                            <>
                                {!this.props.viewOnlyMode && (
                                    <p>Drag and drop the markers below to create the boundaries that indicate where 9-1-1 calls should be associated with this organization.</p>
                                )}
                                <div className={strCN}>  
                                    <div className="mapPolygonEditorContainer" ref={this.mapContainer}>
                                        {jsxContent}
                                    </div>
                                    <UICenterBox extraClassName="statusBox">
                                        {statusBoxLbl}
                                    </UICenterBox>
                                </div>
                            </>
                        )
                    }
                />
        );
    }
}
