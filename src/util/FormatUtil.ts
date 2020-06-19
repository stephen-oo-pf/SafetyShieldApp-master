export default class FormatUtil{

    static MONTHS:{abbr:string, full:string, days:number}[] = [
        {abbr:"Jan", full:"January", days:31},
        {abbr:"Feb", full:"February", days:28},
        {abbr:"Mar", full:"March", days:31},
        {abbr:"Apr", full:"April", days:30},
        {abbr:"May", full:"May", days:31},
        {abbr:"Jun", full:"June", days:30},
        {abbr:"Jul", full:"July", days:31},
        {abbr:"Aug", full:"August", days:31},
        {abbr:"Sep", full:"September", days:30},
        {abbr:"Oct", full:"October", days:31},
        {abbr:"Nov", full:"November", days:30},
        {abbr:"Dec", full:"December", days:31}
    ];
    
    static DOTW:{abbr:string, full:string}[] = [
        {abbr:"Sun", full:"Sunday"},    
        {abbr:"Mon", full:"Monday"},
        {abbr:"Tue", full:"Tuesday"},
        {abbr:"Wed", full:"Wednesday"},
        {abbr:"Thu", full:"Thursday"},
        {abbr:"Fri", full:"Friday"},
        {abbr:"Sat", full:"Saturday"},
    ];

    static COUNTRIES_AS_UI_OPTIONS:{label:string, value:string}[] = [
        {label: "Select",value: ""},
        {label: "United States",value: "US"},
        {label: "Canada",value: "CA"},
    ];



    
    static STATES_CA_AS_UI_OPTIONS:{label:string, value:string}[] = [
        {label: "Select",value: ""},
        {value:"AB", label:"Alberta"},
        {value:"BC", label:"British Columbia"},
        {value:"MB", label:"Manitoba"},
        {value:"NB", label:"New Brunswick"},
        {value:"NL", label:"Newfoundland and Labrador"},
        {value:"NT", label:"Northwest Territories"},
        {value:"NS", label:"Nova Scotia"},
        {value:"NU", label:"Nunavut"},
        {value:"ON", label:"Ontario"},
        {value:"PE", label:"Prince Edward Island"},
        {value:"QC", label:"Quebec"},
        {value:"SK", label:"Saskatchewan"},
        {value:"YT", label:"Yukon Territory"}
    ]

    static STATES_US_AS_UI_OPTIONS:{label:string, value:string}[] = [
        {label: "Select",value: ""},
        {label: "Alabama",value: "AL"},
        {label: "Alaska",value: "AK"},
        {label: "Arizona",value: "AZ"},
        {label: "Arkansas",value: "AR"},
        {label: "California",value: "CA"},
        {label: "Colorado",value: "CO"},
        {label: "Connecticut",value: "CT"},
        {label: "District of Columbia",value: "DC"},
        {label: "Delaware",value: "DE"},
        {label: "Florida",value: "FL"},
        {label: "Georgia",value: "GA"},
        {label: "Hawaii",value: "HI"},
        {label: "Idaho",value: "ID"},
        {label: "Illinois",value: "IL"},
        {label: "Indiana",value: "IN"},
        {label: "Iowa",value: "IA"},
        {label: "Kansas",value: "KS"},
        {label: "Kentucky",value: "KY"},
        {label: "Louisiana",value: "LA"},
        {label: "Maine",value: "ME"},
        {label: "Maryland",value: "MD"},
        {label: "Massachusetts",value: "MA"},
        {label: "Michigan",value: "MI"},
        {label: "Minnesota",value: "MN"},
        {label: "Mississippi",value: "MS"},
        {label: "Missouri",value: "MO"},
        {label: "Montana",value: "MT"},
        {label: "Nebraska",value: "NE"},
        {label: "Nevada",value: "NV"},
        {label: "New Hampshire",value: "NH"},
        {label: "New Jersey",value: "NJ"},
        {label: "New Mexico",value: "NM"},
        {label: "New York",value: "NY"},
        {label: "North Carolina",value: "NC"},
        {label: "North Dakota",value: "ND"},
        {label: "Ohio",value: "OH"},
        {label: "Oklahoma",value: "OK"},
        {label: "Oregon",value: "OR"},
        {label: "Pennsylvania",value: "PA"},
        {label: "Rhode Island",value: "RI"},
        {label: "South Carolina",value: "SC"},
        {label: "South Dakota",value: "SD"},
        {label: "Tennessee",value: "TN"},
        {label: "Texas",value: "TX"},
        {label: "Utah",value: "UT"},
        {label: "Vermont",value: "VT"},
        {label: "Virginia",value: "VA"},
        {label: "Washington",value: "WA"},
        {label: "West Virginia",value: "WV"},
        {label: "Wisconsin",value: "WI"},
        {label: "Wyoming",value: "WY"}
    ];

    static BYTE_SIZES:string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    static bytesToSize($bytes:number,$decimals:number=2):string{
        if ($bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = $decimals < 0 ? 0 : $decimals;    
        const i = Math.floor(Math.log($bytes) / Math.log(k));
    
        return parseFloat(($bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + FormatUtil.BYTE_SIZES[i];
    }

    static dateHMSMDY($date:Date,$ampm:boolean=true, $military:boolean=false):string{
        let strHMS:string = this.dateHMS($date,$ampm,$military);
        let strMDY:string = this.dateMDY($date);
        
        return strHMS+" "+strMDY;
    }
    static dateMDHM($date:Date):string{
        
        let d:number = $date.getDate();
        let mon:number =  $date.getMonth();

        let h:number = $date.getHours();
        let min:number =  $date.getMinutes();
        
        let ampm:string = (h>12)?"PM":"AM";

        if(h>=12) h-=12;
        if(h===0) h=12;
        
        return FormatUtil.MONTHS[mon].abbr+" "+d+" at "+h+":"+(min<10?"0"+min:min)+" "+ampm;

    }
    static isSameDateDay=($date1:Date, $date2:Date)=>{
        return ($date1.getFullYear()===$date2.getFullYear() && $date1.getMonth()===$date2.getMonth() && $date1.getDate()===$date2.getDate());
    }
    static dateDOTW($date:Date,$abbrdotw:boolean=true){
        return $abbrdotw?this.DOTW[$date.getDay()].abbr:this.DOTW[$date.getDay()].full;
    }
    static dateMDY($date:Date, $abbrMonth:boolean=true, $dotw:boolean=true, $abbrdotw:boolean=true, $includeYear:boolean=true):string{
			
        let numDay:number = $date.getDate();
        let numYear:number = $date.getFullYear();
        
        let strMonth:string = $abbrMonth?this.MONTHS[$date.getMonth()].abbr:this.MONTHS[$date.getMonth()].full;
        
        let strRet:string;
        if($dotw){
            let strDOTW:string = this.dateDOTW($date,$abbrdotw);
            strRet = strDOTW+" "+strMonth+" "+numDay;
        }else{
            strRet = strMonth+" "+numDay;
        }

        if($includeYear){
            strRet+=", "+numYear;
        }
        
        
        return strRet;
    }
    static dateHMS($date:Date,$ampm:boolean,$military:boolean=false, $hideSeconds:boolean=false):string{
        let strAMPM:string = "";

        let numHour:number = $date.getHours();
        if($ampm){
            if(numHour>=12){
                strAMPM="PM";
            }else{
                strAMPM="AM";
            }
        }
        let numMin:number = $date.getMinutes();
        let numSec:number = $date.getSeconds();

        if(!$military){
            if(numHour>=12){
                numHour-=12;
            }
            if(numHour===0){
                numHour=12;
            }
        }

        let strHour:string = (numHour<10)?"0"+numHour:numHour+"";
        let strMin:string = (numMin<10)?"0"+numMin:numMin+"";
        let strSec:string = (numSec<10)?"0"+numSec:numSec+"";

        let strRet:string = strHour+":"+strMin;
        
        if(!$hideSeconds){
            strRet+=":"+strSec;
        }
        
        if(strAMPM!==""){
            strRet+=" "+strAMPM;
        }
        return strRet;
    }

    static getDaysInMonth=($month:number,$year:number):number=>{
        //the first day of the month is "1", so asking for 0 is technically the last day of the previous month :)
        return new Date($year,$month,0).getDate();
    }

    static getDate_TodayStart=():Date=>{

        let date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    static getDate_TodayEnd=():Date=>{

        let date = new Date();
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date;
    }
    static getDate_WeekStart=():Date=>{
          
        let date = new Date();
        let dayOfWeek = date.getDay();
        let numDaysToSunday = dayOfWeek;
        date.setDate(date.getDate()-numDaysToSunday);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    static getDate_WeekEnd=():Date=>{

        let date = new Date();
        let dayOfWeek = date.getDay();
        let numDaysToSaturday = 6-dayOfWeek;
        date.setDate(date.getDate()+numDaysToSaturday);
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date;
    }
    static getDate_LastWeekStart=():Date=>{

        let date = new Date(Date.now()-(60000*60*24*7));                
        let dayOfWeek = date.getDay();
        let numDaysToSunday = dayOfWeek;
        date.setDate(date.getDate()-numDaysToSunday);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    static getDate_LastWeekEnd=():Date=>{

        let date = new Date(Date.now()-(60000*60*24*7));
        let dayOfWeek = date.getDay();
        let numDaysToSaturday = 6-dayOfWeek;
        date.setDate(date.getDate()+numDaysToSaturday);
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date;
    }
    static getDate_MonthStart=():Date=>{

        let date = new Date();
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }
    static getDate_MonthEnd=():Date=>{

        let date = new Date();
        date.setDate(FormatUtil.getDaysInMonth(date.getFullYear(),date.getMonth()+1));
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date;
    }
    static getDate_LastMonthStart=():Date=>{

        let dateForMonthCalc:Date = new Date();

        let date = new Date(Date.now()-(60000*60*24*(FormatUtil.getDaysInMonth(dateForMonthCalc.getFullYear(), dateForMonthCalc.getMonth()))));
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }

    
    static getDate_LastMonthEnd=():Date=>{


        let date = new Date();
        date.setDate(-1);
        
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date;
    }

    
    static phoneNumber($value:string):string{

        //make sure string
        $value = ""+$value
        
	    let strPN:string="";
        let strP1:string="";
        let strP2:string="";
        let strP3:string="";     
        if($value.length===11){                
            let strPOne:string = $value.substring(0,1);            
            strP1 = $value.substring(1,4);
            strP2 = $value.substring(4,7);
            strP3 = $value.substring(7,11);            
            strPN = strPOne+"-("+strP1+")-"+strP2+"-"+strP3;            
        }else if($value.length===10){
            strP1 = $value.substring(0,3);
            strP2 = $value.substring(3,6);
            strP3 = $value.substring(6,10);            
            strPN = "("+strP1+") "+strP2+"-"+strP3;
        }else{
            strPN = $value;
        }       
        return strPN;
    }

    static formatTimerHMS($seconds:number, $hours:boolean=true, $smartSmall:boolean=true):string{
        let strTimer:string = "";
        
        let numTime:number = $seconds;
        
        let s:number = numTime % 60;
        let m:number = Math.floor((numTime % 3600 ) / 60);
        let h:number = Math.floor(numTime / (60 * 60));
        
        let strHour:string;
        let strMin:string;
        let strSecond:string;
        if($smartSmall){				
            if(h===0){
                strHour= "--:";					
                if(m===0){
                    strMin = "--:";
                }else{
                    strMin= ((m<10)?("0"+m):m)+":";					
                }
            }else{
                strHour= h+":";					
                strMin= ((m<10)?("0"+m):m)+":";		
            }				
        }else{
            if(h===0){
                strHour= "--:";					
                if(m===0){
                    strMin = "--:";
                }else{
                    strMin= ((m<10)?("0"+m):m)+":";			
                }
            }else{
                strHour= ((h<10)?("0"+h):h)+":";
                strMin= ((m<10)?("0"+m):m)+":";		
            }
        }
        strSecond= (s<10)?("0"+s):s+"";
        
        if($hours){
            if($smartSmall && h===0){					
                strTimer = strMin+strSecond;					
            }else{					
                strTimer = strHour+strMin+strSecond;
            }
        }else{
            strTimer = strMin+strSecond;
        }
        
        return strTimer;
    }

    static isNumber=($value:string):boolean=>{
        const re = /^[0-9\b]+$/;
        return re.test($value);
    }
    /**
     * returns 1: Client is ahead of API, -1:API is ahead of Client, 0: versions match
     */
    static compareVersionNumbers=($v1:string, $v2:string):number=>{
        let v1parts:string[] = $v1.split('.');
        let v2parts:string[] = $v2.split('.');
        let numLen:number = v1parts.length>v2parts.length?v1parts.length:v2parts.length;			
        let answer:number = 0;
        let num1:number;
        let num2:number;
        for(let i=0; i<numLen; i++){
            num1 = (v1parts[i])?Number(v1parts[i]):0;				
            num2 = (v2parts[i])?Number(v2parts[i]):0;				
            if(num1>num2){
                answer=1;
            }else if(num1===num2){
                answer=0;
            }else{
                answer=-1;
            }		
            if(answer===1 || answer===-1){
                break;
            }			
        }
        return answer;
    }

    static formatBearingToDir($bearing:number):string{
        var dir:string = "";        
        if ($bearing >= 0 && $bearing <= 11.25) dir = "N";
        if ($bearing > 348.75 && $bearing <= 360) dir = "N";
        if ($bearing > 11.25 && $bearing <= 33.75) dir = "NNE";
        if ($bearing > 33.75 && $bearing <= 56.25) dir = "NE";
        if ($bearing > 56.25 && $bearing <= 78.75) dir = "ENE";
        if ($bearing > 78.75 && $bearing <= 101.25) dir = "E";
        if ($bearing > 101.25 && $bearing <= 123.75) dir = "ESE";
        if ($bearing > 123.75 && $bearing <= 146.25) dir = "SE";
        if ($bearing > 146.25 && $bearing <= 168.75) dir = "SSE";
        if ($bearing > 168.75 && $bearing <= 191.25) dir = "S";
        if ($bearing > 191.25 && $bearing <= 213.75) dir = "SSW";
        if ($bearing > 213.75 && $bearing <= 236.25) dir = "SW";
        if ($bearing > 236.25 && $bearing <= 258.75) dir = "WSW";
        if ($bearing > 258.75 && $bearing <= 281.25) dir = "W";
        if ($bearing > 281.25 && $bearing <= 303.75) dir = "WNW";
        if ($bearing > 303.75 && $bearing <= 326.25) dir = "NW";
        if ($bearing > 326.25 && $bearing <= 348.75) dir = "NNW";        
        return dir;
    }
    static timerHMSForReading=($seconds:number,$short:boolean=false, $roundToSingle:boolean=false):string=>{
        let strTimer:string = "";
        
        let seconds:number = Math.round($seconds);
        let minutes:number = Math.floor(seconds/60);
        let hours:number = Math.floor(minutes/60);
        let days:number = Math.floor(hours/24);
        
        hours = hours-(days*24);
        minutes = minutes-(days*24*60)-(hours*60);
        seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
        
        let canAddMore:boolean=true;

        if($short){
            if(days>0 && canAddMore){
                strTimer+=days+""+(days===1?" Day ":" Days ");
                if($roundToSingle) canAddMore=false;                
            }
            if(hours>0 && canAddMore){
                strTimer+=hours+""+((hours===1)?" Hr ":" Hrs ");
                if($roundToSingle) canAddMore=false;
            }
            if(minutes>0 && canAddMore){
                strTimer+=minutes+""+(minutes===1?" Min ":" Min ");
                if($roundToSingle) canAddMore=false;
            }
            if(seconds>0 && canAddMore){
                strTimer+=seconds+""+(seconds===1?" Sec ":" Sec ");
                if($roundToSingle) canAddMore=false;
            }
            if($roundToSingle && canAddMore){
                strTimer +="A Few Sec";
            }
        }else{
            if(days>0 && canAddMore){
                strTimer+=days+""+(days===1?" Day ":" Days ");
                if($roundToSingle) canAddMore=false;
            }
            if(hours>0 && canAddMore){
                strTimer+=hours+""+((hours===1)?" Hour ":" Hours ");
                if($roundToSingle) canAddMore=false;
            }
            if(minutes>0 && canAddMore){
                strTimer+=minutes+""+(minutes===1?" Minute ":" Minutes ");
                if($roundToSingle) canAddMore=false;
            }
            if(seconds>0 && canAddMore){
                strTimer+=seconds+""+(seconds===1?" Second ":" Seconds ");
                if($roundToSingle) canAddMore=false;
            }
            
            if($roundToSingle && canAddMore){
                strTimer +="A Few Seconds";
            }
        }
        
        return strTimer;
    }

}