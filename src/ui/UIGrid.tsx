import React from 'react';
import './UIGrid.scss';

import UIIcon from './UIIcon';
import UIToggle from './UIToggle';
import UIScrollContainer from './UIScrollContainer';

import GridLayout, { WidthProvider } from 'react-grid-layout';
import NextFrame from '../util/NextFrame';
import TimerUtil from '../util/TimerUtil';

import eyeIcon from '@iconify/icons-mdi/eye';
import eyeOff from '@iconify/icons-mdi/eye-off';


export interface UIGridProps {

    cols:number;
    data:GridItem[];
    rowHeight:number;
}

export interface UIGridState {
    
    unmount:boolean;
    cols:number;
}


export interface GridItem{
    id:string;
    title:string | JSX.Element;
    component:any;
    layout:{
        x:number, 
        y:number, 
        w:number, 
        h:number, 
        minW:number,
        minH:number,
        maxW?:number, 
        maxH?:number,
    }
    isVisible:boolean;
}


const ResponsiveGridLayout = WidthProvider(GridLayout);


export default class UIGrid extends React.Component<UIGridProps, UIGridState> {


    _colsMobile:number = 2;

    
    private grid:React.RefObject<any> = React.createRef();
    private gridContainer:React.RefObject<HTMLDivElement> = React.createRef();

    constructor(props: UIGridProps) {
        super(props);

        this.state = {
            cols:this.props.cols,
            unmount:false
        }
    }

    componentDidMount(){
        window.addEventListener("resize", this._onWindowResize);
        this.checkSize();   
    }
    componentWillUnmount(){
        window.removeEventListener("resize", this._onWindowResize);
    }
    _onWindowResize=()=>{
        TimerUtil.debounce("gridResize",()=>{
            this.checkSize();
        });
    }
    refresh=()=>{
        if(this.grid.current){
            this.grid.current.onWindowResize();
            this.checkSize();
        }
    }
    checkSize=()=>{
        if(this.gridContainer.current){

            let w:number = this.gridContainer.current.clientWidth;
            if(w<700){
                if(this.state.cols!==this._colsMobile){
                    this.changeColumns(this._colsMobile);
                }
            }else{
                if(this.state.cols!==this.props.cols){
                    this.changeColumns(this.props.cols);
                }
            }

        }
    }
    changeColumns=($value:number)=>{
        
        this.setState({unmount:true},()=>{
            NextFrame(()=>{
                this.setState({cols:$value, unmount:false});
            });
        });
    }
    

    render() {

        if(this.state.unmount){
            return null;
        }
        let data:GridItem[] = this.props.data.filter(($value)=>{
            return $value.isVisible;
        });

        
        let strCN:string = "grid";
        
        return (
            <div className={strCN} ref={this.gridContainer}>
                <ResponsiveGridLayout
                    ref={this.grid}
                    cols={this.state.cols}          
                    useCSSTransforms={true}
                    measureBeforeMount={false}
                    containerPadding={[0,0]}
                    margin={[30,36]}             
                       
                    compactType="vertical"      
                    draggableHandle=".gridItemTitle"
                    draggableCancel=".gridItemContent"   
                    rowHeight={this.props.rowHeight}
                    >
                        {data.map(($value, $index)=>{

                            const widget =  React.createElement($value.component,{
                                key:"widget_"+$value.id,
                                index:$index, 
                                gridItem:$value,
                            });

                            let layout:any = {...$value.layout};
                            if(this.state.cols===2){
                                layout.w = 2;
                                layout.x = 0;
                                layout.minW = 2;
                                layout.y = $index*2;
                            }

                            return (
                                <div className={"gridItem wrapper_widget_"+$value.id} key={$value.id} data-grid={layout}>
                                    <div className="gridItemTitle">
                                        {$value.title}
                                    </div>
                                    <div className="gridItemContent">
                                        {widget}
                                    </div>
                                </div>
                            );
                        })}                       
                </ResponsiveGridLayout>
            </div>
        );
    }
}

interface UIGridItemProps{
    data:GridItem;
}

export class UIGridItem extends React.Component<UIGridItemProps>{

    render(){

        return (
            <div 
                key={this.props.data.id}
                data-grid={this.props.data.layout}>
                hello
            </div>
        )
    }
}

export interface IUIGridSettingsProps {
    data:GridItem[];
    onSettingsChanged:($items:GridItem[])=>void;
}
export interface IUIGridSettingsState {
    

}

export class UIGridSettings extends React.Component<IUIGridSettingsProps,IUIGridSettingsState> {
    constructor($props:IUIGridSettingsProps,$state:IUIGridSettingsState){
        super($props,$state);
        this.state = {
            
        }
    }
    _onItemChange=($item:GridItem, $index:number)=>{

        let items:GridItem[] = [...this.props.data];
        items.splice($index,1,$item);
        this.props.onSettingsChanged(items);
    }

    render() {
        let strCN:string = "gridSettings";

        let isSomethingVisible:boolean = this.props.data.filter($value=> $value.isVisible).length>0?true:false;



        return (
            <div className={strCN}>   
                <UIScrollContainer>      
                    {!isSomethingVisible && (
                        <div style={{padding:5+"px"}}>Well what good does that do?</div>
                    )}                                  
                    {this.props.data.map(($value,$index)=>{
                        return (
                            <UIGridSettingsItem onItemChange={this._onItemChange} index={$index} data={$value} key={"gridSettingsItem"+$index+"_"+$value.id}/>
                        );
                    })}
                </UIScrollContainer>   
            </div>
        );
    }
}


interface UIGridSettingsItemProps{
    data:GridItem;
    index:number;
    onItemChange:($item:GridItem, $index:number)=>void;
}

class UIGridSettingsItem extends React.Component<UIGridSettingsItemProps>{

    _onToggle=($value:boolean)=>{

        let item:GridItem = {...this.props.data};
        item.isVisible = $value;
        this.props.onItemChange(item, this.props.index);
    }

    render(){
        let strCN:string = "gridSettingsItem";

        let icon:object = eyeIcon;
        if(!this.props.data.isVisible){
            icon = eyeOff;
        }

        return(
            <div className={strCN}>
                <div className="label">{this.props.data.title}</div>
                <div className="rightSide">
                    <UIIcon icon={icon}/>
                    <UIToggle 
                        size={UIToggle.SIZE_SMALL}
                        enabled={this.props.data.isVisible}
                        onClick={this._onToggle}
                    />
                </div>
            </div>
        );
    }
}


