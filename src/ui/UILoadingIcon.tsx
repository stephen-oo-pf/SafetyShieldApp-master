import React from 'react';
import loadingIcon from '@iconify/icons-mdi/loading';
import UIIcon from './UIIcon';
import './UILoadingIcon.scss';

export interface IUILoadingIconProps {
    extraClassName?:string;
    whiteIcon?:boolean;
}

export default class UILoadingIcon extends React.Component<IUILoadingIconProps> {
    render() {

        let strCN:string = "loadingIcon";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        if(this.props.whiteIcon){
            strCN+=" white";
        }

        return (
            <div className={strCN}>
                <UIIcon icon={loadingIcon}/>
            </div>
        );
    }
}
