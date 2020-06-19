import React from 'react';
import { GoogleMap } from '@react-google-maps/api';

import './UIMapImagePositioner.scss';


import UIMapMarker from './UIMapMarker';

import { IAssetTypeData } from '../../data/AssetData';
import { IFloorPlanPositionData } from '../../data/FloorPlansData';
import NextFrame from '../../util/NextFrame';
import UIMapGroundOverlay from './UIMapGroundOverlay';
import UIMapCustomControl from './UIMapCustomControl';
import UIMapImageOpacityControl from './UIMapImageOpacityControl';
import UIIcon from '../UIIcon';
import UILoadingIcon from '../UILoadingIcon';

import rotateRight from '@iconify/icons-mdi/rotate-right';
import baselineApps from '@iconify/icons-ic/baseline-apps';
import swapHorizontal from '@iconify/icons-mdi/swap-horizontal';

import UIMapUtil from './UIMapUtil';
import User from '../../data/User';


export interface UIMapImagePositionerProps {
    type:IAssetTypeData;
    url:string;
    positionDetails?:IFloorPlanPositionData;
}

export interface UIMapImagePositionerState {
    mode:string;
    posScale:google.maps.LatLng | null;
    posCenter:google.maps.LatLng | null;
    posRot:google.maps.LatLng | null;
    imgBounds:google.maps.LatLngBounds | null;
    imgRotation:number;
    imgOpacity:number;
    rotDiffLat:number;
    rotDiffLng:number;
    sizeDiffLat:number;
    sizeDiffLng:number;
    
}


export default class UIMapImagePositioner extends React.Component<UIMapImagePositionerProps, UIMapImagePositionerState> {
    
    static MODE_GET_IMG_DIMENSIONS:string = "getImgDimensions";
    static MODE_RESIZE_MAP_TO_DIMENSIONS:string = "getImgBounds"
    static MODE_READY:string = "ready";

    _googleMap:google.maps.Map | null = null;

    //distances in lat/lng
    lngWidth:number = 0; //X width
    latHeight:number = 0; //Y height

    baseOverlayW:number=0;
    baseOverlayH:number=0;

    _imgRatio:number=1;
    _isUnmounting:boolean=false;

    _numPadding:number = 50;

    
    timeoutID:number = -1;
    
    private mapPositionContainer:React.RefObject<HTMLDivElement> = React.createRef();

