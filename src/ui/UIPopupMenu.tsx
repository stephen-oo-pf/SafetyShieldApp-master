import React from 'react';
import UIButton from './UIButton';
import dotsVertical from '@iconify/icons-mdi/dots-vertical';
import UITabBar, { UITabBarItem } from './UITabBar';
import './UIPopupMenu.scss';
import UIWhiteBox from './UIWhiteBox';

import closeIcon from '@iconify/icons-mdi/close';

export interface IUIPopupMenuProps {
    options:UITabBarItem[];
    onItemClicked?:($id:string)=>void;
}

export interface IUIPopupMenuState {
    showing:boolean;
}

export default class UIPopupMenu extends React.Component<IUIPopupMenuProps, IUIPopupMenuState> {
    
    
    private popupMenu:React.RefObject<HTMLDivElement> = React.createRef();
    
    _listening:boolean=false;

    constructor(props: IUIPopupMenuProps) {
        super(props);

        this.state = {
            showing:false
        }
    }

    componentDidUpdate($prevProps:IUIPopupMenuProps, $prevState:IUIPopupMenuState){
        if($prevState.showing!==this.state.showing){
            if(this.state.showing){
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
        if(this.popupMenu.current){
            let shouldClose:boolean=true;
            let target:any = $event.target;
            if(this.popupMenu.current.contains(target)){
                shouldClose=false;
            }
            if(shouldClose){
                this._closeMenu();
            }
        }
    }

    _onClickToggleMenu=()=>{
        if(this.state.showing){
            this._closeMenu();
        }else{
            this._showMenu();
        }
    }
    _closeMenu=()=>{
        this.setState({showing:false});
    }
    _showMenu=()=>{
        this.setState({showing:true});
    }
    render() {
        let strCN:string = "popupMenu";

        let icon = dotsVertical;
        if(this.state.showing){
            strCN+=" showing";
            icon = closeIcon;
        }
        return (
            <div className={strCN} ref={this.popupMenu}>                
                <UIButton isSquare onClick={this._onClickToggleMenu} size={UIButton.SIZE_SMALL} icon={icon} color={UIButton.COLOR_TRANSPARENT} />
                <UIWhiteBox noPadding>
                    <UITabBar
                        data={this.props.options}
                        onChange={this.props.onItemClicked}
                    />
                </UIWhiteBox>
            </div>
        );
    }
}
