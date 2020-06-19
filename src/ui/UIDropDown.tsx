import React from 'react';
import UIIcon from './UIIcon';
import './UIDropDown.scss';
import UIScrollContainer from './UIScrollContainer';
import chevronDown from "@iconify/icons-mdi/chevron-down";
import chevronUp from "@iconify/icons-mdi/chevron-up";



export interface UIDropDownProps {
    extraClassName?:string;
    name:string;
    label:string | JSX.Element;
    data:UIDDItemData[];
    itemRenderer:any;
    onOpen?:()=>void;
    onClose?:()=>void;
    onItemSelected:($data:UIDDItemData, $name:string)=>void;
}

export interface UIDropDownState {
    isOpen:boolean;
}

export interface UIDDItemData{
    id:string;
    [key:string]:any;
}
export interface UIDDItemDataProps{
    data:UIDDItemData;
    index:number;
    name:string;
    onItemSelected:($data:UIDDItemData,$name:string)=>void;
}

export default class UIDropDown extends React.Component<UIDropDownProps, UIDropDownState> {

    private dropDown:React.RefObject<HTMLDivElement> = React.createRef();
    
    _listening:boolean=false;

    constructor(props: UIDropDownProps) {
        super(props);

        this.state = {
            isOpen:false
        }
    }

    componentDidMount(){

    }

    componentDidUpdate($prevProps:UIDropDownProps, $prevState:UIDropDownState){
        if($prevState.isOpen!==this.state.isOpen){
            if(this.state.isOpen){
                this._addListener();
            }else{
                this._removeListener();
            }
        }
    }


    componentWillUnmount(){
        this._removeListener();
    }

    _addListener=()=>{
        if(!this._listening){
            this._listening=true;
            document.addEventListener("click", this._onDocClick);
        }
    }
    _removeListener=()=>{
        if(this._listening){
            this._listening=false;
            document.removeEventListener("click", this._onDocClick);
        }
    }
    _onDocClick=($event:MouseEvent)=>{
        if(this.dropDown.current){
            let shouldClose:boolean=true;
            let target:any = $event.target;
            if(this.dropDown.current.contains(target)){
                shouldClose=false;
            }
            if(shouldClose){
                this.close();
            }
        }
    }
    _onToggle=()=>{
        if(this.state.isOpen){
            this.close();
        }else{
            this.open();
        }
    }
    open=()=>{
        this.setState({isOpen:true});
        if(this.props.onOpen){
            this.props.onOpen();
        }

    }
    close=()=>{
        this.setState({isOpen:false});
        if(this.props.onClose){
            this.props.onClose();
        }
        
    }
    _onItemSelected=($data:UIDDItemData)=>{
        this.close();
        this.props.onItemSelected($data,this.props.name);
    }

    render() {
        let strCN:string = "dropDown";

        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }


        let ddIcon:object = chevronDown;
        if(this.state.isOpen){
            strCN+=" open";
            ddIcon = chevronUp;
        }


        let ddBtnProps:any = {};
        if(this.props.data.length>1){
            strCN+=" canClick";
            ddBtnProps.onClick=this._onToggle;
        }


        return (
            <div className={strCN} ref={this.dropDown}>
                <div className="ddBtn" {...ddBtnProps}>
                    <div className="label">
                        {this.props.label}
                    </div>
                    {this.props.data.length>1 && (
                        <UIIcon extraClassName="ddIcon" icon={ddIcon}/>     
                    )}
                </div>
                <div className="container">
                    <UIScrollContainer extraClassName="containerInside">
                        {this.props.data.map(($value:UIDDItemData, $index:number)=>{

                            const item =  React.createElement(this.props.itemRenderer,{
                                key:"dditem_"+$index+$value.id,
                                data:$value,
                                index:$index,
                                name:this.props.name,
                                onItemSelected:this._onItemSelected
                            });

                            return item;
                        })}
                    </UIScrollContainer>
                </div>
            </div>
        );
    }
}