    constructor(props: UIMapImagePositionerProps) {
        super(props);


        this.state = {
            imgBounds:null,
            posCenter:null,
            posScale:null,
            posRot:null,
            imgRotation:0,
            rotDiffLat:0,
            rotDiffLng:0,
            imgOpacity:75,
            sizeDiffLat:0,
            sizeDiffLng:0,
            mode:UIMapImagePositioner.MODE_GET_IMG_DIMENSIONS,
        }
    }
    componentDidMount(){
        let img:HTMLImageElement = new Image();    
         
        img.onload = ()=>{
            if(!this._isUnmounting){

                let rawH:number = img.height;
                let rawW:number = img.width;
                this._imgRatio = rawH/rawW;


                if(!this.props.positionDetails){
                    //new

                    if(this.mapPositionContainer.current){
                    
                        let containerH:number = this.mapPositionContainer.current.clientHeight;
                        this.baseOverlayH = containerH-this._numPadding-this._numPadding;
                    }
                    this.baseOverlayW = (rawW*this.baseOverlayH)/rawH;
                    
                    this.setState({mode:UIMapImagePositioner.MODE_RESIZE_MAP_TO_DIMENSIONS},()=>{
                        NextFrame(()=>{
                            if(!this._isUnmounting){        
                                
                                window.clearTimeout(this.timeoutID);                   
                                this.timeoutID = window.setTimeout(()=>{
                                    
                                    
                                    if(this._googleMap){
                                        let mapBounds:google.maps.LatLngBounds | null | undefined = this._googleMap.getBounds();
                                        
                                        if(mapBounds){//lets calculate some initial positions!
    
                                            
                                            let ne:google.maps.LatLng = mapBounds.getNorthEast();
                                            let sw:google.maps.LatLng = mapBounds.getSouthWest();
    
                                            let neLat:number = ne.lat();
                                            let neLng:number = ne.lng();
    
                                            let swLat:number = sw.lat();
                                            let swLng:number = sw.lng();
    
                                            this.latHeight = neLat-swLat;
                                            this.lngWidth = neLng-swLng;
                                            
                                            //center
                                            let posCenter:google.maps.LatLng = mapBounds.getCenter();
    
                                            let centerLat:number = posCenter.lat();
                                            let centerLng:number = posCenter.lng();
    
                                            //size/scale 
                                            let imgScalePosLat:number = centerLat;
                                            let imgScalePosLng:number = centerLng+(this.lngWidth/2);
                                            let posScale:google.maps.LatLng = new google.maps.LatLng(imgScalePosLat,imgScalePosLng);
    
                                            let sizeDiffLat:number = imgScalePosLat-centerLat;
                                            let sizeDiffLng:number = imgScalePosLng-centerLng;
    
                                            //rotation
                                            let imgRotPosLat:number = centerLat+(this.latHeight/2);
                                            let imgRotPosLng:number = centerLng;
                                            let posRot:google.maps.LatLng = new google.maps.LatLng(imgRotPosLat,imgRotPosLng);
    
                                            let rotDiffLat:number = imgRotPosLat-centerLat;
                                            let rotDiffLng:number = imgRotPosLng-centerLng;
    
    
                                            this.setState({
                                                mode:UIMapImagePositioner.MODE_READY, 
                                                imgBounds:mapBounds, 
                                                posCenter:posCenter,
                                                posScale:posScale,
                                                posRot:posRot,
                                                rotDiffLat:rotDiffLat,
                                                rotDiffLng:rotDiffLng,
                                                sizeDiffLat:sizeDiffLat,
                                                sizeDiffLng:sizeDiffLng
                                            });
                                            
                                        }
                                    }
                                },500);
                            }
                        })
                    });

                }else{

        
                    let sw:google.maps.LatLng = new google.maps.LatLng(this.props.positionDetails.imgBounds.south, this.props.positionDetails.imgBounds.west);
                    let ne:google.maps.LatLng = new google.maps.LatLng(this.props.positionDetails.imgBounds.north, this.props.positionDetails.imgBounds.east);
                    let imgBounds:google.maps.LatLngBounds = new google.maps.LatLngBounds(sw,ne);
        
                    let posCenter:google.maps.LatLng = new google.maps.LatLng(this.props.positionDetails.posCenter.lat,this.props.positionDetails.posCenter.lng);
                    let posScale:google.maps.LatLng = new google.maps.LatLng(this.props.positionDetails.posScale.lat,this.props.positionDetails.posScale.lng);
                    let posRot:google.maps.LatLng = new google.maps.LatLng(this.props.positionDetails.posRot.lat,this.props.positionDetails.posRot.lng);
                


                    let neLat:number = ne.lat();
                    let neLng:number = ne.lng();

                    let swLat:number = sw.lat();
                    let swLng:number = sw.lng();

                    this.latHeight = neLat-swLat;
                    this.lngWidth = neLng-swLng;

                    
                    let centerLat:number = posCenter.lat();
                    let centerLng:number = posCenter.lng();
                    
                    let sizeDiffLat:number = posScale.lat()-centerLat;
                    let sizeDiffLng:number = posScale.lng()-centerLng;

                    let rotDiffLat:number = posRot.lat()-centerLat;
                    let rotDiffLng:number = posRot.lng()-centerLng;

                    this.setState({
                        mode:UIMapImagePositioner.MODE_READY, 
                        imgRotation:this.props.positionDetails.imgRotation,
                        imgOpacity:this.props.positionDetails.imgOpacity,
                        imgBounds:imgBounds, 
                        posCenter:posCenter,
                        posScale:posScale,
                        posRot:posRot,
                        rotDiffLat:rotDiffLat,
                        rotDiffLng:rotDiffLng,
                        sizeDiffLat:sizeDiffLat,
                        sizeDiffLng:sizeDiffLng
                    });

                }


                
            }
        }
        //lets go! starts it

        img.src = this.props.url;

    }   
    componentWillUnmount(){
        window.clearTimeout(this.timeoutID);
        this._isUnmounting=true;
    }

