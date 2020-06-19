export default class FloorPlansData{
    static TYPE:string = "at-floorplan";
}

export interface IFloorPlanPositionData{
    imgBounds:google.maps.LatLngBoundsLiteral;
    imgRotation:number;
    imgOpacity:number;
    posCenter:google.maps.LatLngLiteral;
    posRot:google.maps.LatLngLiteral;
    posScale:google.maps.LatLngLiteral;
}