import * as React from 'react';
import {PieChart, Pie, Cell, Tooltip, Legend} from 'recharts';
import { ICircleGraphCellData } from '../data/GraphData';

export interface IUICircleGraphProps {
    width:number;
    height:number;
    outerRadius:number;
    innerRadius?:number;
    paddingAngle?:number;
    data?:ICircleGraphCellData[];
    label:any;
}

export interface IUICircleGraphState {
}

export default class UICircleGraph extends React.Component<IUICircleGraphProps, IUICircleGraphState> {
    constructor(props: IUICircleGraphProps) {
        super(props);

        this.state = {
        }
    }

    render() {

        let innerRadius:number=0;
        if(this.props.innerRadius){
            innerRadius = this.props.innerRadius;
        }

        let paddingAngle:number=0;
        if(this.props.paddingAngle){
            paddingAngle=this.props.paddingAngle;
        }

        let data:ICircleGraphCellData[] = [];
        if(this.props.data){
            data = this.props.data;
        }

        return (
            <PieChart
                width={this.props.width}
                height={this.props.height}
            >
                <Legend
                    align="left"
                    verticalAlign="middle"
                />
                <Tooltip />
                <Pie
                    cx="50%"
                    cy="50%"
                    innerRadius={innerRadius}
                    outerRadius={this.props.outerRadius}
                    paddingAngle={paddingAngle}
                    data={data}
                    dataKey={"value"}
                    labelLine={false}
                    label={this.props.label}
                >
                    {data.map(($cell)=>{
                        return (
                            <Cell fill={$cell.color}/>
                        )
                    })}
                </Pie>
            </PieChart>
        );
    }
}