    getPositionDetails=():IFloorPlanPositionData=>{
        return {
            posRot:this.state.posRot!.toJSON(),
            posScale:this.state.posScale!.toJSON(),
            posCenter:this.state.posCenter!.toJSON(),
            imgRotation:this.state.imgRotation,
            imgOpacity:this.state.imgOpacity,
            imgBounds:this.state.imgBounds!.toJSON()
        }
    }

    _onMapLoaded=($map:google.maps.Map)=>{

        this._googleMap = $map;
        if(this._googleMap){
            this._googleMap.setTilt(0);
            if(this.props.positionDetails){
                let sw:google.maps.LatLng = new google.maps.LatLng(this.props.positionDetails.imgBounds.south, this.props.positionDetails.imgBounds.west);
                let ne:google.maps.LatLng = new google.maps.LatLng(this.props.positionDetails.imgBounds.north, this.props.positionDetails.imgBounds.east);
                let imgBounds:google.maps.LatLngBounds = new google.maps.LatLngBounds(sw,ne);
                this._googleMap.fitBounds(imgBounds,this._numPadding);  
            }else{

                let numLat:number = 26.181608;
                let numLng:number = -80.134874;
                
                if(User.selectedOrg.primaryAddress){
                    numLat = User.selectedOrg.primaryAddress.lat;
                    numLng = User.selectedOrg.primaryAddress.lon;
                }

                let latLng:google.maps.LatLng = new google.maps.LatLng(numLat,numLng);

                this._googleMap.setCenter(latLng);
                this._googleMap.setZoom(16);

            }
        }

    }

    _onDragCenter=($id:string, $position:google.maps.LatLng)=>{

        let posLat:number = $position.lat();
        let posLng:number = $position.lng();

        let halfLngW:number = this.lngWidth/2;
        let halfLatH:number = this.latHeight/2;


        let newSW:google.maps.LatLng = new google.maps.LatLng(posLat-(halfLatH),posLng-(halfLngW));
        let newNE:google.maps.LatLng = new google.maps.LatLng(posLat+(halfLatH),posLng+(halfLngW));        
        let bounds:google.maps.LatLngBounds = new google.maps.LatLngBounds(newSW,newNE);


        let imgRotPosLat:number = posLat+this.state.rotDiffLat;
        let imgRotPosLng:number = posLng+this.state.rotDiffLng;

        let imgRotPos:google.maps.LatLng = new google.maps.LatLng(imgRotPosLat,imgRotPosLng);

        let imgScalePosLat:number = posLat+this.state.sizeDiffLat;
        let imgScalePosLng:number = posLng+this.state.sizeDiffLng;


        let imgScalePos:google.maps.LatLng = new google.maps.LatLng(imgScalePosLat,imgScalePosLng);

        this.setState({posCenter:$position, imgBounds:bounds, posScale:imgScalePos, posRot:imgRotPos});
    }
    _onDragCenterEnd=($id:string, $position:google.maps.LatLng)=>{

    }

    
    _getDiff=($lngA:number, $lngB:number, $latA:number, $latB:number)=>{
        return {
            lat:$latA>$latB?$latA-$latB:$latB-$latA,
            lng:$lngA>$lngB?$lngA-$lngB:$lngB-$lngA
        }
    }

