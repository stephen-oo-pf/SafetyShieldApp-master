import React from 'react';
import { createPortal } from 'react-dom';


export interface UIMapCustomControlProps {
    position:number
    map:google.maps.Map;
}

export default class UIMapCustomControl extends React.Component<UIMapCustomControlProps> {


    controlDIV!:HTMLDivElement;
    divIndex:number;

    constructor(props: UIMapCustomControlProps) {
        super(props);

        this.controlDIV = document.createElement("div");

        this.divIndex = this.props.map.controls[this.props.position].getLength();
        this.props.map.controls[this.props.position].push(this.controlDIV);

    }
    componentWillUnmount(){
        if(this.props.map){

            let controlNode = this.props.map.controls[this.props.position];

            let index:number=-1;
            controlNode.forEach(($thing,$index)=>{
                if($thing===this.controlDIV){
                    index=$index;
                }
            });

            if(index!==-1){
                this.props.map.controls[this.props.position].removeAt(index);
            }
        }
    }


    render() {
        return createPortal(this.props.children, this.controlDIV);
    }
}
