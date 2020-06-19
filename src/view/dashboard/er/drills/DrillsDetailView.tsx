import * as React from 'react';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import UIView from '../../../../ui/UIView';
import UIDetailFrame from '../../../../ui/UIDetailFrame';
import DrillsView from './DrillsView';
import { parseDrillDetailPath, IDrillData } from '../../../../data/DrillData';

import Api, { IErrorType } from '../../../../api/Api';

import DrillsEditFields from './DrillsEditFields';

import { IGetIncidentResponse, getIncidentTypeById, IIncidentData, generateTimelineFromIncident, INCIDENT_STATUS_TYPE_CLOSED, INCIDENT_STATUS_TYPE_ACTIVE, INCIDENT_STATUS_TYPE_TRIGGERED, IIncidentTypeData } from '../../../../data/IncidentData';
import { IIncidentInfo, createIncidentInfo_Duration, createIncidentInfo_Status, createIncidentInfo_TriggeredBy, createIncidentInfo_ScheduledBy,createIncidentInfo_ClosedBy } from '../../../../ui/UIIncidentInfo';
import FormatUtil from '../../../../util/FormatUtil';

import { ITimelineItem } from '../../../../ui/UITimeline';

import deleteIcon from '@iconify/icons-mdi/delete';


import UICommentBox from '../../../../ui/UICommentBox';
import LoadingOverlay from '../../../../overlay/LoadingOverlay';
import AlertOverlay from '../../../../overlay/AlertOverlay';
import User from '../../../../data/User';
import UIButton, { UIDeleteButton } from '../../../../ui/UIButton';
import ConfirmOverlay from '../../../../overlay/ConfirmOverlay';
import { getOpsRole } from '../../../../data/OpsRole';
import UIErrorBox from '../../../../ui/UIErrorBox';
import UIIncidentTabSections from '../../../../ui/UIIncidentTabSections';
import UIIncidentFrame from '../../../../ui/UIIncidentFrame';


export interface IDrillsDetailViewProps extends RouteComponentProps{
    mode:string;
    drillId?:string;
}

export interface IDrillsDetailViewState {
    loading:boolean;
    error?:IErrorType;
    incidentData?:IGetIncidentResponse;
    calendarEntryData?:IDrillData;
    incidentTimelineData?:ITimelineItem[];
}

export default class DrillsDetailView extends React.Component<IDrillsDetailViewProps, IDrillsDetailViewState> {


    editFields:React.RefObject<DrillsEditFields> = React.createRef();

    _unmounting:boolean=false;

    _drillIncidentID:string="";
    _drillCalendarID:string="";
    _drillOrgID:string="";


    constructor(props: IDrillsDetailViewProps) {
        super(props);

        this._parseDrillID();

        let isLoading:boolean=true;
        if(this.props.mode===UIDetailFrame.MODE_NEW){
            isLoading=false;
        }


        this.state = {
            loading:isLoading
        }

        
    }
    componentDidMount(){

        if(this.props.mode!==UIDetailFrame.MODE_NEW){
            this._loadData();
        }
    }
    componentDidUpdate($prevProps:IDrillsDetailViewProps){
        if(this.props.drillId && this.props.drillId!==$prevProps.drillId){
            this._parseDrillID();
            this._loadData();
        }
    }
    componentWillUnmount(){
        this._unmounting=true;
    }

    _parseDrillID=()=>{
        if(this.props.drillId){
            let pathDetails = parseDrillDetailPath(this.props.drillId);
            this._drillCalendarID = pathDetails.calendarId;
            this._drillIncidentID = pathDetails.incidentId;
            this._drillOrgID = pathDetails.orgId;
        }
    }

    

    _loadData=()=>{

        this.setState({loading:true, error:undefined, incidentData:undefined, calendarEntryData:undefined},()=>{

            Api.calendarManager.getDrillDetails(this._drillOrgID, this._drillCalendarID, this._drillIncidentID,($success, $results)=>{
                if($success){

                    let getIncidentResponse:IGetIncidentResponse | undefined = undefined;

                    let incidentTimelineData:ITimelineItem[] = [];
                    if($results.incidentData){
                        getIncidentResponse = $results.incidentData as IGetIncidentResponse;
                        
                        incidentTimelineData = generateTimelineFromIncident(getIncidentResponse);
                    }

                    this.setState({loading:false, calendarEntryData:$results.calendarEntryData, incidentData:getIncidentResponse, incidentTimelineData:incidentTimelineData});
                }else{
                    this.setState({loading:false, error:$results});
                }
            });

        });
    }

