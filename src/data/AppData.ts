
import preval from 'preval.macro';

interface IConfig{
    general:{
        customer_support_email:string;
        customer_support_phone:string;
        master_organization_id:string;
        master_organization_type:string;
        mobile_app_name:string;
        password_policy:string;
        js_password_regex:string;
        password_regex:string;
        product_name:string;
        short_produce_name:string;
        user_edit_same_permission:string;
    }
    blurb:{
        post_pw_reset_blurb:string;
    }
    ui:{
        /**
         * in seconds
         */
        alert_polling_interval:number;
        /**
         * in seconds
         */
        user_activity_polling_interval:number;
    }
}


interface ITerminologyForm{
    plural:string;
    singular:string;
}

export interface ITerminologyLanguageList{
    child_org:ITerminologyForm;
    parent_org:ITerminologyForm;
    user:ITerminologyForm;
}

export interface ITerminologyLanguage{
    default:ITerminologyLanguageList;
    [key:string]:ITerminologyLanguageList;
}

interface ITerminologyLanguages{
    eng:ITerminologyLanguage;
}

const buildTimestamp:number = preval`module.exports = new Date().getTime();`;

class AppDataUtil{
    buildDate:Date = new Date(buildTimestamp);
    version:string = "1.0.0";
    appID:string = "com.safetyshield.webapp";

    siteUrl:string = "";

    terminology!:ITerminologyLanguages;
    config!:IConfig;

    setSiteURL=($path:string)=>{
        this.siteUrl = $path;
    }

    setInitInfo=($info:any)=>{
        this.terminology = $info.terminology;
        this.config = $info.config;

    }
    get masterOrgID():string{
        return this.config.general.master_organization_id;
    }
    get masterOrgType():string{
        return this.config.general.master_organization_type;
    }

    get terminologyLanguage(){
        return this.terminology.eng;
    }

}


const AppData:AppDataUtil = new AppDataUtil();

export default AppData;