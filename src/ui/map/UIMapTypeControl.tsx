import * as React from 'react';
import UIIcon from '../UIIcon';

import layersIcon from '@iconify/icons-mdi/layers';
import './UIMapTypeControl.scss';

export interface IUIMapTypeControlProps {
	map:google.maps.Map;
}

export interface IUIMapTypeControlState {
	expanded:boolean;
}

export default class UIMapTypeControl extends React.Component<IUIMapTypeControlProps, IUIMapTypeControlState> {
	
	container:React.RefObject<HTMLDivElement> = React.createRef();
	
	
	constructor(props: IUIMapTypeControlProps) {
		super(props);

		this.state = {
			expanded:false
		}
	}
	_mapTypes:{
		id:google.maps.MapTypeId;
		label:string;
	}[] = [
		{
			id:google.maps.MapTypeId.ROADMAP,
			label:"Road Map",
		},
		{
			id:google.maps.MapTypeId.HYBRID,
			label:"Hybrid",
		},
		{
			id:google.maps.MapTypeId.SATELLITE,
			label:"Satellite",
		},
	];
	_listening:boolean=false;
	componentDidUpdate($prevProps:IUIMapTypeControlProps,$prevState:IUIMapTypeControlState){
		if(this.state.expanded!==$prevState.expanded){

			if(this.state.expanded){
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
	open=()=>{
		this.setState({expanded:true});
	}
	close=()=>{

		this.setState({expanded:false});
	}

	_onDocClick=($event:MouseEvent)=>{
		if(this.container.current){
			let shouldClose:boolean=true;
			let target:any = $event.target;
			if(this.container.current.contains(target)){
				shouldClose=false;
			}
			if(shouldClose){
				this.close();
			}
		}
	}
	_onBtnClick=()=>{
		this.open();
	}
	_setMapType=($id:google.maps.MapTypeId)=>{
		
		this.props.map.setMapTypeId($id);
		this.close();
	}

	render() {
		let strCN:string = "mapTypeControl mapControlShadow";

		let strBtnCN:string = "mapTypeControlBtn mapBtn";
		let btnIcon = layersIcon;
		let controlStyle:React.CSSProperties = {

		}

		let itemH:number = 32;
		if(this.state.expanded){
			strCN+=" expanded";
			controlStyle.height = this._mapTypes.length*itemH+"px";
		}

		let mapTypeId = this.props.map.getMapTypeId();
		
		return (
			<div className={strCN} style={controlStyle} ref={this.container}>
    			<UIIcon extraClassName={strBtnCN} icon={btnIcon} onClick={this._onBtnClick}/>
				<div className="mapTypeControlItems">
					{this._mapTypes.map(($type, $index)=>{

						let strCN:string = "mapTypeControlItem";
						if(mapTypeId===$type.id){
							strCN+=" selected";
						}

						return (
							<div className={strCN} style={{height:itemH+"px"}} onClick={()=>{
								this._setMapType($type.id);

							}} key={"mapType"+$index+$type.id}>
								{$type.label}
							</div>
						)
					})}
				</div>
			</div>
		);
	}
}
