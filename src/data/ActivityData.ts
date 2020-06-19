export interface IActivityData{
    datetime:number;
    title:string;
    text:string;
    iconInfo:string;
    link:string | null;
    linkTitle:string | null;
    urgentFlag:boolean;
    isDrill:boolean;
}

export interface IActivityPerDayData{
    id:string;
    date:Date;
    datetime:number;
    isToday:boolean;
    items:IActivityData[];
}