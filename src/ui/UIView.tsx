import React from 'react';
import './UIView.scss';
import UIScrollContainer from './UIScrollContainer';


export interface IUIViewProps {
    id:string;
    useScrollContainer?:boolean;
    extraClassName?:string;
    usePadding?:boolean;
}

export interface IUIViewState {
    
}

export default class UIView extends React.Component<IUIViewProps, IUIViewState> {
    
    
    scrollContainer:React.RefObject<UIScrollContainer> = React.createRef();

    constructor(props: IUIViewProps) {
        super(props);

        this.state = {

        }
    }
    getScrollContainer():UIScrollContainer | null{
        return this.scrollContainer.current;
    }

    render() {
        let strCN:string = "view "+this.props.id;
        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }
        if(this.props.usePadding){
            strCN+=" padding";
        }



        let jsx:JSX.Element = <></>;

        if(this.props.useScrollContainer){
            jsx = (
                <UIScrollContainer scrollbarListener ref={this.scrollContainer} extraClassName={strCN}>
                    {this.props.children}
                </UIScrollContainer>
            );
        }else{
            jsx = (
                <div className={strCN}>
                    {this.props.children}
                </div>
            );
        }
        return jsx;
    }
}
