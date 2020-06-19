import BaseEvent from "./BaseEvent";

export default class AppEvent extends BaseEvent{
    
    static FORCE_LOGOUT:string = "forceLogout";
    static ALERTS_UPDATE:string = "alertsUpdate";

    static VALIDATED_TOKEN:string = "validatedToken";

    static CHECKING_ALERTS_TICK:string = "checkingAlerts";
    static RESUME_CHECKING_ALERTS:string = "resumeCheckingAlerts";

    static VIEW_INCIDENT:string = "viewIncident";
    static VIEW_MAP_INCIDENT:string = "viewMapIncident";
    static VIEW_REAL_TIME_INCIDENT:string = "viewRealTimeIncident";
    

    static START_DRILL:string = "startDrill";


    

    static BROADCAST_SUCCESS:string = "broadcastSuccess";

    static ABOVE_HEIGHT_CHANGE:string = "aboveHeightChange";
    static PAGE_SIZE_CHANGE:string = "pageSizeChange";
    
}
