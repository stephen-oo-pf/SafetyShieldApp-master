import React from 'react';
import {SizeMe, SizeMeProps} from 'react-sizeme';
import UIScrollContainer from '../../../../ui/UIScrollContainer';
import UICenterBox from '../../../../ui/UICenterBox';
import { IErrorType } from '../../../../api/Api';
import UILoadingBox from '../../../../ui/UILoadingBox';
import UIWhiteBox from '../../../../ui/UIWhiteBox';
import './Widget.scss';

export interface IWidgetProps{
    id:string;
    label:string;
    useWhiteBoxForContent?:boolean;
    useScrollContainer?:boolean;    
    monitorSize?:boolean;
    loading?:boolean;
    error?:IErrorType;
    isFocused?:boolean;
}

export interface IWidgetWrapperProps{
}



export default class Widget extends React.Component<IWidgetProps> {
    render() {
        let strCN:string = "widget "+this.props.id;

        if(this.props.isFocused){
            strCN+=" isFocused";
        }

        const getContent = ()=>{
            return (
                <>
                    {this.props.loading && (
                        <UILoadingBox/>
                    )}
                    {!this.props.loading && (
                        <>
                            {!this.props.error && (
                                <>
                                    {this.props.children}
                                </>
                            )}
                            {this.props.error && (
                                <UICenterBox>
                                    {this.props.error.desc}
                                </UICenterBox>
                            )}
                        </>
                    )}
                </>
            );
        }

        const getWrapper = ($cn?:string)=>{
            let jsxContent:JSX.Element = <></>;
            if(this.props.useScrollContainer){
                jsxContent = (
                    <UIScrollContainer extraClassName={$cn}>
                        {getContent()}
                    </UIScrollContainer>
                )
            }else{
                jsxContent = (
                    getContent()
                )
            }

            //if white box, lets return early
            if(this.props.useWhiteBoxForContent){
                return (
                    <UIWhiteBox noPadding extraClassName="widgetContent">
                        {jsxContent}
                    </UIWhiteBox>
                );
            }else{
                return (
                    <div className="widgetContent">
                        {jsxContent}                
                    </div>
                );
            }
        }

        let jsx:JSX.Element = <></>;

        if(this.props.monitorSize){
            jsx = (
                <SizeMe monitorHeight={true}>
                    {($props:SizeMeProps)=>{
                        let numW:number = Number($props.size.width);
                        let numH:number = Number($props.size.height);
                        let numWD:number = Math.floor((numW/100));
                        let numHD:number = Math.floor((numH/100));
                        let size = "size_w"+numWD+" size_h"+numHD;
                        let resize:string = "";
                        /*
                        let resize:string = "full";
                        if(numW<=1180)resize = "resize1";                        
                        if(numW<=1024)resize = "resize2";                        
                        if(numW<=890)resize = "resize3";                        
                        if(numW<=840)resize = "resize4";                        
                        if(numW<=640)resize = "resizeMobile1";                        
                        if(numW<=480)resize = "resizeMobile2";                        
                        if(numW<=360)resize = "resizeMobile3";
                        */

                        return getWrapper(size+" "+resize);
                    }}
                </SizeMe>
            );
        }else{
            jsx = getWrapper();
        }

        return (
            <div className={strCN}>
                <div className="widgetLabel">{this.props.label}</div>
                {jsx}
            </div>
        )
    }
}