    _onDragSize=($id:string, $position:google.maps.LatLng)=>{

        if(this.state.posCenter && this._googleMap){
            
            let centerLat:number = this.state.posCenter.lat();
            let centerLng:number = this.state.posCenter.lng();

            let posLat:number = $position.lat();
            let posLng:number = $position.lng();

            let obj = this._getDiff(posLng,centerLng,posLat,centerLat);

            this.lngWidth = obj.lng*2;

            let projection = this._googleMap.getProjection();
            
            if(projection){

                let scale:number = Math.pow(2,this._googleMap.getZoom());
                
                
                let pntSize = UIMapUtil.latLng2Point(this._googleMap,scale,projection,$position);                
                let pntCenter = UIMapUtil.latLng2Point(this._googleMap,scale,projection,this.state.posCenter);
                
                let sizeX:number = pntSize.x;

                let centerX:number = pntCenter.x;
                let centerY:number = pntCenter.y;

                let diffX:number = sizeX>centerX?sizeX-centerX:centerX-sizeX;
                let calculatedW:number = diffX*2;
                let calculatedH:number = calculatedW*this._imgRatio;
                let halfCalcH:number = calculatedH/2;

                let pntCalcN:google.maps.Point = new google.maps.Point(centerX,centerY-halfCalcH);
                let pntCalcS:google.maps.Point = new google.maps.Point(centerX,centerY+halfCalcH);

                let latLngNCalc:google.maps.LatLng = UIMapUtil.point2LatLng(this._googleMap,scale,projection,pntCalcN);
                let latLngSCalc:google.maps.LatLng = UIMapUtil.point2LatLng(this._googleMap,scale,projection,pntCalcS);

                let objCalc = this._getDiff(latLngNCalc.lng(),latLngSCalc.lng(),latLngNCalc.lat(),latLngSCalc.lat());

                this.latHeight = objCalc.lat;
            }
            let latH2:number = this.latHeight/2;
            let lngW2:number = this.lngWidth/2;

            let newSW:google.maps.LatLng = new google.maps.LatLng(centerLat-latH2,centerLng-lngW2);
            let newNE:google.maps.LatLng = new google.maps.LatLng(centerLat+latH2,centerLng+lngW2);

            let imgBounds:google.maps.LatLngBounds = new google.maps.LatLngBounds(newSW,newNE);
            


            let sizeDiffLat:number = $position.lat()-centerLat;
            let sizeDiffLng:number = $position.lng()-centerLng;

            this.setState({
                imgBounds:imgBounds, 
                posCenter:imgBounds.getCenter(), 
                sizeDiffLat:sizeDiffLat, 
                sizeDiffLng:sizeDiffLng
            });
            
        }

    }
    _onDragSizeEnd=($id:string, $position:google.maps.LatLng)=>{

        this.setState({posScale:$position});
    }

    
    _onDragRot=($id:string, $position:google.maps.LatLng)=>{

        if(this.state.posCenter){


            let posLat:number = $position.lat();
            let posLng:number = $position.lng();

            let centerLat:number = this.state.posCenter.lat();
            let centerLng:number = this.state.posCenter.lng();

            let rotDiffLat:number = posLat-centerLat;
            let rotDiffLng:number = posLng-centerLng;

            let rotation:number = Math.atan2(rotDiffLng, rotDiffLat) * 180 / Math.PI;

            this.setState({imgRotation:rotation, rotDiffLat:rotDiffLat, rotDiffLng:rotDiffLng});
        }



    }
    _onDragRotEnd=($id:string, $position:google.maps.LatLng)=>{

        this.setState({posRot:$position});
    }
    _onOpacityChange=($value:number)=>{
        this.setState({imgOpacity:$value});
    }
    render() {

        let strCN:string = "mapImagePositioner fieldItem fullWidth";


        let jsxSizeMarker:JSX.Element = <></>;
        let jsxCenterMarker:JSX.Element = <></>;
        let jsxRotMarker:JSX.Element = <></>;
        let jsxOverlay:JSX.Element = <></>;

        let baseIcon:any = {};
        switch(this.state.mode){
            case UIMapImagePositioner.MODE_READY:
            
                jsxCenterMarker = (
                    <UIMapMarker 
                        id="position"
                        draggable={true}
                        title="Position"
                        zIndex={10}
                        icon={UIMapUtil.getIcon(UIMapUtil.ICON_COLOR_PURPLE,1.35,true)}
                        label={UIMapUtil.getSSIconAsLabel("move","24px")}
                        position={this.state.posCenter!} 
                        onDrag={this._onDragCenter}
                        onDragEnd={this._onDragCenterEnd}
                    />
                );
                jsxSizeMarker = (
                    <UIMapMarker 
                        id="scale"
                        draggable={true}
                        title="Scale"
                        zIndex={20}
                        icon={UIMapUtil.getIcon(UIMapUtil.ICON_COLOR_GREEN,1.35,true)}
                        label={UIMapUtil.getSSIconAsLabel("scale","24px","#000000")}                    
                        position={this.state.posScale!} 
                        onDrag={this._onDragSize}
                        onDragEnd={this._onDragSizeEnd}
                    />
                );

                jsxRotMarker = (
                    <UIMapMarker 
                        id="rotate"
                        draggable={true}
                        title="Rotate"
                        zIndex={30}
                        icon={UIMapUtil.getIcon(UIMapUtil.ICON_COLOR_LIGHTBLUE,1.35,true)}
                        label={UIMapUtil.getSSIconAsLabel("rotate","24px","#000000")}
                        position={this.state.posRot!} 
                        onDrag={this._onDragRot}
                        onDragEnd={this._onDragRotEnd}
                    />

                )



                let numOpacity:number = this.state.imgOpacity/100;
                if(numOpacity>1)numOpacity=1;
                if(numOpacity<0.1)numOpacity=0.1;


                jsxOverlay = (
                    <UIMapGroundOverlay
                        bounds={this.state.imgBounds!}
                        url={this.props.url}
                        imgAlt={this.props.type.singularLabel}
                        opacity={numOpacity}
                        rotation={this.state.imgRotation}
                    />
                );


            break;

        }
        
        


        let mapContainerStyle:React.CSSProperties = {};

        if(this.state.mode===UIMapImagePositioner.MODE_RESIZE_MAP_TO_DIMENSIONS){
            mapContainerStyle.width = this.baseOverlayW;
            mapContainerStyle.height = this.baseOverlayH;
        }

        let jsxMapContents:JSX.Element = <></>;
        
        let strPreparingCN:string = "mapPositionPreparing";
        if(this.state.mode!==UIMapImagePositioner.MODE_READY){ //always show preparing when its not ready
            strPreparingCN+=" showing";
        }else{

            jsxMapContents = (
                <>
                    {jsxOverlay}
                    {jsxCenterMarker}
                    {jsxSizeMarker}
                    {jsxRotMarker}
                </>
            );
        }


        let jsxCustomControls:JSX.Element = <></>;

        if(this._googleMap){
            jsxCustomControls = (
                <UIMapCustomControl map={this._googleMap} position={google.maps.ControlPosition.LEFT_CENTER}>
                    <UIMapImageOpacityControl opacity={this.state.imgOpacity} onOpacityChange={this._onOpacityChange}/>
                </UIMapCustomControl>
            );
        }

        return (
            <div className={strCN}>
                <div className="mapPositionTitle">{this.props.type.singularLabel} Position <span>*</span></div>
                <div className="mapPositionDesc">
                    Drag the Markers below to place the {this.props.type.singularLabel}.     
                    <div className="mapPositionLegend">
                        <div className="mapPositionLegendItem position"><UIIcon icon={baselineApps}/>Position</div>
                        <div className="mapPositionLegendItem scale"><UIIcon icon={swapHorizontal}/>Scale</div>
                        <div className="mapPositionLegendItem rotation"><UIIcon icon={rotateRight}/>Rotation</div>                    
                    </div>            
                </div>

                <div className="mapPositionContainer" ref={this.mapPositionContainer}>
                    <GoogleMap
                        onLoad={this._onMapLoaded}
                        mapContainerClassName="mapPositionMap"
                        mapContainerStyle={mapContainerStyle}  
                        clickableIcons={false}    
                    >
                        {jsxCustomControls}
                        {jsxMapContents}                        
                    </GoogleMap>                    
                    <div className={strPreparingCN}>
                        <UILoadingIcon/>
                        <div>Preparing {this.props.type.singularLabel} Positioner...</div>
                    </div>
                </div>                
            </div>
        );
    }
}


