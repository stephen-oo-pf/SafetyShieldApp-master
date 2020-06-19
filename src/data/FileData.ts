
export default class FileData{


    static FILE_TYPE_SVG:string = "image/svg+xml";
    static FILE_TYPE_JPEG:string = "image/jpeg";
    static FILE_TYPE_JPG:string = "image/jpg";
    static FILE_TYPE_PNG:string = "image/png";
    static FILE_TYPE_GIF:string = "image/gif";
    static FILE_TYPE_TIFF:string = "image/tiff";
    static FILE_TYPE_PDF:string = "application/pdf";

    static FILETYPESWITHICONS:FileType[] = [
        {type:FileData.FILE_TYPE_JPEG, imgURL:"jpg"},
        {type:FileData.FILE_TYPE_JPG, imgURL:"jpg"},
        {type:FileData.FILE_TYPE_PNG, imgURL:"png"},
        {type:FileData.FILE_TYPE_GIF, imgURL:"gif"},
        {type:FileData.FILE_TYPE_TIFF, imgURL:"tif"},
        {type:FileData.FILE_TYPE_PDF, imgURL:"pdf"},
        {type:FileData.FILE_TYPE_SVG, imgURL:"svg"},
    ];


    static getFileTypeURL($type:string):string{

        let strIconURL:string = "";
        this.FILETYPESWITHICONS.forEach(($value:FileType)=>{
            if($value.type===$type){
                strIconURL = $value.imgURL;
            }
        });

        if(strIconURL!==""){
            return "./static/media/filetypes/icon-filetype-"+strIconURL+".png";
        }else{
            return "";
        }

    }

    
}

interface FileType{
    imgURL:string;
    type:string;
}