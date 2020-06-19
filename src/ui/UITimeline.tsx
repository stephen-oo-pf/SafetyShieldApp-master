import * as React from 'react';
import FormatUtil from '../util/FormatUtil';
import './UITimeline.scss';

export interface ITimelineItem{
    date:Date;
    title:string | JSX.Element;
    value:string | JSX.Element;
}

export interface IUITimelineProps {
    data:ITimelineItem[];
}

export default class UITimeline extends React.Component<IUITimelineProps> {
     render() {
        let strCN:string = "timeline";
        return (
            <div className={strCN}>
                {this.props.data.map(($data:ITimelineItem, $index:number)=>{
                    return <UITimelineItem key={$index+$data.date.valueOf()} date={$data}/>
                })}
            </div>
        );
    }
}


export interface IUITimelineItemProps {
    date:ITimelineItem;
}

class UITimelineItem extends React.Component<IUITimelineItemProps> {
    render() {
        let strCN:string = "timelineItem";

        let strDate:string = FormatUtil.dateHMS(this.props.date.date,true,false,true);
        return (
            <div className={strCN}>
                <div className="date">{strDate}</div>
                <div className="info">
                    <div className="title">{this.props.date.title}</div>
                    <div className="value">{this.props.date.value}</div>
                </div>
            </div>
        );
    }
}
