import * as React from 'react';
import './UITable.scss';

export interface ITableColumn{
    width:number;
    flexGrow?:number;
    dataKey:string;
    name:string;
    dataGetter?:($data:any)=>any;
}

export interface IUITableProps {
    columns:ITableColumn[];
    data:any[];
    rowRenderer:ITableRowRenderer;
    headerH:number;
    rowH:number;
}


export type ITableRowRenderer  = ($data:any, $columns:JSX.Element, $className:string, $key:string)=>JSX.Element;

export default class UITable extends React.Component<IUITableProps> {

    _generateRowColumns=($data:any)=>{
        return (
            <>
                {this.props.columns.map(($column,$columnIndex)=>{
                    let data = $data[$column.dataKey];
                    return (
                        <UITableRowColumn key={$column.dataKey+"tableRowColumn"+$columnIndex} data={data} rowData={$data} dataColumn={$column}/>
                    );
                })}
            </>
        )
    }

    render() {
        let strCN:string = "table";
        return (
            <div className={strCN}>
                <div className="tableHeader" style={{height:this.props.headerH+"px"}}>
                    {this.props.columns.map(($column,$index)=>{
                        return (
                            <UITableColumn styles={{height:this.props.headerH+"px"}} key={$index+$column.dataKey} data={$column}/>
                        )
                    })}
                </div>
                <div className="tableContent">
                    {this.props.data.map(($data:any, $index)=>{
                        return this.props.rowRenderer($data, this._generateRowColumns($data), "tableRow", "tableRow"+$index);
                    })}
                </div>
            </div>
        );
    }
}

interface IUITableColumnProps {
    data:ITableColumn;
    styles:React.CSSProperties;
}

class UITableColumn extends React.Component<IUITableColumnProps> {
    render() {
        let strCN:string = "tableColumn dataKey_"+this.props.data.dataKey;
        return (
            <div className={strCN} style={{width:this.props.data.width+"px", flexGrow:this.props.data.flexGrow, ...this.props.styles}}>
                {this.props.data.name}
            </div>
        );
    }
}



interface IUITableRowColumnProps {
    data:any;
    rowData:any;
    dataColumn:ITableColumn;
}

class UITableRowColumn extends React.Component<IUITableRowColumnProps> {
    render() {
        let strCN:string = "tableRowColumn dataKey_"+this.props.dataColumn.dataKey;


        let rowValue = this.props.data;
        if(this.props.dataColumn.dataGetter){
            rowValue = this.props.dataColumn.dataGetter(this.props.rowData);
        }
        return (
            <div className={strCN} style={{width:this.props.dataColumn.width+"px", flexGrow:this.props.dataColumn.flexGrow}}>
                {rowValue}
            </div>
        );
    }
}
