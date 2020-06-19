class TitleUtility{
    baseTitle:string = "";
    setup=()=>{
        this.baseTitle = document.title;
    }
    setPageTitle=($pageTitle:string)=>{
        document.title = $pageTitle+ " - " + this.baseTitle;
    }
}

const TitleUtil:TitleUtility = new TitleUtility();
export default TitleUtil;