import React from 'react';
import "./UIProgressBar.scss";

export interface IUIProgressBarProps {
    percent:number;
    style?:string;
    extraClassName?:string;
}

export default class UIProgressBar extends React.PureComponent<IUIProgressBarProps> {
    static STYLE_DEFAULT:string = "defaultStyle";
    static STYLE_ROUNDED_BLUE_YELLOW:string = "roundedSmall blueYellow";
    static STYLE_ROUNDED_GREEN_TRANSPARENT:string = "roundedSmall greenTrans";

    render() {
        let numPer:number = Math.round((1-this.props.percent)*100);

        let style:string = UIProgressBar.STYLE_DEFAULT;
        if(this.props.style){
            style = this.props.style;
        }

        let strCN:string = "progressBar style_"+style;
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        return (
            <div className={strCN}>
                <div className="progressBarInside" style={{transform:"translate(-"+numPer+"%,0)"}}/>                
            </div>
        );
    }
}
