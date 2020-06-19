import * as React from 'react';
import './UIMapMyLocationControl.scss';
import UIIcon from '../UIIcon';

import crosshairsGps from '@iconify/icons-mdi/crosshairs-gps';

import LocationUtil from '../../util/LocationUtil';
import UILoadingIcon from '../UILoadingIcon';


export interface IUIMapMyLocationControlProps {
	map:google.maps.Map;
}

export interface IUIMapMyLocationControlState {
    loading:boolean;
}

export default class UIMapMyLocationControl extends React.Component<IUIMapMyLocationControlProps, IUIMapMyLocationControlState> {
    constructor(props: IUIMapMyLocationControlProps) {
        super(props);

        this.state = {
            loading:false
        }
    }
    _onClick=()=>{
        this.setState({loading:true},()=>{

            LocationUtil.getMyLocation(($success,$results)=>{
                if($success){
    
                    let position = $results as Position;
                    let pos:google.maps.LatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    
                    this.props.map.panTo(pos);
                }
                this.setState({loading:false});
            });
        });
    }

    render() {
        
        let strCN:string = "mapMyLocationControl mapControlShadow mapBtn";
        
        return (
            <div className={strCN} onClick={this._onClick}>
                {this.state.loading && (
                    <UILoadingIcon/>
                )}
                {!this.state.loading && (
                    <UIIcon icon={crosshairsGps}/>
                )}
            </div>
        );
    }
}
