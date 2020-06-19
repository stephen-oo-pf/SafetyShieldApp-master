import BaseEvent from "./BaseEvent";

export default class DashboardEvent extends BaseEvent{
    
    static DASHBOARD_EXPAND_TOGGLED:string = "dashboard_expand_toggled";
    static DASHBOARD_EXPAND_TOGGLED_COMPLETE:string = "dashboard_expand_toggled_complete";
    
}