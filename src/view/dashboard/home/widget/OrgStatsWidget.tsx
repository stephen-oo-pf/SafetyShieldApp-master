import React from 'react';
import Widget from './Widget';
import Api, { IErrorType } from '../../../../api/Api';
import User from '../../../../data/User';
import './OrgStatsWidget.scss';
import { Organization } from '../../../../data/Organization';

export interface IOrgStatsWidgetProps {

}

export interface IOrgStatsWidgetState {
    loading:boolean;
    error?:IErrorType;
}

export default class OrgStatsWidget extends React.Component<IOrgStatsWidgetProps, IOrgStatsWidgetState> {

    static ID:string = "orgStats";

    constructor(props: IOrgStatsWidgetState) {
        super(props);

        this.state = {
            loading:true
        }
    }
    componentDidMount(){
        Api.orgManager.getOrgs(($success:boolean,$results:any)=>{
            if($success){
                this.setState({loading:false});
            }else{
                this.setState({loading:false, error:$results});
            }
        });
    }

    render() {

        let numAccounts:number = 0;
        let numOrganizations:number = 0;

        if(!this.state.loading && !this.state.error){
            

            numAccounts = User.state.accounts.filter(($value:Organization)=>{
                return !$value.isMasterAdmin;
            }).length;

            numOrganizations = User.state.organizations.filter(($value:Organization)=>{
                let isOk:boolean=true;
                if($value.isMasterAdmin){
                    isOk=false;
                }
                if($value.isAccount){
                    isOk=false;
                }
                return isOk;
            }).length; 
        }
        

        let title:string = User.selectedOrg.terminologyList.parent_org.singular+" Statistics";
        

        

        return (
            <Widget loading={this.state.loading} error={this.state.error} id={OrgStatsWidget.ID} label={title} monitorSize useScrollContainer>
                <div className="orgStatContainer">
                    <OrgStatsWidgetItem title={(<><span className="purple">#</span> OF {User.selectedOrg.terminologyList.parent_org.plural.toUpperCase()}</>)} value={""+numAccounts}/>
                    <OrgStatsWidgetItem title={(<><span className="purple">#</span> OF {User.selectedOrg.terminologyList.child_org.plural.toUpperCase()}</>)} value={""+numOrganizations}/>
                </div>
            </Widget>
        );
    }
}


interface OrgStatsWidgetItemProps {
    title:JSX.Element | string;
    value:JSX.Element | string;
}

class OrgStatsWidgetItem extends React.Component<OrgStatsWidgetItemProps> {
    render() {
        let strCN:string = "orgStatsItem";

        return (
            <div className={strCN}>
                <div className="value">{this.props.value}</div>
                <div className="title">{this.props.title}</div>
            </div>
        );
    }
}




