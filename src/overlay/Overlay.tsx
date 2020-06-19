import React from 'react';
import './Overlay.scss';
import OverlayController, { OverlayData } from './OverlayController';
import UIWhiteBox from '../ui/UIWhiteBox';
import UIIcon from '../ui/UIIcon';
import UITitle from '../ui/UITitle';

import closeIcon from '@iconify/icons-mdi/close';
import UIScrollContainer from '../ui/UIScrollContainer';
import UIButton from '../ui/UIButton';
import UIIncidentTypeIcon from '../ui/UIIncidentTypeIcon';
import { getIncidentTypeById } from '../data/IncidentData';



export interface IOverlayProps {
    id:string;
    state?:string;
    zIndex?:number;
    onBGClick?:()=>void;
    headerTitle?:string | JSX.Element;
    headerIcon?:object;
    headerIncidentIconTypeId?:string;
    headerClose?:()=>void;
    footerContent?:JSX.Element;
    smallMaxWidth?:boolean;
    mediumMaxWidth?:boolean;
    mediumLargeMaxWidth?:boolean;
    biggerMaxWidth?:boolean;
    smallHeader?:boolean;
}

export interface BaseOverlayProps{
    
    data:OverlayData;
}

export default class Overlay extends React.Component<IOverlayProps> {
    static TRANS_SPEED:number = 0.3;


    _onBGClick=()=>{
        if(this.props.onBGClick){
            this.props.onBGClick();
        }
    }
    render() {

        let strCN:string = "overlay "+this.props.id;
        let numOpacity:number=0;
        
        if(this.props.state){
            strCN+=" "+this.props.state;
            switch(this.props.state){
                case OverlayController.STATE_SHOW:
                    numOpacity=1;
                break;
            }
        }
        
        let extraProps:any = {};
        if(this.props.zIndex){
            extraProps.zIndex = this.props.zIndex;
        }
        
        let hasHeader:boolean=false;
        if(this.props.headerClose || this.props.headerIcon || this.props.headerTitle){
            hasHeader=true;
        }
        let hasFooter:boolean=false;
        if(this.props.footerContent){
            hasFooter=true;
        }

        if(!hasHeader){
            strCN+=" noHeader";
        }
        if(this.props.smallMaxWidth){
            strCN+=" smallMaxWidth";
        }else{
            if(this.props.mediumMaxWidth){
                strCN+=" mediumMaxWidth";
            }else{
                if(this.props.mediumLargeMaxWidth){
                    strCN+=" mediumLargeMaxWidth";
                }else{
                    if(this.props.biggerMaxWidth){
                        strCN+=" biggerMaxWidth";
                    }
                }
            }
        }
        
        if(this.props.smallHeader){
            strCN+=" smallHeader";
        }

        let isHeaderTitleAString:boolean = typeof this.props.headerTitle==="string";

        let headerIncidentType;
        if(this.props.headerIncidentIconTypeId){
            headerIncidentType = getIncidentTypeById(this.props.headerIncidentIconTypeId);
        }

        return (
            <div className={strCN} style={{...extraProps}}>
                <div style={{opacity:numOpacity, transition:"all "+Overlay.TRANS_SPEED+"s"}} className="overlayBG" onClick={this._onBGClick}/>
                <UIWhiteBox animateIntro noPadding>
                    {hasHeader && (
                        <div className="overlayHeader">
                            {this.props.headerIcon && (
                                <UIIcon extraClassName="headerIcon" icon={this.props.headerIcon} />
                            )}
                            {this.props.headerIncidentIconTypeId && headerIncidentType && (
                                <UIIncidentTypeIcon type={headerIncidentType}/>
                            )}
                            {this.props.headerTitle && (
                                <>
                                    {isHeaderTitleAString && (
                                        <UITitle title={this.props.headerTitle}/>
                                    )}
                                    {!isHeaderTitleAString && (
                                        <>
                                            {this.props.headerTitle}
                                        </>
                                    )}
                                </>
                            )}
                            {this.props.headerClose && (
                                <UIButton extraClassName="headerClose" icon={closeIcon} color={UIButton.COLOR_TRANSPARENT} isSquare onClick={this.props.headerClose}/>
                            )}
                        </div>
                    )}
                    <UIScrollContainer extraClassName="overlayContent">
                        {this.props.children}
                    </UIScrollContainer>
                    {hasFooter && (
                        <div className="overlayFooter">
                            {this.props.footerContent}
                        </div>
                    )}
                </UIWhiteBox>
            </div>
        );
    }
}
