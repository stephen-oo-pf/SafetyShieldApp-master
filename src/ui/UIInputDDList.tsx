import React from 'react';
import UIInput from './UIInput';
import UIButton from './UIButton';

import './UIInputDDList.scss';
import UIIcon from './UIIcon';
import {DragDropContext, Droppable, Draggable, DropResult} from 'react-beautiful-dnd';


import plusIcon from '@iconify/icons-mdi/plus';
import closeIcon from '@iconify/icons-mdi/close';

import arrowSplitHorizontal from '@iconify/icons-mdi/arrow-split-horizontal';


export interface IUIInputListItemData{
    value:string;
    id:string;
}

export interface IUIInputListDDProps {
    initItems:IUIInputListItemData[];
    itemPlaceholder:string;
    emptyPlaceholder:string;

}
export interface IUIInputListDDState{
    enteredValue:string;
    items:IUIInputListItemData[];
}


export default class UIInputDDList extends React.Component<IUIInputListDDProps,IUIInputListDDState> {

    constructor($props:IUIInputListDDProps){
        super($props);

        let items:IUIInputListItemData[] = [];
        if(this.props.initItems){
            items = this.props.initItems;
        }

        this.state = {
            enteredValue:"",
            items:items
        }
    }
    _reorder=(list:any[], startIndex:number, endIndex:number)=>{
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);  
        return result;

    }

    _onInputChange=($value:string)=>{
        this.setState({enteredValue:$value});
    }
    _addItem=()=>{

        let value:string = this.state.enteredValue;
        if(value!==""){

            let newItem:IUIInputListItemData = {
                value:value,
                id:Math.random()*10000+""+Date.now()
            }

            let items = [...this.state.items, newItem];

            this.setState({enteredValue:"", items:items});
        }
    }
    _onAddItem=()=>{
        this._addItem();
    }
    _onDragEnd=(result:DropResult)=>{
        if(!result.destination){
            return;
        }

        const items = this._reorder(this.state.items,result.source.index,result.destination.index);
        this.setState({items:items});
    }
    _onItemChange=($value:string, $id:string, $index:number)=>{

        let item:IUIInputListItemData = {
            value:$value, 
            id:$id
        }
        let items = [...this.state.items];
        items.splice($index,1,item);
        this.setState({items:items});
    }
    _onItemDelete=($index:number)=>{

        let items = [...this.state.items];
        items.splice($index,1);        
        this.setState({items:items});
    }
    _onFormValueEnter=($event:React.FormEvent<HTMLFormElement>)=>{
        $event.preventDefault();
        
        this._addItem();

    }
    render() {
        let strCN:string = "inputListDD";
        return (
            <div className={strCN}>
                <div className="inputListDDHeader">
                    <form onSubmit={this._onFormValueEnter}>
                        <UIInput title="Enter step description" name="enteredValue" value={this.state.enteredValue} onChange={this._onInputChange} />
                    </form>
                    <UIButton size={UIButton.SIZE_SMALL} isSquare icon={plusIcon} onClick={this._onAddItem}/>
                </div>
                <div className="inputListDDContainer">
                    <DragDropContext onDragEnd={this._onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided,snapshot)=>{

                                let dropAreaCN:string = "inputListContainerDropArea";
                                if(snapshot.isDraggingOver){
                                    dropAreaCN+=" isDraggingOver";
                                }
                                return (
                                    <div
                                        className={dropAreaCN}
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {this.state.items.map(($value,$index)=>{
                                            return (
                                                <UIInputListDDItem
                                                    onItemChange={this._onItemChange}
                                                    onItemDelete={this._onItemDelete}
                                                    key={"listDDItem"+$value.id}
                                                    id={$value.id}
                                                    value={$value.value}
                                                    index={$index}
                                                    itemPlaceholder={this.props.itemPlaceholder}
                                                />
                                            )
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )  
                            }}
                        </Droppable>
                    </DragDropContext>                    
                    {this.state.items.length===0 && (
                        <div className="inputListEmpty">
                            {this.props.emptyPlaceholder}                            
                        </div>
                    )}
                </div>
            </div>
        );
    }
}


interface IUIInputListDDItemProps{
    onItemChange:($value:string, $id:string, $index:number)=>void;
    onItemDelete:($index:number)=>void;
    value:string;
    id:string;
    index:number;
    itemPlaceholder:string;
}

interface IUIInputListDDItemState{
    height:number | string;
}
class UIInputListDDItem extends React.Component<IUIInputListDDItemProps,IUIInputListDDItemState>{


    textarea:React.RefObject<HTMLTextAreaElement> = React.createRef();

    constructor($props:IUIInputListDDItemProps){
        super($props);

        this.state = {
            height:22,
        }
    }
    componentDidMount(){ 
        this._updateSize();
    }

    _updateSize=()=>{

        if(this.textarea.current){
            this.setState({height:22},()=>{
                if(this.textarea.current){

                    let computed = window.getComputedStyle(this.textarea.current);

                    // Calculate the height
                    let height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                    + parseInt(computed.getPropertyValue('padding-top'), 10)
                    + this.textarea.current.scrollHeight
                    + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                    + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
                    
        
        
                    this.setState({height:height});
                }
            });
        }
    }



    _onChange=($value:string)=>{
        this.props.onItemChange($value,this.props.id, this.props.index);
    }
    _onTextChange=($event:React.ChangeEvent<HTMLTextAreaElement>)=>{
        this.props.onItemChange($event.target.value,this.props.id, this.props.index);

        this._updateSize();
        
    }
    _onDelete=()=>{
        this.props.onItemDelete(this.props.index);
    }

    render(){
        return (
            <Draggable draggableId={""+this.props.id} index={this.props.index}>
                {(provided,snapshot)=>{

                    let strCN:string = "inputListItem";
                    if(snapshot.isDragging){
                        strCN+=" isDragging";
                    }

                    return (
                        <div
                            className={strCN}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                                ...provided.draggableProps.style
                            }}
                        >

                            <span className="index">{(this.props.index+1)}</span>
                            <UIIcon extraClassName="drag" icon={arrowSplitHorizontal}/>
                            <textarea style={{height:this.state.height}} ref={this.textarea} className="textInput" onChange={this._onTextChange} value={this.props.value}></textarea>
                            <UIIcon extraClassName="delete" icon={closeIcon} onClick={this._onDelete}/>
                        </div>
                    )
                }}
            </Draggable>
        )
    }
}