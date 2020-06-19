import React from 'react';
import UIView from '../../../ui/UIView';
import UIMasterFrame from '../../../ui/UIMasterFrame';

import OrgsView from './OrgsView';
import Api, { IErrorType } from '../../../api/Api';
import User, { IResultNotification } from '../../../data/User';
import { Organization } from '../../../data/Organization';

import UIIcon from '../../../ui/UIIcon';


import './OrgsMasterView.scss';
import UIButton from '../../../ui/UIButton';


import UINoData from '../../../ui/UINoData';

import MasterDetailSwitch from '../../../util/MasterDetailSwitch';
import UILoadingBox from '../../../ui/UILoadingBox';
import UIErrorBox from '../../../ui/UIErrorBox';
import TimerUtil from '../../../util/TimerUtil';

import eyeIcon from '@iconify/icons-mdi/eye';
import plusIcon from '@iconify/icons-mdi/plus';
import pencilIcon from '@iconify/icons-mdi/pencil';
import chevronDown from '@iconify/icons-mdi/chevron-down';
import chevronUp from '@iconify/icons-mdi/chevron-up';

import subdirectoryArrowRight from '@iconify/icons-mdi/subdirectory-arrow-right';
import AppData from '../../../data/AppData';
import { RouteComponentProps } from 'react-router-dom';


export interface IOrgsMasterViewProps extends RouteComponentProps{

}
export interface IOrgsMasterViewState{
    filter:string;
    inputFilter:string;
    loading:boolean;
    error?:IErrorType;
    resultNotification?:IResultNotification;
}

export default class OrgsMasterView extends React.Component<IOrgsMasterViewProps, IOrgsMasterViewState> {
    static ID:string = "orgsMaster";


    _isUnmounting:boolean=false;

    constructor($props:IOrgsMasterViewProps){
        super($props);

        this.state = {
            loading:true,
            filter:"",
            inputFilter:""
        }
    }
    componentDidMount(){
        this._loadData(true);
    }
    componentWillUnmount(){
        this._isUnmounting=true;
    }
    _onFilterChange=($value:string)=>{

        TimerUtil.debounce("orgFilter",()=>{


            //for each org
            User.state.accounts.forEach(($org)=>{
                
                
                let strFilter:string = $value.toLowerCase();
                let orgMatchesFilter:boolean = false;
                let hasAChildMatchesFilter:boolean = false;

                if(strFilter!==""){

                    //split up words
                    let arrFilters:string[] = strFilter.split(" ");
                    
                    //remove blank entries
                    arrFilters = arrFilters.filter($value=>$value);

                    orgMatchesFilter = $org.detailsMatchFilters(arrFilters);

                    $org.children.forEach(($childOrg)=>{
                        let childOrgMatchesFilter:boolean = $childOrg.detailsMatchFilters(arrFilters);

                        if(childOrgMatchesFilter){
                            $childOrg.setIsAFilterMatchingChild(true);
                            hasAChildMatchesFilter=true;
                        }else{
                            $childOrg.setIsAFilterMatchingChild(false);
                        }
                    });

        
                }else{             
                    $org.children.forEach(($childOrg)=>{
                        $childOrg.setIsAFilterMatchingChild(false);
                    });
                }

                if(orgMatchesFilter){
                    $org.setIsFilterMatching(true);
                }else{
                    $org.setIsFilterMatching(false);
                }
                if(hasAChildMatchesFilter){
                    $org.setHasFilterMatchingChildren(true);
                }else{
                    $org.setHasFilterMatchingChildren(false);
                }

            });


            this.setState({filter:$value});

        },UIMasterFrame.FILTER_DEBOUNCE_SPEED_MS);
        
        this.setState({inputFilter:$value});

    }
    _loadData=($firstTime:boolean=false)=>{
        if(!this._isUnmounting){
            this.setState({
                loading:true,
                error:undefined
            },()=>{

                Api.access.validateToken(($success:boolean, $results:any)=>{
                    Api.orgManager.getOrgs(($success:boolean, $results:any)=>{
                        if(!this._isUnmounting){
    
                            if($success){
                                this.setState({loading:false});
    
                                User.checkResultNotification("orgs",($notif)=>{
                                    this.setState({resultNotification:$notif});
                                });

                                
                                


    
                            }else{ 
                                this.setState({error:$results, loading:false});
                            }
                        }
    
                    });
                });
                
            });
        }
    }
    

