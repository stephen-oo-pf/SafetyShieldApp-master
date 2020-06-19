import React from 'react';
import { Route, Redirect } from 'react-router';
import User from './data/User';

import LoginView from './view/login/LoginView';


const AuthRoute = ({ component, ...rest }:any) =>{
    return (
        <Route {...rest} render={(props)=>{ 

            let jsx:JSX.Element = <></>;
            if(User.state.isLoggedIn){
                jsx = React.createElement(component, props);
            }else{
                jsx = <Redirect to={LoginView.PATH} />
            }

            return jsx;
        }}/>
    );
}

export default AuthRoute;

