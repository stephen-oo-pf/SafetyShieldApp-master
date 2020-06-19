import React from 'react';
import UICenterBox from './UICenterBox';
import UIStatusBanner from './UIStatusBanner';
import './UILoginFrame.scss';

export interface IUIBoxFrameProps {
    ssLogoLabel?:JSX.Element;
    title:string | JSX.Element;
    statusText:string;
    statusType:string;
    animateIntro?:boolean;
    onStatusClose:()=>void;
}

export default class UILoginFrame extends React.Component<IUIBoxFrameProps> {

    render() {

        let strCN:string = "boxFrame";

        return (
            <UICenterBox fireflyBG animateIntro={this.props.animateIntro} whiteBox bigBox extraClassName={strCN}>
                <div className="intradoLogo" style={{backgroundImage:"url('./static/media/images/logo-intrado.png')"}}/>
                <h1 className="safetyShieldLogo" style={{backgroundImage:"url('./static/media/images/logo-ss.png')"}}>
                    {this.props.ssLogoLabel && (
                        <>
                            {this.props.ssLogoLabel}
                        </>
                    )}
                    {!this.props.ssLogoLabel && (
                        <>
                            Safety Shield
                        </>
                    )}
                </h1>
                <div className="pageTitle">{this.props.title}</div>
                {this.props.statusText && this.props.statusText!=="" && (
                    <UIStatusBanner size={UIStatusBanner.SIZE_SMALL} type={this.props.statusType} text={this.props.statusText} onClose={this.props.onStatusClose} />
                )}
                {this.props.children}
            </UICenterBox>
        );
    }
}