    _onSaveEdit=()=>{
        this._save();
    }
    _onSaveNew=()=>{
        this._save();
    }
    _saving:boolean=false;
    _save=()=>{

        let isValid:boolean = false;
        if(this.editFields.current){
            isValid = this.editFields.current.validate();
            
        }

        if(isValid && !this._saving && this.editFields.current){
            this._saving=true;
            const loadingHide = LoadingOverlay.show("drillSave","Saving Drill...","Loading Please Wait");
            
            let {incidentTypeId, date, time} = this.editFields.current.state;
            
            let incidentType = getIncidentTypeById(incidentTypeId)!;

            if(date && time){
                let fullDate:Date = new Date();
                fullDate.setFullYear(date.getFullYear());
                fullDate.setMonth(date.getMonth());
                fullDate.setDate(date.getDate());

                let timeSplit = time.split(":");
                let hours = Number(timeSplit[0]);
                let minutes = Number(timeSplit[1]);


                fullDate.setHours(hours);
                fullDate.setMinutes(minutes);
                fullDate.setSeconds(0);
                fullDate.setMilliseconds(0);

                switch(this.props.mode){
                    case UIDetailFrame.MODE_NEW:

                        Api.calendarManager.addDrill(incidentTypeId,fullDate,($success,$results)=>{
                            loadingHide();
                            if(!this._unmounting){
        
                                if($success){
                                    //$results is a calendarId
                                    User.setSuccessAddedNewNotification("drills","Scheduled Drill",incidentType.incidentType);
                                    this.props.history.push(DrillsView.PATH);
        
                                }else{
                                    AlertOverlay.show("errorSaving","Error Saving");
            
                                }
                            }
                        });
                    break;
                    case UIDetailFrame.MODE_EDIT:

                        Api.calendarManager.editDrill(this.state.calendarEntryData!.calendarId!, incidentTypeId,fullDate,($success,$results)=>{
                            loadingHide();
                            if(!this._unmounting){
        
                                if($success){
                                    //$results is a calendarId
                                    User.setSuccessEditedNotification("drills","Scheduled Drill",incidentType.incidentType);
                                    this.props.history.push(DrillsView.PATH);
                                }else{
                                    AlertOverlay.show("errorSaving","Error Saving");
            
                                }
                            }
                        });
                    break;
                }
                
            }


        }
    }
    _onClickDelete=()=>{
        if(this.state.calendarEntryData){

            let incidentType = getIncidentTypeById(this.state.calendarEntryData.entryDetails.incidentTypeId);


            ConfirmOverlay.show("confirmCancelDrill",()=>{
                const hideLoading = LoadingOverlay.show("deleteDrill","Cancelling Drill...","Loading Please Wait");
                
                Api.calendarManager.deleteDrill(this.state.calendarEntryData!.orgId,this.state.calendarEntryData!.calendarId!,($success:boolean, $results:any)=>{
                    hideLoading();
                    
                    if(!this._unmounting){

                        if($success){
                            this.props.history.push(DrillsView.PATH);
                        }else{
                            AlertOverlay.show("errorDelete","Error Cancelling");
                        }
                    }
                });

            },"Are you sure you want to cancel this "+incidentType?.incidentType+" Drill?", "Confirm Cancel","Yes","No",deleteIcon);
    
        }

    }
    _onCloseIncident=()=>{

    }
    render() {

        let detailPath;
        let detailName;

        let jsxContent:JSX.Element = <></>;


        let canEdit:boolean = User.selectedOrg.rgDrills.canEdit && this._drillOrgID===User.selectedOrg.orgId;

        let jsxExtraHeaderOptions:JSX.Element = <></>;

        let canDelete:boolean = User.selectedOrg.rgDrills.canEdit && this._drillOrgID===User.selectedOrg.orgId;

        switch(this.props.mode){
            case UIDetailFrame.MODE_NEW:

                jsxContent = (
                    <>
                        <DrillsEditFields ref={this.editFields} mode={this.props.mode}/>
                    </>
                );
            break;
            case UIDetailFrame.MODE_VIEW:

                detailPath = "/"+this.props.drillId;
                detailName = "View Details";
                
                let jsxDetailContent:JSX.Element = <></>;



                if(!this.state.error && !this.state.loading){

                    let incidentInfo:IIncidentInfo[] = [];
                    let orgName:string = "";

                    let incidentType:IIncidentTypeData | undefined; 

                    if(this.state.incidentData){
                        canEdit=false;
                        canDelete=false;
                        incidentType = getIncidentTypeById(this.state.incidentData?.incident.incidentTypeId);

                        orgName = this.state.incidentData.incident.orgName;

                        let duration:number = (Date.now()/1000)-this.state.incidentData.incident.createDts;

                        let startDate:Date = new Date(Number(this.state.incidentData.incident.createDts)*1000);


                        incidentInfo.push(createIncidentInfo_Status(this.state.incidentData.incident.incidentStatus));
                        incidentInfo.push(createIncidentInfo_Duration(duration));

                        let triggeredStatus = this.state.incidentData.statusChanges.find(($status)=>{return $status.newIncidentStatusId===INCIDENT_STATUS_TYPE_TRIGGERED});
                        
                        if(triggeredStatus){

                            incidentInfo.push(createIncidentInfo_TriggeredBy(
                                triggeredStatus.createUserName,
                                startDate,
                                this.state.incidentData.incident.createOpsRole,
                                this.state.incidentData.incident.description
                            ));
                        }


                        let closedStatus = this.state.incidentData.statusChanges.find(($status)=>{return $status.newIncidentStatusId===INCIDENT_STATUS_TYPE_CLOSED});
                        

                        if(closedStatus){
                            let closedDate:Date = new Date(Number(closedStatus.createDts)*1000);


                            let strOpsRole:string = "";
                            if(closedStatus.opsRoleId){
                                let opsRole = getOpsRole(closedStatus.opsRoleId,User.state.opsRoles);
                                if(opsRole){
                                    strOpsRole = opsRole.opsRole;
                                }
                            }
                            let closeddesc:string = "";
                            if(closedStatus.description){
                                closeddesc = closedStatus.description;
                            }

                            //ops rolle
                            incidentInfo.push(createIncidentInfo_ClosedBy(closedStatus.createUserName,closedDate,strOpsRole,closeddesc))

                        }else{

                            //can only close if not already closed
                            jsxExtraHeaderOptions = (
                                <>
                                    <UIButton label="Close" onClick={this._onCloseIncident} size={UIButton.SIZE_SMALL}/>
                                </>
                            );

                        }
    
                        jsxDetailContent = (
                            <UIIncidentTabSections
                                orgId={this._drillOrgID}
                                incidentResponse={this.state.incidentData}
                                incidentTimelineData={this.state.incidentTimelineData}
                            />
                        )


                    }else if(this.state.calendarEntryData){

                        incidentType = getIncidentTypeById(this.state.calendarEntryData.entryDetails.incidentTypeId);
                        orgName = this.state.calendarEntryData.orgName;
                        
                        let calendarDate:Date = new Date(this.state.calendarEntryData.entryDts*1000);

                        incidentInfo.push(createIncidentInfo_Status("Not Started"));
                       
                        incidentInfo.push(createIncidentInfo_ScheduledBy(""+this.state.calendarEntryData.userName,calendarDate));

                    }


                    jsxContent = (
                        <UIIncidentFrame
                            orgName={orgName}
                            incidentInfo={incidentInfo}
                            incidentType={incidentType!}
                        >
                            {jsxDetailContent}
                        </UIIncidentFrame>
                    )

                }else{

                    if(this.state.error){
                        
                        jsxContent = (
                            <UIErrorBox error={this.state.error.desc}/>
                        )
                    }
                }

            break;
            case UIDetailFrame.MODE_EDIT:
                detailPath = "/"+this.props.drillId;
                detailName = "View Details";
                if(this.state.calendarEntryData){

                    let notAllowedToBeHere:boolean=false;

                    if(this._drillIncidentID){
                        notAllowedToBeHere=true;
                    }
                    let calendarDate = new Date(Number(this.state.calendarEntryData.entryDts)*1000);

                    if(this.state.calendarEntryData.started){
                        notAllowedToBeHere=true;
                    }else{

                        let now:Date = new Date();
                        let todayDate = new Date(now.getFullYear(),now.getMonth(),now.getDate());

                        if(calendarDate.valueOf()<=now.valueOf()){
                            notAllowedToBeHere=true;
                        }
                    }

                    //if we have a drillIncidentID here... we have somehow tried to edit the active incident... which isnt possible (maybe url hacking)... redirect.
                    jsxContent = (
                        <>
                            {notAllowedToBeHere && (
                                <Redirect to={DrillsView.PATH}/>
                            )}
                            <DrillsEditFields data={this.state.calendarEntryData} ref={this.editFields} mode={this.props.mode}/>
                            
                            <div className="footerOptions">
                                {canDelete && (
                                    <UIDeleteButton onClick={this._onClickDelete} label="Cancel Drill" />
                                )}
                            </div>
                        </>
                    );
                }
            break;
        }

        return (
            <UIView id={"drillDetail"} usePadding useScrollContainer>
                <UIDetailFrame
                    baseIcon={DrillsView.ICON}
                    basePath={DrillsView.PATH}
                    baseTitle={"Drills"}
                    loading={this.state.loading}
                    mode={this.props.mode}
                    contentIsWhiteBox
                    singularLabel="Scheduled Drill"
                    canEdit={canEdit}
                    detailName={detailName}
                    detailPath={detailPath}
                    onSaveEdit={this._onSaveEdit}
                    onSaveNew={this._onSaveNew}
                    extraHeaderOptions={jsxExtraHeaderOptions}
                > 
                    {jsxContent}                
                </UIDetailFrame>
            </UIView>
        );
    }
}