    _onClearResultNotification=()=>{
        this.setState({resultNotification:undefined});
    }
    render() {

        let arrTopLvl:Organization[] = User.state.accounts.filter(($org)=>{
            let isOK:boolean=true;
            let strFilter:string = this.state.filter.toLowerCase();

            if(strFilter!==""){

                isOK=false;
                
                let arrFilterWords:string[] = strFilter.split(" ");

                //remove possible blank strings
                arrFilterWords = arrFilterWords.filter($value=>$value);

                let orgMatchesFilters = $org.detailsMatchFilters(arrFilterWords);
                let anyChildMatchesFilter = false;

                $org.children.forEach(($orgChild)=>{
                    let childOrgMatchesFilters = $orgChild.detailsMatchFilters(arrFilterWords);
                    if(childOrgMatchesFilters){
                        anyChildMatchesFilter=true;
                    }
                });

                if(orgMatchesFilters || anyChildMatchesFilter){
                    isOK=true;
                }
            }

            //dont let master show up
            if($org.orgId===AppData.masterOrgID){
                isOK=false;
            }

            return isOK;
        });

        

        let canCreate = User.selectedOrg.rgOrgs.canAdd;
        let canEdit = User.selectedOrg.rgOrgs.canEdit;

        let addBtn;

        if(canCreate){
            addBtn = {label:"Add New "+User.selectedOrg.terminologyList.parent_org.singular, icon:plusIcon, path:OrgsView.PATH+MasterDetailSwitch.PATH_NEW};
        }

        return (
            <UIView id={OrgsMasterView.ID} usePadding useScrollContainer>
                       
                <UIMasterFrame
                    baseTitle={User.selectedOrg.terminologyList.parent_org.plural}
                    baseIcon={OrgsView.ICON}
                    onFilterChange={this._onFilterChange}
                    addBtn={addBtn}
                    basePath={OrgsView.PATH}
                    resultNotification={this.state.resultNotification}
                    onClearResultNotification={this._onClearResultNotification}
                    filter={this.state.inputFilter}
                >
                    {!this.state.loading && !this.state.error && arrTopLvl.map(($value,$index)=>{
                        return (
                            <OrgsListItem filter={this.state.filter} create={canCreate} edit={canEdit} index={$index} key={"account"+$value.orgId} data={$value}/>
                        )
                    })}
                    {this.state.loading && (
                        <UILoadingBox/>
                    )}
                    {this.state.error && (
                        <UIErrorBox error={this.state.error.desc}/>
                    )}
                    {!this.state.loading && !this.state.error && arrTopLvl.length===0 && (
                        <UINoData filter={this.state.filter}/>
                    )}
                </UIMasterFrame>
            </UIView>
        );
    }
}




interface IOrgsListItemProps {
    data:Organization;
    index:number;
    filter:string;
    create?:boolean;
    edit?:boolean;
}
interface IOrgsListItemState{

}

