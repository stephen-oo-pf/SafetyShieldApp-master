import React from 'react';
import ReactDOM from 'react-dom';
import './_reset.scss';
import './_animations.scss';
import './index.scss';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';
import 'react-virtualized/styles.css';
import 'react-rangeslider/lib/index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';
import { HashRouter, Route } from 'react-router-dom';
import BrowserUtil from './util/BrowserUtil';
import Api from './api/Api';
import UIButton from './ui/UIButton';
import User from './data/User';
import AppData from './data/AppData';
import TitleUtil from './util/TitleUtil';
import UILoadingBox from './ui/UILoadingBox';
import UILoginFrame from './ui/UILoginFrame';
import UIStatusBanner from './ui/UIStatusBanner';
import FormatUtil from './util/FormatUtil';
import UIReloadApp from './ui/UIReloadApp';


/*
Setup
*/
BrowserUtil.setup();
BrowserUtil.getURLParams();
BrowserUtil.setupConfirmToClose();
AppData.setSiteURL(BrowserUtil.cleanPath(window.location.href));
TitleUtil.setup();
const rootDiv = document.getElementById('root');


/*
Check URL Params
*/
if(BrowserUtil.objURLParams.action){

    let id:string = "";
    if(BrowserUtil.objURLParams.id){
        id = BrowserUtil.objURLParams.id;
    }
    switch(BrowserUtil.objURLParams.action){
        case "forgotpw":
            User.setForgotPWId(id);
        break;
        case "invite":
            User.setInvitationId(id);
        break;
    }
}



//show loading
ReactDOM.render((
    <UILoadingBox whiteIcon fullHeight/>
), rootDiv);



/*
Initial Load
*/
Api.getConfig(($success:boolean, $results:any)=>{
    if($success){
        Api.getInit(($initsuccess:boolean, $results:any)=>{
            if($initsuccess && $results?.summary?.success){
                if($results.summary?.successCode===504){
                    renderError("Oops, wrong version!","Your browser has a cached version and we have made updates! Try clearing your web history/cache and try again.");
                }else{
                    renderApp();  
                }            
            }else{
                renderError("Oops something went wrong.","Error Loading");
            }
        });
    }else{
        renderError("Oops something went wrong.","Error Loading");
    }
});

const renderApp=()=>{
    ReactDOM.render((
        <HashRouter>
            <Route path="/" component={App}/>
        </HashRouter>
    ), rootDiv);
}
const renderError=($title:string, $error:string)=>{
    ReactDOM.render((
        <UIReloadApp
            title={$title}
            statusTextError={$error}
        />        
    ), rootDiv);
}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
