export default class SavedData{

    storage:Storage = window.localStorage;

    data:any;

    storageID:string;
    constructor($id:string, $defaultData:any){
        this.storageID = $id;

        let strData:string | null = this.storage.getItem(this.storageID);
        if(strData){
            this.data = JSON.parse(strData);
        }else{
            this.data = $defaultData;
            this.save();
        }

    }
    
    save=()=>{
        const strData:string = JSON.stringify(this.data);
        this.storage.setItem(this.storageID, strData);
    }
    

}