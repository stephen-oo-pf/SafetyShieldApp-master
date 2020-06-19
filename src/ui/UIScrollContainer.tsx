import React from 'react';
import './UIScrollContainer.scss';
import UIScrollbarDetector from './UIScrollbarDetector';

interface UIScrollContainerProps{
    extraClassName?:string;
    style?:React.CSSProperties;
    scrollbarListener?:boolean;
}

export default class UIScrollContainer extends React.Component<UIScrollContainerProps>{

    container:React.RefObject<HTMLDivElement> = React.createRef();

    render(){
        let strCN:string = "scrollContainer";
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        let style:React.CSSProperties = {};
        if(this.props.style){
            style = {...this.props.style};
        }
        return (
            <div className={strCN} style={style} ref={this.container}>
                {this.props.scrollbarListener && (
                    <UIScrollbarDetector/>
                )}
                {this.props.children}
            </div>
        )
    }
}


