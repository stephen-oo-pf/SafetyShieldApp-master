import { ApiCallback, ApiData } from "./Api";
import User from "../data/User";

export default class ApiGoogleMapsManager{

    getLatLngFromAddress=($fullAddress:string, $complete:ApiCallback)=>{


        let geocoder:google.maps.Geocoder = new google.maps.Geocoder();
    

        let geoRequest:google.maps.GeocoderRequest = {
            address:$fullAddress,            
        }


        if(User.isDebug) console.log(">>>Google Maps Geocode Request: ",$fullAddress);   
        geocoder.geocode(geoRequest,($results:google.maps.GeocoderResult[],$status:google.maps.GeocoderStatus)=>{
            let success:boolean=false;
            if($results.length>0){
                let location = $results[0].geometry.location;

                let pointThatWePreviouslyForSomeFuckingReasonDidntNeedToExist:google.maps.LatLng = new google.maps.LatLng(location.lat(), location.lng());


                $complete(true,pointThatWePreviouslyForSomeFuckingReasonDidntNeedToExist);
                if(User.isDebug) console.log("<<< Google Maps Geocode Response: ",$results);     

            }else{
                $complete(false,ApiData.ERROR_LOADING);
                if(User.isDebug) console.log("<<< ERROR Google Maps Geocode");    
            }
        });

    }
}