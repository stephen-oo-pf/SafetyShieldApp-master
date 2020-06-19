import React from 'react';
import { Document, Page } from 'react-pdf';
import BrowserUtil from '../util/BrowserUtil';
import './UIPDFViewer.scss';

import UIInput from './UIInput';

import { pdfjs } from 'react-pdf';
import UIButton from './UIButton';
import FormatUtil from '../util/FormatUtil';
import UIProgressBar from './UIProgressBar';

import chevronLeft from '@iconify/icons-mdi/chevron-left';
import chevronRight from '@iconify/icons-mdi/chevron-right';
import { IAssetTypeData } from '../data/AssetData';
import NextFrame from '../util/NextFrame';
import { listen, unlisten } from '../dispatcher/Dispatcher';
import DashboardEvent from '../event/DashboardEvent';
import TimerUtil from '../util/TimerUtil';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export interface UIPDFViewerProps {
    url:string;
    type:IAssetTypeData;
    fileSize:number;
}

export interface UIPDFViewerState {
    numPagesTotal:number;
    curPage:number;
    width:number;
    error:boolean;
    loading:boolean;
    loadedPercent:number;
    unmountPage:boolean;
}

export default class UIPDFViewer extends React.PureComponent<UIPDFViewerProps, UIPDFViewerState> {

    private content:React.RefObject<HTMLDivElement> = React.createRef();

    private _isUnmounted:boolean=false;

    constructor(props: UIPDFViewerProps) {
        super(props);

        this.state = {
            numPagesTotal:0,
            curPage:0,
            width:500, 
            loading:true,
            error:false,
            loadedPercent:0,
            unmountPage:false,
        }
    }
    componentDidMount(){
        this._setWidth();
        listen(DashboardEvent.DASHBOARD_EXPAND_TOGGLED_COMPLETE,this._onDashboardExpandToggledComplete);
        window.addEventListener("resize", this._onWindowResize);
    }
    componentWillUnmount(){
        unlisten(DashboardEvent.DASHBOARD_EXPAND_TOGGLED_COMPLETE,this._onDashboardExpandToggledComplete)
        window.removeEventListener("resize", this._onWindowResize);
        TimerUtil.clearDebounce("pdfresize");
        this._isUnmounted=true;

    }
    _onWindowResize=()=>{
        if(!this._isUnmounted){
            TimerUtil.debounce("pdfresize",()=>{
                this._resize();
            },200);
        }
    }
    _resize=()=>{
        this._setWidth(BrowserUtil.getScrollBarWidth());

    }
    _onPDFLoaded=({numPages}:any)=>{
        
        if(!this._isUnmounted){

            this.setState({curPage:1, numPagesTotal:numPages, loading:false, error:false},()=>{
                requestAnimationFrame(()=>{
                    this._setWidth(BrowserUtil.getScrollBarWidth());
                });
            });    
        }
    }

    _onPDFProgress=($detail:{loaded:number, total?:number})=>{

        if(!this._isUnmounted){
            let numPercent:number = $detail.loaded/this.props.fileSize;
            if(this.state.loadedPercent!==numPercent && numPercent>this.state.loadedPercent){
                this.setState({loadedPercent:numPercent});
            }
        }
    }

    _onPDFError=($error:any)=>{
        if(!this._isUnmounted){
            this.setState({loading:false, error:true});
        }
    }
    _onDashboardExpandToggledComplete=($event:DashboardEvent)=>{

        this._resize();
    }
    
    _setWidth=($offset:number=0)=>{
        if(this.content.current){

            this.setState({unmountPage:true},()=>{
                NextFrame(()=>{
                    if(this.content.current){
                        this.setState({unmountPage:false, width:this.content.current.clientWidth-20-$offset});
                    }
                });
            })
        }
    }
    _onPrevPage=()=>{
        this._nextPrevPage(-1);
    }
    _onNextPage=()=>{
        this._nextPrevPage(1);        
    }
    _nextPrevPage=($dir:number)=>{
        let page:number = this.state.curPage+$dir;
        if(page<1) page=1;
        if(page>this.state.numPagesTotal) page = this.state.numPagesTotal;

        this.setState({curPage:page});
    }

    _onInputChange=($value:string,$name?:string)=>{

        let page:number = Number($value);
        if(page===0){
            page=1;
        }

        if(page<1) page=1;
        if(page>this.state.numPagesTotal) page = this.state.numPagesTotal;

        this.setState({curPage:page});
    }
    render() {
        let strCN:string = "pdf";

        //@ts-ignore the "onLoadProgress" event does exist... but typescript hates it.
        let jsx:JSX.Element = (<Document  onLoadProgress={this._onPDFProgress}                      
            file={this.props.url}
            onLoadSuccess={this._onPDFLoaded}
            onLoadError={this._onPDFError}
            >
                {this.state.numPagesTotal!==0 && this.state.curPage!==0 && !this.state.unmountPage && (
                    <Page 
                    width={this.state.width}
                    pageNumber={this.state.curPage}/>   
                )}                                            
        </Document>);


        let numSizeLoaded:number = this.state.loadedPercent*this.props.fileSize;

        return (
            <div className={strCN} ref={this.content}>
                
                {this.state.numPagesTotal!==0 && this.state.curPage!==0 && !this.state.loading && (

                    <div className="pdfHeader">
                        {this.state.numPagesTotal>1 && (
                            <UIButton color={UIButton.COLOR_LIGHTGREY} disabled={this.state.curPage===1} isSquare size={UIButton.SIZE_SMALL} extraClassName="prev" icon={chevronLeft} onClick={this._onPrevPage} /> 
                        )}
                        <div className="pageCount">
                            <span className="pageCountTitle">Page:</span>
                            {this.state.numPagesTotal>1 && (
                                <UIInput type="number" name="curPage" value={""+this.state.curPage} onChange={this._onInputChange}/>
                            )}
                            {this.state.numPagesTotal===1 && (
                                <span>1 </span>
                            )}
                            of <span className="total">{this.state.numPagesTotal}</span>                        
                        </div>
                        {this.state.numPagesTotal>1 && (
                            <UIButton color={UIButton.COLOR_LIGHTGREY} disabled={this.state.curPage===this.state.numPagesTotal} isSquare size={UIButton.SIZE_SMALL} extraClassName="next" icon={chevronRight} onClick={this._onNextPage} />
                        )}

                    </div>

                )}
                <div className="pdfContent">

                    {this.state.loading && (
                        <div className="loadingPDF">
                            <UIProgressBar percent={this.state.loadedPercent}/>    
                            <div className="loadingTitle"><span>Loading {this.props.type.singularLabel}</span></div>
                            <div className="fileSize">{FormatUtil.bytesToSize(numSizeLoaded)} / {FormatUtil.bytesToSize(this.props.fileSize)}</div>
                        </div>
                    )}      
                    {jsx}          
                </div>
            </div>
        );
    }
}
