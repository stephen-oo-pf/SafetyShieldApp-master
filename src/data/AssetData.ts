


export interface IAssetTypeMetaConfig{
    fieldLabel:string;
    fieldName:string;
    dataType:string;
    render:string;
    required:boolean;
    filterable:boolean;
    size:string;
    default:string | null;
    listSource?:string;
    placeholder?:string;
    noLabel?:string;
    yesLabel?:string;
}

export interface IAssetTypeData{
    assetTypeId:string;
    assetType:string;
    description:string;
    metaConfig:IAssetTypeMetaConfig[];

    sortField:string;
    sortDir:string;
    singularLabel:string;
    pluralLabel:string;
    mimeTypes:string;
    addRightId:string;
    deleteRightId:string;
    editRightId:string;
    viewRightId:string;
    
}

export interface IAssetMetaData{
    name:string;
    [key:string]:any;
}


export interface IAssetVersionData{
    assetContentId:string;
    createDts:number;
    version:number;
    fileName:string;
    contentType:string;
    contentSize:number;
    assetContentMeta:IAssetMetaData[];
}


export interface IAssetData{
    asset:{
        assetId:string;
        assetTypeId:string;
        description:string;
        createDts:number;
        updateDts:number;
        versions:string;
    }
    assetMeta:IAssetMetaData;
    assetContent:{
        currentVersion:IAssetVersionData
        priorVersions:IAssetVersionData[]
    }

    [key:string]:any;

}

export default class AssetData{

}