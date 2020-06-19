import React from 'react';
import UIStatusBanner from './UIStatusBanner';
import './UIEditFields.scss';

export interface IUIEditFieldsProps {
    extraClassName?:string;
    
    statusInfo?:string;
    onStatusInfoClose?:()=>void;
    validationError?:string;
    onValidationErrorClose?:()=>void;
}

export default class UIEditFields extends React.Component<IUIEditFieldsProps> {

    render() {
        let strCN:string = "editFields fieldArea";

        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        return (
            <div className={strCN}>
                {this.props.validationError && this.props.validationError!=="" && this.props.onValidationErrorClose &&  (
                    <UIStatusBanner onClose={this.props.onValidationErrorClose} type={UIStatusBanner.STATUS_ERROR} text={this.props.validationError}/>
                )}
                {this.props.statusInfo && this.props.statusInfo!=="" && this.props.onStatusInfoClose &&  (
                    <UIStatusBanner onClose={this.props.onStatusInfoClose} type={UIStatusBanner.STATUS_INFO} text={this.props.statusInfo}/>
                )}


                {this.props.children}
            </div>
        );
    }
}
