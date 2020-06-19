

export interface IFileType{
    mimeType:string;
    type:string;
}

export const FILETYPE_JPEG:string = "image/jpeg";
export const FILETYPE_JPG:string = "image/jpg";
export const FILETYPE_SVG:string = "image/svg+xml";
export const FILETYPE_PNG:string = "image/png";
export const FILETYPE_GIF:string = "image/gif";
export const FILETYPE_TIFF:string = "image/tiff";
export const FILETYPE_PDF:string = "application/pdf";

export const FILETYPES:IFileType[] = [
    {
        mimeType:FILETYPE_JPG,
        type:"jpg"
    },
    {
        mimeType:FILETYPE_JPEG,
        type:"jpg"
    },
    {
        mimeType:FILETYPE_SVG,
        type:"svg"
    },
    {
        mimeType:FILETYPE_PNG,
        type:"png"
    },
    {
        mimeType:FILETYPE_GIF,
        type:"gif"
    },
    {
        mimeType:FILETYPE_TIFF,
        type:"tif"
    },
    {
        mimeType:FILETYPE_PDF,
        type:"pdf"
    },
];


export function getFileType($mimeType:string){
    
    return FILETYPES.find(($value:IFileType)=>{
        return $value.mimeType===$mimeType;
    });
}

export function getFileTypeURL($mimeType:string){

    let strURL:string = "";

    let type = getFileType($mimeType);
    if(type?.type){
        strURL = "./static/media/images/icon-filetype-"+type.type+".png"
    }
    
    return strURL;

}