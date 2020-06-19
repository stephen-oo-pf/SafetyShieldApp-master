import React from 'react';
import {LoadScriptNext } from '@react-google-maps/api';
import UILoadingBox from '../UILoadingBox';


interface IUIMapLoadScriptProps{
  onLoad:()=>void;
  onError:($error:Error)=>void;
}

export default class UIMapLoadScript extends React.Component<IUIMapLoadScriptProps>{

    _libraries:string[] = [
      "geometry"
    ];

    render(){  
      return (
        <LoadScriptNext
          id="map-script-loader"
          libraries={this._libraries}
          googleMapsApiKey="AIzaSyACq2-EYqPqdmaxq3EJf9KuKVQ6NnjM4w0"
          preventGoogleFontsLoading={true}
          loadingElement={<></>}

          onLoad={this.props.onLoad}
          onError={this.props.onError}
          children={<>{this.props.children}</>}
        />
      )
    }
  }
  