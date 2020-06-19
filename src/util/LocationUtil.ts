import { ApiCallback } from "../api/Api";

export default class LocationUtil{


    static myLocation:Position | undefined = undefined;

    
    static getMyLocation=($complete?:ApiCallback)=>{

        if(window.navigator.geolocation){
            console.log("Getting location...");
            navigator.geolocation.getCurrentPosition(($position:Position)=>{
                LocationUtil.myLocation = $position;
                console.log("Got a location:", $position);
                if($complete){
                    $complete(true,$position);
                }
            },($error:PositionError)=>{
                console.log("Position Error", $error);
                if($complete){
                    $complete(false,$error);
                }
            },{
                enableHighAccuracy:true    
            });
            
        }else{
            if($complete){
                $complete(false,{error:"Not Supported"});
            }
        }
    }

}