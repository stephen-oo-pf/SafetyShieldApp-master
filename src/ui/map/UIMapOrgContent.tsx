import * as React from 'react';
import User from '../../data/User';
import { Polygon } from '@react-google-maps/api';

export interface IUIMapOrgContentProps {
}

export default class UIMapOrgContent extends React.Component<IUIMapOrgContentProps> {
    render() {



        return (
            <>        
                {User.selectedOrg.orgPolygon.length>0 && (
                    <Polygon path={User.selectedOrg.orgPolygon} options={{strokeColor:"#582D82", fillOpacity:0.2, strokeWeight:1, fillColor:"#582D82"}} />
                )}
            </>
        );
    }
}
