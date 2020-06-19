import React from 'react';
import './UIWhiteBox.scss';
export interface IUIWhiteBoxProps {
    extraClassName?:string;
    noPadding?:boolean;
    animateIntro?:boolean;
    animateDuration?:number;
    extraStyle?:any;
}

export default class UIWhiteBox extends React.Component<IUIWhiteBoxProps> {

    container:React.RefObject<HTMLDivElement> = React.createRef();
    
    render() {
        let strCN:string = "whiteBox";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        if(this.props.noPadding){
            strCN+=" noPadding";
        }
        
        if(this.props.animateIntro){
            strCN+=" animateIntro";
        }

        let duration = 0.5;
        if(this.props.animateDuration){
            duration = this.props.animateDuration;
        }

        let extraStyle:any = {};
        if(this.props.extraStyle){
            extraStyle = this.props.extraStyle;
        }
        return (
            <div ref={this.container} className={strCN} style={{animationDuration:duration+"s", ...extraStyle}}>
                {this.props.children}
            </div>
        );
    }
}
