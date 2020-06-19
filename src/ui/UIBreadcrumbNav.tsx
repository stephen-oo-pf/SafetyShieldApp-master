import React from 'react';
import { NavLink } from 'react-router-dom';
import './UIBreadcrumbNav.scss';
import UIIcon from './UIIcon';

import chevronRight from '@iconify/icons-mdi/chevron-right';
export interface UIBreadcrumbNavProps {
    basePath:string;
    title:string;
    titleIcon:object;
    breadcrumbs?:{label:string, to:string}[];
}

export interface UIBreadcrumbNavState {
}

export default class UIBreadcrumbNav extends React.Component<UIBreadcrumbNavProps, UIBreadcrumbNavState> {
    constructor(props: UIBreadcrumbNavProps) {
        super(props);

        this.state = {

        }
    }


    renderSpacer = ():JSX.Element=>{
        return (
            <span className="spacer">
                <UIIcon icon={chevronRight}/>
            </span>
        );
    }
    render() {


        let strCNLink:string = "";
        if(this.props.title===""){
            strCNLink+=" soloIcon";
        }
        return (
            <h2 className="breadcrumbNav">
                <NavLink to={this.props.basePath} className={strCNLink}>
                    <UIIcon icon={this.props.titleIcon} size={30}/>
                    {this.props.title}
                </NavLink>
                {this.props.breadcrumbs && this.props.breadcrumbs.map(($value,$index)=>{
                    return (
                        <React.Fragment key={"breadcrumb"+$index+"-"+$value.to}>
                            {this.renderSpacer()}
                            <NavLink to={$value.to}>
                                {$value.label}
                            </NavLink>
                        </React.Fragment>
                    )
                })}
            </h2>   
        );
    }
}

