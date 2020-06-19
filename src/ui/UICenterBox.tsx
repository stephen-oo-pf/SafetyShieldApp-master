import React from 'react';
import './UICenterBox.scss';
export interface IUICenterBoxProps {
    extraClassName?:string;
    containerExtraClassName?:string;    
    whiteBox?:boolean;
    bigBox?:boolean;
    header?:string;
    animateIntro?:boolean;
    fireflyBG?:boolean;
    onBGClick?:()=>void;
}

export default class UICenterBox extends React.Component<IUICenterBoxProps> {
    render() {

        let strCN:string = "centerBox";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        if(this.props.animateIntro){
            strCN+=" animateIntro";
        }

        let strContainerCN:string = "centerBoxContainer";
        if(this.props.containerExtraClassName){
            strContainerCN+=" "+this.props.containerExtraClassName;
        }
        if(this.props.whiteBox){
            strContainerCN+=" whiteBox boxShadow";
            
            if(this.props.bigBox){
                strContainerCN+=" bigBox";
            }
        }



        return (
            <div className={strCN}>

                {this.props.fireflyBG && (
                    <>
                        <div className="bg" style={{backgroundImage:"url('./static/media/images/intrado-firefly-white-clipped-desktop2.svg')"}}/>
                        <div className="bgLogo" style={{backgroundImage:"url('./static/media/images/logo-intrado-white-solid.png')"}}/>
                    </>
                )}
                {this.props.onBGClick && (
                    <div className="centerBoxBGClick" onClick={this.props.onBGClick}/>
                )}
                <div className={strContainerCN}>
                    {this.props.header && this.props.header!=="" && (
                        <div className="centerBoxHeader">{this.props.header}</div>
                    )}
                    
                    {this.props.children}
                </div>
            </div>
        );
    }
}
