import { getIncidentTypeIconOrFontLetter } from "../../data/IncidentData";
import './UIMapUtil.scss';


export default class UIMapUtil{


    static MAX_CLUSTER_ZOOM:number = 18;

    static PIN_BASE_URL:string = "./static/media/pins/";

    static ICON_COLOR_ORANGE:string = "orange";    
    static ICON_COLOR_ORANGE_REDDOT:string = "orange-reddot";    
    static ICON_COLOR_BLUE:string = "blue";     
    static ICON_COLOR_LIGHTBLUE:string = "lightblue";     
    static ICON_COLOR_DARKBLUE:string = "darkblue";    
    static ICON_COLOR_RED:string = "red";  
    static ICON_COLOR_PURPLE:string = "purple";
    static ICON_COLOR_GREEN:string = "green";
   

    static getIcon($color:string, $scale:number=1, $offset:boolean=false):google.maps.Icon{

        let strURL:string = this.PIN_BASE_URL+$color+".png";

        let iconSize:google.maps.Size = new google.maps.Size(33*$scale,39*$scale);
      
        let lblX:number = 16.5*$scale;
        let lblY:number = 16.5*$scale;

        if($offset){
            lblX = 14.5*$scale;
            lblY = 15.5*$scale;
        }

        return {
            url:strURL,
            scaledSize:iconSize,
            size:iconSize,
            labelOrigin:new google.maps.Point(lblX,lblY)
        }
    }
    
    static getSSIconAsLabel($iconInfo:string, $fontSize:string="20px", $fontColor:string="#FFFFFF"):google.maps.MarkerLabel{

        let fontLetter = getIncidentTypeIconOrFontLetter($iconInfo,true) as string;


        return {
            text:fontLetter,
            color:$fontColor,
            fontFamily:"ssIncidentIcons",
            fontSize:$fontSize
        }
    }
    static getLabel($text:string):google.maps.MarkerLabel{

        return {
            text:$text,
            color:"#FFFFFF",
            fontFamily:"Roboto",
            fontWeight:"700",
            fontSize:"20px"
        }
    }

    

    static latLng2Point=($map:google.maps.Map, $scale:number,  $projection:google.maps.Projection, $latLng:google.maps.LatLng)=>{
        let topRight = $projection.fromLatLngToPoint($map.getBounds()!.getNorthEast());
        let bottomLeft = $projection.fromLatLngToPoint($map.getBounds()!.getSouthWest());
        let worldPoint = $projection.fromLatLngToPoint($latLng);
        return new google.maps.Point((worldPoint.x - bottomLeft.x) * $scale, (worldPoint.y - topRight.y) * $scale);
    }
    static point2LatLng=($map:google.maps.Map, $scale:number,  $projection:google.maps.Projection, $pnt:google.maps.Point)=>{
        var topRight = $projection.fromLatLngToPoint($map.getBounds()!.getNorthEast());
        var bottomLeft = $projection.fromLatLngToPoint($map.getBounds()!.getSouthWest());        
        var worldPoint = new google.maps.Point($pnt.x / $scale + bottomLeft.x, $pnt.y / $scale + topRight.y);
        return $projection.fromPointToLatLng(worldPoint);
    }

}