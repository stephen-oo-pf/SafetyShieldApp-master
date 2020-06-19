import React from 'react';
import Dropzone from 'react-dropzone';
import './UIFileDropArea.scss';
import { getFileTypeURL } from '../data/FileTypeData';
import { UIViewFieldsItem } from './UIViewFields';
import FormatUtil from '../util/FormatUtil';

export interface IUIFileDropAreaProps {
    //type:IAssetTypeData;
    singularLabel:string;
    mimeTypes:string[];
    file:File | null;
    isReplacement:boolean;
    onFileDropped:($file:File)=>void;    
}

export interface IUIFileDropAreaState {
    typeError:string;
}

export default class UIFileDropArea extends React.Component<IUIFileDropAreaProps, IUIFileDropAreaState> {
    constructor(props: IUIFileDropAreaProps) {
        super(props);

        this.state = {
            typeError:"",            
        }
    }
    _onDrop=($accepted:File[], $rejected:File[])=>{

        if($accepted && $accepted.length>0){
            this.props.onFileDropped($accepted[0]);
        }

        if($rejected.length>0){


            

            let strError:string = "Incompatible "+this.props.singularLabel+" Type: "+$rejected[0].type;

            if($rejected.length>1){
                strError = "You can only upload one file at a time."
            }

            this.setState({typeError:strError});
        }else{
            this.setState({typeError:""});
        }
    }

    render() {

        let strAction:string = "a new";
        if(this.props.isReplacement){
            strAction = "to replace this";
        }

        let jsxSelectedContent = <></>;
        
        let strSelectedCN:string = "selectedFile";
        

        if(this.props.file){
            strSelectedCN+=" hasFile";

            let strFileSize:string = FormatUtil.bytesToSize(this.props.file.size);
            let strDate:string = FormatUtil.dateHMSMDY(new Date(this.props.file.lastModified),true,false);
            let strFileTypeURL:string = getFileTypeURL(this.props.file.type);

            let strFileName:string = this.props.file.name;

            if(strFileName.length>20){
                strFileName = "..."+strFileName.substr(strFileName.length-20,20);

            }

            jsxSelectedContent = (
                <>
                    <UIViewFieldsItem title="File Name:" value={(<div className="fileNameValue">{strFileName}</div>)}/>
                    <UIViewFieldsItem title="File Size:" value={strFileSize}/>
                    <UIViewFieldsItem title="File Type:" value={(<>{this.props.file.type}{strFileTypeURL && (<img src={strFileTypeURL} alt=""/>)}</>)}/>
                    <UIViewFieldsItem title="Last Modified:" value={strDate}/>
                </>
            );
        }

        return (
            <div className="fileDropArea fieldItem fullWidth">
                <UIViewFieldsItem
                    extraClassName={strSelectedCN}
                    title={(<>Selected File <span className="required">*</span></>)}
                    value={jsxSelectedContent}
                />
                <Dropzone
                    multiple={false}
                    onDrop={this._onDrop}
                    accept={this.props.mimeTypes}
                >
                    {({getRootProps, getInputProps, isDragActive, isFileDialogActive, isFocused})=>{
                        
                        let strDropAreaCN:string = "dropArea";
                        if(isDragActive || isFocused){
                            strDropAreaCN+=" active";
                        }
                        if(isDragActive){
                            strDropAreaCN+=" readyToDrop";
                        }


                        return (
                            <div className={strDropAreaCN} {...getRootProps()}>
                                <input {...getInputProps()}/>
                                <div className="directions">
                                    {!isDragActive && (
                                        <>
                                            <span>Click here</span> to browse or <span>Drag & Drop</span> {strAction} <span>{this.props.singularLabel}</span>.
                                        </>
                                    )}
                                    {isDragActive && (
                                        <span>Almost done, just let go!</span>
                                    )}
                                    
                                    <div className="acceptedTypes">
                                        {this.props.mimeTypes.map(($mimeType:string)=>{
                                            let strURL = getFileTypeURL($mimeType);
                                            return (
                                                <img src={strURL} alt="" key={"imgType"+$mimeType}/>
                                            );
                                        })}
                                       
                                    </div>
                                </div>
                            </div>
                        )
                    }}
                </Dropzone>
            </div>
        );
    }
}
