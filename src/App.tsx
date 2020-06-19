import React from 'react';
import './App.scss';
import { Switch, Route, Redirect, RouteComponentProps } from 'react-router-dom';
import LoginView from './view/login/LoginView';
import AuthRoute from './AuthRoute';
import DashboardView from './view/dashboard/DashboardView';
import OverlayController from './overlay/OverlayController';
import InvitationView from './view/invitation/InvitationView';
import User from './data/User';
import UIMapLoadScript from './ui/map/UIMapLoadScript';
import VerifyView from './view/verify/VerifyView';
import ForgotView from './view/forgot/ForgotView';
import { listen, unlisten } from './dispatcher/Dispatcher';
import AppEvent from './event/AppEvent';

import AlertOverlay from './overlay/AlertOverlay';
import ConfirmOverlay from './overlay/ConfirmOverlay';
import LoadingOverlay from './overlay/LoadingOverlay';
import AlertListOverlay from './overlay/AlertListOverlay';
import IncidentOverlay from './overlay/IncidentOverlay';
import BroadcastOverlay from './overlay/BroadcastOverlay';
import FilterOverlay from './overlay/FilterOverlay';
import ChecklistCommentsOverlay from './overlay/ChecklistCommentsOverlay';
import ChecklistOverlay from './overlay/ChecklistOverlay';
import UIReloadApp from './ui/UIReloadApp';
import PromptOverlay from './overlay/PromptOverlay';
import RealTimeIncidentOverlay from './overlay/RealTimeIncidentOverlay';
import TriggerIncidentOverlay from './overlay/TriggerIncidentOverlay';
import IncidentTypeOverlay from './overlay/IncidentTypeOverlay';



interface IAppProps extends RouteComponentProps{

}

interface IAppState{
  googleError?:boolean;
}

export default class App extends React.Component<IAppProps,IAppState>{

  constructor($props:IAppProps){
    super($props);
    this.state = {

    }
  }

  componentDidMount(){
    listen(AppEvent.FORCE_LOGOUT, this._onForceLogout);


  }

  componentWillUnmount(){
    unlisten(AppEvent.FORCE_LOGOUT, this._onForceLogout);
  }
  

  _onForceLogout=($event:AppEvent)=>{
    User.setForcedLogout($event.details);
    this.props.history.push(LoginView.PATH);
  }
  _firstRouteChange:boolean=true;
  _routeChanged=($path:string)=>{

    //for the first route change
    if(this._firstRouteChange){
      this._firstRouteChange=false;
    }else{
      //every route change after
      User.setAppHasIntroed();
    }
  }
  _onMapsLoaded=()=>{
  }
  _onMapsError=($error:Error)=>{
    
    this.setState({googleError:true});
  }

  render(){


    //overlays
    let overlays:{id:string, overlay:any}[] = [
      {id:AlertListOverlay.ID, overlay:AlertListOverlay},
      {id:IncidentOverlay.ID, overlay:IncidentOverlay},
      {id:BroadcastOverlay.ID, overlay:BroadcastOverlay},
      {id:AlertOverlay.ID, overlay:AlertOverlay},
      {id:ConfirmOverlay.ID, overlay:ConfirmOverlay},
      {id:LoadingOverlay.ID, overlay:LoadingOverlay},
      {id:FilterOverlay.ID, overlay:FilterOverlay},
      {id:ChecklistOverlay.ID, overlay:ChecklistOverlay},
      {id:ChecklistCommentsOverlay.ID, overlay:ChecklistCommentsOverlay},
      {id:PromptOverlay.ID, overlay:PromptOverlay},
      {id:PromptOverlay.ID2, overlay:PromptOverlay},//this is necessary to prevent an animation bug when showing nested PromptOverlays
      {id:RealTimeIncidentOverlay.ID, overlay:RealTimeIncidentOverlay},
      {id:TriggerIncidentOverlay.ID, overlay:TriggerIncidentOverlay},
      {id:IncidentTypeOverlay.ID, overlay:IncidentTypeOverlay},
      
    ];


    return (
      <div className="app">   
      
      {this.state.googleError && (
          <UIReloadApp
            title={"Error Loading"}
            statusTextError={"Oops something went wrong"}
          />
        )} 
        <UIMapLoadScript onLoad={this._onMapsLoaded} onError={this._onMapsError}>
          <Switch>
            <Route exact path={LoginView.PATH} component={(props:RouteComponentProps)=>{
              this._routeChanged(LoginView.PATH);
              return <LoginView {...props}/>
            }}/>
            <Route exact path={InvitationView.PATH} component={(props:RouteComponentProps)=>{
              this._routeChanged(InvitationView.PATH);
              return <InvitationView {...props}/>
            }}/> 
            <Route exact path={VerifyView.PATH} component={(props:RouteComponentProps)=>{
              this._routeChanged(VerifyView.PATH);
              return <VerifyView {...props}/>
            }}/>
            <Route exact path={ForgotView.PATH} component={(props:RouteComponentProps)=>{
              this._routeChanged(ForgotView.PATH);
              return <ForgotView {...props}/>
            }}/>
            <AuthRoute path={DashboardView.PATH} component={DashboardView}/>
          </Switch>
        </UIMapLoadScript>
        {overlays.map(($overlay,$index)=>{
          return (
            <OverlayController key={"controller"+$overlay.id+$index} {...$overlay}/>
          )
        })}
        {User.state.invitationId && (
          <Redirect to={InvitationView.PATH}/>
        )}        
        {User.state.forgotPWId && (
          <Redirect to={ForgotView.PATH}/>
        )}
      </div>      
    )
  }
}

