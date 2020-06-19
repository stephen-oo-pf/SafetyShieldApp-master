import React from 'react';
import { WindowScroller, AutoSizer, Table, Index, TableRowRenderer, SortDirectionType, TableHeaderProps, SortIndicator } from 'react-virtualized';
import './UIWindowTable.scss';
import { listen, unlisten } from '../dispatcher/Dispatcher';
import AppEvent from '../event/AppEvent';

export interface IUIWindowTableProps {
    data:any[];
    rowRenderer:TableRowRenderer;
    headerH:number;
    rowH:number;
    scrollElement:HTMLDivElement;
    initSortBy:string;
    sort:($sortBy:string, $direction:SortDirectionType, $a:any, $b:any)=>number;
    initSortByDirection?:SortDirectionType;
}

export interface IUIWindowTableState {
    
    sortBy:string;
    sortDirection:SortDirectionType;
}

export default class UIWindowTable extends React.Component<IUIWindowTableProps, IUIWindowTableState> {
    
    static SORT_DIR_ASC:SortDirectionType = "ASC";
    static SORT_DIR_DESC:SortDirectionType = "DESC";

    static BASIC_SORT = ($direction:string, $stringA:string | number, $stringB:string | number)=>{

        let a:string = String($stringA).toLowerCase();
        let b:string = String($stringB).toLowerCase();

        if(a===b){
            return 0;
        }else{
            if(a > b){
                return $direction===UIWindowTable.SORT_DIR_ASC?1:-1;
            }else{
                return $direction===UIWindowTable.SORT_DIR_ASC?-1:1;
            }
        }

    }

    windowScroller:React.RefObject<WindowScroller> = React.createRef();


    constructor(props: IUIWindowTableProps) {
        super(props);

        let sortBy:string = this.props.initSortBy;

        let sortDirection:SortDirectionType = UIWindowTable.SORT_DIR_ASC;
        if(this.props.initSortByDirection){
            sortDirection = this.props.initSortByDirection;
        }
        this.state = {
            sortBy:sortBy,
            sortDirection:sortDirection
        }
    }


    _onSort=($info:{sortBy:string, sortDirection:SortDirectionType})=>{
        this.setState({sortBy:$info.sortBy, sortDirection:$info.sortDirection});
    }

    componentDidMount(){
        listen(AppEvent.ABOVE_HEIGHT_CHANGE, this._onAboveHeightChanged);
        
    }

    componentWillUnmount(){
        unlisten(AppEvent.ABOVE_HEIGHT_CHANGE, this._onAboveHeightChanged);
    }

    _onAboveHeightChanged=($event:AppEvent)=>{
        if(this.windowScroller.current){
            this.windowScroller.current.updatePosition(this.props.scrollElement);
        }
    }
    render() {

        let data:any[] = this.props.data;

        data.sort(($a:any,$b:any)=>{
            let sortResult = this.props.sort(this.state.sortBy,this.state.sortDirection,$a,$b);
            return sortResult;
        });


        return (
            <WindowScroller
                ref={this.windowScroller}
                scrollElement={this.props.scrollElement}
                key={""+this.props.scrollElement}
            >
                {({height,isScrolling,registerChild,onChildScroll,scrollTop})=>{

                    let numHeight:number=0;
                    if(height){
                        numHeight = height;
                    }

                    return (
                        <div className="windowScrollerContainer">
                            <AutoSizer disableHeight>
                                {({width})=>{
                                    return (
                                        <div ref={registerChild} className="windowScrollerContainerChild">
                                            <Table
                                                autoHeight
                                                headerHeight={this.props.headerH}
                                                
                                                height={numHeight}
                                                isScrolling={isScrolling}
                                                rowCount={data.length}
                                                rowHeight={this.props.rowH}
                                                rowGetter={($info:Index)=>{
                                                    return data[$info.index];
                                                }}
                                                rowRenderer={this.props.rowRenderer}
                                                scrollTop={scrollTop}
                                                sort={this._onSort}
                                                sortBy={this.state.sortBy}
                                                sortDirection={this.state.sortDirection}
                                                width={width}
                                                rowClassName={($info:Index)=>{
                                                    let strCN:string = "tableRow"
                                                    if($info.index%2===0){
                                                        strCN+=" tableRowEven";
                                                    }else{
                                                        strCN+=" tableRowOdd";
                                                    }
                                                    return strCN;
                                                }}
                                            >
                                                {this.props.children}
                                            </Table>
                                        </div>
                                    );
                                }}
                            </AutoSizer>
                        </div>
                    );
                }}
            </WindowScroller>
        );
    }
}


/*
This class exists soley because the virtualized table doesn't want to show its sorting arrow by default even though it IS sorted.
*/

export function UIWindowTableHeaderRenderer({sortBy, sortDirection, label, dataKey}:TableHeaderProps){
    return (
        <>
            <span className="ReactVirtualized__Table__headerTruncatedText">{label}</span>
            {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
        </>
    )
}




/*

                    headerRenderer={({dataKey, sortBy, sortDirection, label})=>{
                        return (
                            <>
                              <span className="ReactVirtualized__Table__headerTruncatedText">{label}</span>
                              {sortBy === dataKey && <SortIndicator sortDirection={sortDirection} />}
                            </>
                          );
                    }}
*/