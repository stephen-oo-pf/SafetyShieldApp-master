import React from 'react';
import Slider from 'react-rangeslider';

import './UIMapImageOpacityControl.scss';

export interface UIMapImageOpacityControlProps {
    opacity:number;
    onOpacityChange:($value:number)=>void;
}

export default class UIMapImageOpacityControl extends React.Component<UIMapImageOpacityControlProps> {

    _onOpacityChange=($value:number)=>{
        this.props.onOpacityChange($value);
    }

    render() {
        return (
            <div className="opacityControl">
                <div className="opacityLabel">
                    <div className="opacityLabelTitle">Opacity</div>
                    <div className="opacityLabelValue">{this.props.opacity}%</div>
                </div>
                <Slider min={10} max={100} tooltip={false} value={this.props.opacity} orientation="vertical" onChange={this._onOpacityChange}/>
            </div>
        );
    }
}
