import * as React from 'react';
import UIWhiteBox from './UIWhiteBox';
import { TooltipProps } from 'recharts';
import './UIGraphTooltip.scss';
export interface IUIGraphTooltipProps extends TooltipProps {
}

export interface IUIGraphTooltipState {
}

export default class UIGraphTooltip extends React.Component<IUIGraphTooltipProps, IUIGraphTooltipState> {
    constructor(props: IUIGraphTooltipProps) {
        super(props);

        this.state = {
        }
    }

    render() {
        
        let value:string = "";
        let name:string = "";
        if(this.props.payload && this.props.payload.length>0){
            let payloadChild = this.props.payload[0];
            value = payloadChild.value as string;
            name = payloadChild.name as string;

        }

        return (
            <UIWhiteBox>
                <div className="graphTooltipValue">{value}</div>
                <div className="graphTooltipName">{name}</div>
            </UIWhiteBox>
        );
    }
}
