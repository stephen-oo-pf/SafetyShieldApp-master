import * as React from 'react';
import { PieLabelRenderProps, PieChart, Legend, Tooltip, Pie, Cell } from 'recharts';
import MathUtil from '../../../../util/MathUtil';

import UIGraphTooltip from '../../../../ui/UIGraphTooltip';
import './UIDrillCircleGraph.scss'
import { IDrillData, getStatusFromDrillData } from '../../../../data/DrillData';
import { IIncidentTypeData, getIncidentTypeById, IncidentType } from '../../../../data/IncidentData';
import UIDrillStatusIcon from './UIDrillStatusIcon';

export interface IUIDrillCircleGraphProps {
    data:IDrillData[];
}

interface IDrillCircleGraphData{
    incidentType:IIncidentTypeData;
    drills:IDrillData[];
    name:string;
    value:number;
}


export default class UIDrillCircleGraph extends React.Component<IUIDrillCircleGraphProps> {
    render() {


        let completeCount:number=0;
        //filter only completed drills into IDrillCircleGraphData 
        let data:IDrillCircleGraphData[] = this.props.data.filter(($drill)=>{
            return getStatusFromDrillData($drill)===UIDrillStatusIcon.STATUS_CODE_COMPLETED;
        }).reduce(($prev:IDrillCircleGraphData[], $drill)=>{
            completeCount++;

            let drillIncidentTypeId = $drill.entryDetails.incidentTypeId;

            let existingGroup = $prev.find(($group)=>{
                return $group.incidentType.incidentTypeId===drillIncidentTypeId;
            });

            if(existingGroup){
                existingGroup.value++;
                existingGroup.drills.push($drill);
            }else{
                let incidentType = getIncidentTypeById(drillIncidentTypeId);
                if(incidentType){
                    $prev.push({
                        incidentType:incidentType,
                        name:incidentType.incidentType,
                        drills:[$drill],
                        value:1,
                    })
                }
            }

            return $prev;
        },[]).sort(($graphDataA, $graphDataB)=>{

            if($graphDataA.value===$graphDataB.value){
                return 0;
            }else if($graphDataA.value>$graphDataB.value){
                return -1;
            }else{
                return 1;
            }
        });


        if(data.length>5){
            let theOthers = data.slice(4,data.length);
            data = data.slice(0,4);


            let otherIncidentType:IIncidentTypeData = {
                description:"",
                iconInfo:"",
                incidentType:"Other",
                incidentTypeId:"otherIncidentType",
                sequenceNumber:999,
                styleInfo:"",
                colorInfo:{
                    backgroundColor:"#F3F5F8",
                    textColor:"#3A4448"
                }
            }

            let otherGroup:IDrillCircleGraphData = {
                name:"Other",
                value:0,
                drills:[],
                incidentType:otherIncidentType
            }
            theOthers.forEach(($otherGroup)=>{
                $otherGroup.drills.forEach(($otherGroupDrill)=>{
                    otherGroup.drills.push($otherGroupDrill);
                    otherGroup.value++;
                })
            })

            data.push(otherGroup);


        }



        return (      
            <div className="drillCircleGraph d3Graph">
                <PieChart
                    width={430}
                    height={250}
                >
                    <Tooltip
                        content={<UIGraphTooltip/>}/>
                    <Pie
                        cx={300}
                        cy={"50%"}
                       // x={300}
                       // y={150}
                        

                        innerRadius={80}
                        outerRadius={116}
                        paddingAngle={0}
                        data={data}
                        dataKey={"value"}
                        labelLine={false}
                        label={($props:PieLabelRenderProps)=>{
                        
                            let innerRadius:number = Number($props.innerRadius as number);
                            let outerRadius:number = Number($props.outerRadius as number);
                            let cx:number = Number($props.cx as number);
                            let cy:number = Number($props.cy as number);
                            let midAngle:number = Number($props.midAngle as number);
                            let percent:number = Number($props.percent as number);
    
                            let radius:number = innerRadius + (outerRadius - innerRadius) * 0.5;
                            let x:number  = (cx + radius * Math.cos(-midAngle * MathUtil.RADIAN));
                            let y:number  = (cy + radius * Math.sin(-midAngle * MathUtil.RADIAN));
    
                            let textColor:string = "#FFFFFF";
                            if($props.incidentType && $props.incidentType.colorInfo){
                                if($props.incidentType.colorInfo.textColor){
                                    textColor = $props.incidentType.colorInfo.textColor;
                                }
                            }

                            return (
                                <text x={x} y={y}  fontSize="12px" pointerEvents="none" fontFamily="Roboto" fontWeight="600" fill={textColor} textAnchor="middle" dominantBaseline="central">
                                    
                                    {percent>0 && Math.round(percent*100)+"%"}
                                </text>
                            );
                        }}
                    >
                        {data.map(($cell,$index)=>{

                            let bgColor:string = "#FF0000";
                            if($cell.incidentType && $cell.incidentType.colorInfo){
                                if($cell.incidentType.colorInfo.backgroundColor){
                                    bgColor = $cell.incidentType.colorInfo.backgroundColor;
                                }
                            }

                            return (
                                <Cell key={$index+$cell.name} fill={bgColor}/>
                            )
                        })}
                        
                    </Pie>

                    <text x={302} y={112} fontSize="20px" pointerEvents="none" fontFamily="Roboto" fontWeight="600" fill={"#505D6F"} textAnchor="middle" dominantBaseline="central">
                        {completeCount}
                    </text>
                    <text x={302} y={138} fontSize="14px" pointerEvents="none" fontFamily="Roboto" fontWeight="400" fill={"#9AA1A9"} textAnchor="middle" dominantBaseline="central">
                        Total Drills
                    </text>
                    
                </PieChart>
                <div className="legend">
                    {data.map(($group,$index)=>{
                        return (
                            <div className="legendItem" key={$group.incidentType.incidentTypeId+$index}>
                                <div className="bullet" style={{backgroundColor:$group.incidentType.colorInfo.backgroundColor}}/>
                                <div className="name">
                                    {$group.name}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>  
        );
    }
}