class OrgsListItem extends React.Component<IOrgsListItemProps,IOrgsListItemState> {
    constructor($props:IOrgsListItemProps){
        super($props);

    }
    _onToggleExpand=()=>{
        this.props.data.setAccountsExpanded(!this.props.data.accountsExpanded);
        this.forceUpdate();
    }
    _onViewDashboard=()=>{
        User.setSelectedOrganizationById(this.props.data.orgId);
    }
    _onItemViewDashboard=($subItem:Organization)=>{ 
        User.setSelectedOrganizationById($subItem.orgId);

    }
    render() {
        let strCN:string = "orgsListItem";

        let numH:number = 0;


        let orgChildCount:number=0;
        if(this.props.data.children){
            this.props.data.children.forEach(($value)=>{
                if(this.props.filter!==""){
                    if($value.isFilterMatchingChild){
                        orgChildCount++;
                    }
                }else{
                    orgChildCount++;
                }
            });
        }
        if(orgChildCount>0){
            strCN+=" hasChildren";
        }else{
            strCN+=" noChildren";

        }




        let expandedH:number = 46+(orgChildCount*50);

        let icon:object = chevronDown;
        if(this.props.data.accountsExpanded || (this.props.filter && this.props.data.hasFilterMatchingChildren)){
            strCN+=" expanded";
            numH = expandedH;
        }

        if(this.props.data.accountsExpanded){
            icon = chevronUp;
        }
        if(this.props.filter){
            strCN+=" filtered";
        }
        if(this.props.data.isFilterMatching){
            strCN+=" match";
        }

        /*
        <div className="logo">
                        <img src={this.props.data.logoIMGURL} alt={this.props.data.orgName}/>
                    </div>*/
        return (
            <div className={strCN} style={{zIndex:this.props.index}}>
                <div className="orgItem">
                    <div className="orgItemClick" onClick={this._onViewDashboard}/>
                    
                    <UIIcon icon={icon} onClick={this._onToggleExpand}/>
                    <div className="name">
                        {this.props.data.orgName}
                    </div>
                    <div className="orgCount">
                        {orgChildCount} {User.selectedOrg.terminologyList.child_org.plural}
                    </div>
                </div>
                <div className="orgItemContent" style={{maxHeight:numH+"px"}}>
                    <div className="orgItemContentOptions">
                        <UIButton 
                            color={UIButton.COLOR_TRANSPARENT_PURPLE} 
                            fontSize={UIButton.SIZE_SMALL} 
                            size={UIButton.SIZE_SMALL} 
                            label="VIEW" 
                            path={OrgsView.PATH+"/"+this.props.data.orgId} 
                            icon={eyeIcon} 
                            iconOnLeft={true}/>
                        {this.props.edit && (
                            <UIButton 
                                color={UIButton.COLOR_TRANSPARENT_PURPLE} 
                                fontSize={UIButton.SIZE_SMALL} 
                                size={UIButton.SIZE_SMALL} 
                                label="EDIT" 
                                path={OrgsView.PATH+"/"+this.props.data.orgId+MasterDetailSwitch.PATH_EDIT} 
                                icon={pencilIcon} 
                                iconOnLeft={true}/>
                        )}
                        {this.props.create && (
                            <UIButton 
                                color={UIButton.COLOR_TRANSPARENT_PURPLE} 
                                fontSize={UIButton.SIZE_SMALL} 
                                size={UIButton.SIZE_SMALL} 
                                label={"ADD NEW "+User.selectedOrg.terminologyList.child_org.singular} 
                                path={OrgsView.PATH+"/"+this.props.data.orgId+MasterDetailSwitch.PATH_NEW} 
                                icon={plusIcon} 
                                iconOnLeft={true}/>
                        )}
                    </div>
                    <div className="orgItemContentContainer">
                        {this.props.data.children?.map(($value)=>{

                            let canShow:boolean=false;
                            if(this.props.filter===""){
                                canShow=true;
                            }else{
                                if($value.isFilterMatchingChild){
                                    canShow=true;
                                }
                            }   
                            
                            if(!canShow){
                                return null;
                            }

                            return (
                                <OrgsListSubItem onClickViewDashboard={this._onItemViewDashboard} create={this.props.create} edit={this.props.edit} data={$value} key={"orgSubItem"+$value.orgId}/>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }
}


interface OrgsListSubItemProps{
    data:Organization;
    create?:boolean;
    edit?:boolean;
    onClickViewDashboard:($data:Organization)=>void;
    
}
class OrgsListSubItem extends React.Component<OrgsListSubItemProps>{
    _onClickViewDashboard=()=>{
        this.props.onClickViewDashboard(this.props.data);
    }
    render(){
        let strCN:string = "orgsListSubItem";

        if(this.props.data.isFilterMatchingChild){
            strCN+=" match";
        }
        /*
        
                <div className="logo">
                    <img src={this.props.data.logoIMGURL} alt={this.props.data.orgName}/>
                </div>
        */
        return (
            <div className={strCN} >
                
                <UIIcon extraClassName="sub" icon={subdirectoryArrowRight}/>
                <div className="name">
                    {this.props.data.orgName}
                </div>
                <div className="hitArea" onClick={this._onClickViewDashboard}/>
                <div className="btns">
                    <UIButton path={OrgsView.PATH+"/"+this.props.data.orgId} color={UIButton.COLOR_TRANSPARENT_PURPLE} fontSize={UIButton.SIZE_SMALL} size={UIButton.SIZE_SMALL} label="VIEW" icon={eyeIcon} iconOnLeft/>
                    {this.props.edit && (
                        <UIButton path={OrgsView.PATH+"/"+this.props.data.orgId+MasterDetailSwitch.PATH_EDIT} color={UIButton.COLOR_TRANSPARENT_PURPLE} fontSize={UIButton.SIZE_SMALL} size={UIButton.SIZE_SMALL} label="EDIT" icon={pencilIcon} iconOnLeft/>
                    )}
                </div>
            </div>
        )
    }
}