import React from 'react';
import UIBreadcrumbNav from './UIBreadcrumbNav';
import './UIDetailFrame.scss';
import MasterDetailSwitch from '../util/MasterDetailSwitch';
import { UIEditButton, UICancelButton, UISaveButton, UIAddButton } from './UIButton';
import UILoadingBox from './UILoadingBox';
import { IErrorType } from '../api/Api';
import UIErrorBox from './UIErrorBox';
import UIStatusBanner from './UIStatusBanner';
import User, { IResultNotification } from '../data/User';
import UIAlertsBanner from './banner/UIAlertsBanner';

export interface IUIDetailFrameProps {
    mode:string;
    loading:boolean;
    error?:IErrorType;
    basePath:string;
    overrideRootBasePath?:string;
    baseIcon:object;
    baseTitle:string;
    detailPath?:string;
    cancelPath?:string;
    resultNotification?:IResultNotification;
    onClearResultNotification?:()=>void;
    savingError?:string;
    onClearSavingError?:()=>void;
    
    detailName?:string;/**this is the name ONCE loaded */
    parentDetailPath?:string;
    parentDetailName?:string;
    singularLabel?:string;
    contentIsWhiteBox?:boolean;
    extraClassName?:string;
    canNew?:boolean;
    canEdit?:boolean;
    isAbleToCreateChildren?:boolean;
    extraHeaderOptions?:JSX.Element;
    saveDisabled?:boolean;
    onSaveNew?:()=>void;
    onSaveEdit?:()=>void;

    /**Use to show the edit button without having a real detail path */
    forceShowEditBtn?:boolean;
}



export default class UIDetailFrame extends React.Component<IUIDetailFrameProps> {

    static MODE_VIEW:string = "view";
    static MODE_EDIT:string = "edit";
    static MODE_NEW:string = "new";


    render() {
        let strCN:string = "detailFrame mode_"+this.props.mode;

        if(this.props.extraClassName){
            strCN+=" "+this.props.extraClassName;
        }

        let headerOptions = <></>;


        let breadcrumbs:{label:string, to:string}[] = [];

        let strName:string = "";
        if(this.props.detailName){
            strName = this.props.detailName;
        }
        let strParentName:string = "";
        if(this.props.parentDetailName){
            strParentName = this.props.parentDetailName;
        }

        switch(this.props.mode){
            case UIDetailFrame.MODE_VIEW:


                if(this.props.loading){            
                    breadcrumbs.push({label:"Loading...", to:this.props.basePath});
                }else{
                    headerOptions = (
                        <>

                            {this.props.canNew && this.props.detailPath && this.props.isAbleToCreateChildren &&  (
                                <UIAddButton path={this.props.basePath+this.props.detailPath+MasterDetailSwitch.PATH_NEW} label={"Add New "+this.props.singularLabel} />
                            )}

                            {this.props.canEdit && (
                                <UIEditButton path={this.props.basePath+this.props.detailPath+MasterDetailSwitch.PATH_EDIT}/>
                            )}
                            {this.props.extraHeaderOptions}
                        </>
                    );

                    if(this.props.parentDetailPath){                        
                        breadcrumbs.push({label:strParentName, to:this.props.basePath+this.props.parentDetailPath});
                    }

                    if(this.props.detailPath){
                        breadcrumbs.push({label:strName, to:this.props.basePath+this.props.detailPath});
                    }
                }
            break;
            case UIDetailFrame.MODE_EDIT:


                if(this.props.loading){            
                    breadcrumbs.push({label:"Loading...", to:this.props.basePath});
                }else{

                    let cancelPath:string = this.props.basePath+this.props.detailPath;

                    if(this.props.cancelPath){
                        cancelPath = this.props.cancelPath;
                    }

                    headerOptions = (
                        <>
                            <UICancelButton purple path={cancelPath}/>
                            <UISaveButton disabled={this.props.saveDisabled} onClick={this.props.onSaveEdit!}/>
                            {this.props.extraHeaderOptions}
                        </>
                    );
                    
                    if(this.props.parentDetailPath){                        
                        breadcrumbs.push({label:strParentName, to:this.props.basePath+this.props.parentDetailPath});
                    }

                    let showEditBreadcrumb:boolean = false;

                    if(this.props.detailPath){
                        breadcrumbs.push({label:strName, to:this.props.basePath+this.props.detailPath});
                        showEditBreadcrumb=true;
                    }
                    if(this.props.forceShowEditBtn){
                        showEditBreadcrumb=true;
                    }
                    
                    if(showEditBreadcrumb){
                        breadcrumbs.push({label:"Edit", to:this.props.basePath+this.props.detailPath+MasterDetailSwitch.PATH_EDIT});
                    }
                    
                }
            break;
            case UIDetailFrame.MODE_NEW:   
            
                let cancelPath = this.props.basePath;
                if(this.props.cancelPath){
                    cancelPath = this.props.cancelPath;
                }

                headerOptions = (
                    <>
                        <UICancelButton purple path={cancelPath}/>
                        <UISaveButton disabled={this.props.saveDisabled} onClick={this.props.onSaveNew!}/>
                        {this.props.extraHeaderOptions}
                    </>
                );

                if(this.props.detailPath){                        
                    breadcrumbs.push({label:strName, to:this.props.basePath+this.props.detailPath});
                    breadcrumbs.push({label:"New "+this.props.singularLabel, to:this.props.basePath+this.props.detailPath+MasterDetailSwitch.PATH_NEW});  
                }else{
                    breadcrumbs.push({label:"New "+this.props.singularLabel, to:this.props.basePath+MasterDetailSwitch.PATH_NEW});  
                }           
            break;
        }


        let strDetailContentCN:string = "detailContent";

        if(this.props.contentIsWhiteBox){
            strDetailContentCN+=" whiteBox";
        }

        let breadcrumbBasePath:string = this.props.basePath;
        if(this.props.overrideRootBasePath){
            breadcrumbBasePath = this.props.overrideRootBasePath;
        }


        let resultNotificationText;

        if(this.props.resultNotification){
            resultNotificationText = (
                <>
                    {this.props.resultNotification.result}                    
                    {this.props.resultNotification.resultBold && (
                        <span>
                            {this.props.resultNotification.resultBold}
                        </span>
                    )}
                </>
            );
        }

        return (
            <>            
                <UIAlertsBanner/>
                
                <div className={strCN}>
                    <div className="detailHeader">
                        <UIBreadcrumbNav
                            basePath={breadcrumbBasePath}
                            title={this.props.baseTitle}
                            breadcrumbs={breadcrumbs}
                            titleIcon={this.props.baseIcon}
                        />
                        <div className="detailHeaderOptions">
                            {headerOptions}
                        </div>
                    </div>
                    {this.props.resultNotification &&  (
                        <UIStatusBanner text={resultNotificationText} type={this.props.resultNotification.type} onClose={this.props.onClearResultNotification!}/>
                    )}
                    {this.props.savingError && this.props.savingError!=="" &&  (
                        <UIStatusBanner text={this.props.savingError} type={UIStatusBanner.STATUS_ERROR} onClose={this.props.onClearSavingError!}/>
                    )}
                    <div className={strDetailContentCN}>
                        {this.props.loading && (
                            <UILoadingBox/>
                        )}            
                        {this.props.error && (
                            <UIErrorBox error={this.props.error.desc}/>
                        )}
                        {!this.props.loading && !this.props.error &&  (
                            <>
                                {this.props.children}
                            </>
                        )}
                    </div>
                </div>
            </>
        );
    }
}

