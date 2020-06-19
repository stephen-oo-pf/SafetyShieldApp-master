import React from 'react';
import Widget from './Widget';
import Api, { IErrorType } from '../../../../api/Api';
import UITabBar, { UITabBarItem } from '../../../../ui/UITabBar';
import { IECDataWidgetTab, IECDataUser } from '../../../../data/ECData';


import UIScrollContainer from '../../../../ui/UIScrollContainer';
import './ECWidget.scss';
import UINoData from '../../../../ui/UINoData';
import { ECCoreItem } from '../../er/ec/ECMasterView';


export interface IECWidgetProps {
}

export interface IECWidgetState {
    
    loading:boolean;
    error?:IErrorType;
    data?:IECDataUser[];
}

export default class ECWidget extends React.Component<IECWidgetProps, IECWidgetState> {

    static ID:string = "ecWidget";



    constructor(props: IECWidgetProps) {
        super(props);

        this.state = {
            loading:true,
        }
    }

    componentDidMount(){
        Api.settingsManager.getOrgEmergencyContactWidget(($success:boolean, $results:any)=>{
            if($success){
                let ecItems:IECDataWidgetTab[] = [];
                if($results.data){
                    ecItems = $results.data;
                }

                let flattenedUsers:IECDataUser[] = ecItems.reduce(($prev:IECDataUser[],$widgetTab)=>{

                    $widgetTab.users.forEach(($user)=>{
                        $prev.push($user);
                    });
                    return $prev;
                },[]);

                this.setState({loading:false, data:flattenedUsers});

            }else{
                this.setState({loading:false, error:$results});
            }
        });
    }

    render() {

        let isOk:boolean = (!this.state.loading && !this.state.error);
        
        
        let jsxContent = <></>;

        if(isOk && this.state.data){



            /*
            <div className="greyBubble">{selectedTab.label}</div>                                    
            */
            jsxContent= (
                <>
                    {this.state.data.map(($ecUser,$index)=>{
                        return (
                            <ECCoreItem key={"ecwidgetItem"+$ecUser.userId+""+$index} data={$ecUser}>
                                    
                            </ECCoreItem>
                        )
                    })}
                    {this.state.data.length===0 && (
                        <UINoData customMsg="No Emergency Contacts Available" />
                    )}
                </>
            );

        }

        return (
            <Widget id={ECWidget.ID} label="Emergency Contacts" loading={this.state.loading} error={this.state.error} monitorSize>
                <UIScrollContainer>
                    {jsxContent}
                </UIScrollContainer>
            </Widget>
        );
    }
}
