import * as React from 'react';
import fileDocument from '@iconify/icons-mdi/file-document';
import { Switch, Route, NavLink, Redirect } from 'react-router-dom';



import FloorPlansView from './FloorPlansView';
import User from '../../../data/User';
import ERPsView from './ERPsView';
import UIDetailFrame from '../../../ui/UIDetailFrame';
import UIView from '../../../ui/UIView';

export interface IDocumentsViewProps {
}

export interface IDocumentsViewState {
}

export default class DocumentsView extends React.Component<IDocumentsViewProps, IDocumentsViewState> {

    static ID:string = "documents";
    static ICON:object = fileDocument;
    static PATH:string = "/documents";

    constructor(props: IDocumentsViewProps) {
        super(props);

        this.state = {
        }
    }

    render() {

        let defaultPath = "";
        if(User.selectedOrg.rgERPs.canView){
            defaultPath = ERPsView.PATH;
        }else if(User.selectedOrg.rgFloorPlans.canView){
            defaultPath = FloorPlansView.PATH;
        }
        return (
            <Switch>
                {User.selectedOrg.rgFloorPlans.canView && (
                    <Route path={FloorPlansView.PATH} component={FloorPlansView}/>  
                )}
                {User.selectedOrg.rgERPs.canView && (
                    <Route path={ERPsView.PATH} component={ERPsView}/>   
                )}
                <Redirect to={defaultPath}/>
            </Switch>
        );

        /*

            This is the beginnings of a page that acts as a "landing page" for documents that would contain links to the different types.
            This was our idea at first and it got shot down... but I bet its going to come back as soon as they realize what they really asked for.

                <Route component={()=>{
                    return (
                        <UIView id={DocumentsView.ID} usePadding useScrollContainer>
                            <UIDetailFrame
                                baseIcon={DocumentsView.ICON}
                                baseTitle="Documents"
                                basePath={DocumentsView.PATH}
                                canEdit={false}
                                canNew={false}
                                loading={false}
                                mode={UIDetailFrame.MODE_VIEW}
                                singularLabel="Document"
                            >
                                <NavLink to={ERPsView.PATH}>
                                    Emergency Response Plans
                                </NavLink>
                                <NavLink to={FloorPlansView.PATH}>
                                    Floor Plans
                                </NavLink>
                            </UIDetailFrame>
                        </UIView>
                    )
                }}/>
        */
    }
}
