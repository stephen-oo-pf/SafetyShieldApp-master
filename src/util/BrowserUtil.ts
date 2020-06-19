interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string
    }>;
    prompt(): Promise<void>;
}

class BrowserUtilData{
    deferredInstallPrompt?:BeforeInstallPromptEvent;

    isIOS:boolean=false;
    isAndroid:boolean=false;
    isMac:boolean=false;
    isWindows:boolean=false;
    
    isMOBILE:boolean=false;
    isIPAD:boolean=false;

    isTouchDevice:boolean=false;

    isSamsungBrowser:boolean=false;
    isOpera:boolean=false;
    isFirefox:boolean=false;
    isSafari:boolean=false;
    isIE:boolean=false;
    isChrome:boolean=false;

    canCopyToClipboardAsync:boolean=false;
    canCopyToClipboardCommand:boolean=false;

    isAudioSupported:boolean=true;

    isStandalone:boolean=false;
    _scrollBarWidth:number = -1;


    objURLParams:any = {};

    setup=()=>{

        let ua:string = navigator.userAgent.toLowerCase();

        //OPERATING SYSTEM
        if(ua.indexOf("ipad")!==-1 || ua.indexOf("iphone")!==-1 || ua.indexOf("ipod")!==-1){
            this.isIOS=true;     
            this.isMOBILE=true;       
            if(ua.indexOf("ipad")!==-1){
                this.isIPAD=true;
            }
        }else if(ua.indexOf("android")!==-1){
            this.isAndroid=true;
            this.isMOBILE=true;
        }else if(ua.indexOf("mac")!==-1){
            this.isMac=true;
        }else if(ua.indexOf("windows")!==-1){
            this.isWindows=true;
        }

        //BROWSER
        if(ua.indexOf("samsungbrowser")!==-1){
            this.isSamsungBrowser = true;
            this.isMOBILE=true;
        }else if(ua.indexOf("msie")!==-1){
            this.isIE = true;
        }else if(ua.indexOf("firefox")!==-1){
            this.isFirefox=true;
        }else if(ua.indexOf("opera")!==-1){
            this.isOpera=true;
        }

        //samsungbrowser's UA has the word chrome
        if(!this.isSamsungBrowser && (ua.indexOf("chrome")!==-1 || ua.indexOf("crios")!==-1)){
            this.isChrome = true;
        }
        //safari's UA has the word chrome
        if(ua.indexOf("safari")!==-1 && !this.isChrome){//safari && not chrome
            this.isSafari = true;
        }

        //TOUCH DEVICE
        if(this.isAndroid || this.isIOS || ('ontouchstart' in window.document.documentElement)){
            this.isTouchDevice=true;
        }

        //IS INSTALLED/STANDALONE
        let bolStandalone:boolean = false;
        if (window.matchMedia('(display-mode: standalone)').matches){
            bolStandalone=true;
        }
        //@ts-ignore
        if (window.navigator && window.navigator.standalone === true){
            bolStandalone=true;
        }
        //for PWA
        this.isStandalone=bolStandalone;


        //AUDIO SUPPORT
        let bolAudioSupported:boolean=true;
        if(this.isSafari){
            bolAudioSupported=false;
        }

        this.isAudioSupported = bolAudioSupported;

        //CLIPBOARD SUPPORT
        this.canCopyToClipboardAsync = navigator.clipboard?true:false;
        this.canCopyToClipboardCommand = document.queryCommandSupported('copy');

        //scrollbar width
        this.getScrollBarWidth();

    }
    get canCopyToClipboard():boolean{
        return this.canCopyToClipboardAsync || this.canCopyToClipboardCommand;
    }
    copyToClipboard=($text:string, $complete?:($success:boolean)=>void)=>{
        if(this.canCopyToClipboardAsync){
            navigator.clipboard.writeText($text).then(()=>{
                if($complete) $complete(true);
            },()=>{
                if($complete) $complete(false);
            });
        }else{
            if(this.canCopyToClipboardCommand){
                let textarea:HTMLTextAreaElement = document.createElement("textarea");
                textarea.value = $text;
                textarea.style.position="fixed";
                textarea.style.top = 0+"px";
                textarea.style.left = 0+"px";
                textarea.style.width = "2em";
                textarea.style.height = "2em";
                textarea.style.border = "none";
                textarea.style.outline = "none";
                textarea.style.boxShadow = "none";
                textarea.style.background = "transparent";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                try{
                    let success:boolean = document.execCommand("copy");
                    if($complete) $complete(success);
                }catch($error){
                    if($complete) $complete(false);
                }
                document.body.removeChild(textarea);
            }
        }
    }

    setupConfirmToClose=()=>{
        window.addEventListener("beforeunload", (ev) =>{
            ev.preventDefault();
            ev.returnValue = '';                
        });
    }

    setupPWA=()=>{

        //@ts-ignore
        window.addEventListener('beforeinstallprompt',($e:BeforeInstallPromptEvent)=>{
            //prevent chrome 
            $e.preventDefault();
            this.deferredInstallPrompt = $e; 
        });
    }
    getScrollBarWidth=():number=>{
        if(this._scrollBarWidth===-1){
            let outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

            document.body.appendChild(outer);

            let widthNoScroll = outer.offsetWidth;
            // force scrollbars
            outer.style.overflow = "scroll";

            // add innerdiv
            let inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);        

            let widthWithScroll = inner.offsetWidth;

            // remove divs
            if(outer.parentNode){
                outer.parentNode.removeChild(outer);
            }
            this._scrollBarWidth = widthNoScroll - widthWithScroll;
        }
        return this._scrollBarWidth;
    }
    canAutoInstallPWA=()=>{
        let bolCanInstall:boolean=false;
        if(this.deferredInstallPrompt){
            bolCanInstall=true;
        }
        return bolCanInstall;
    }
    installPWA=($complete:Function)=>{
        if(this.deferredInstallPrompt){
            this.deferredInstallPrompt.prompt();//wait for user to respond to prompt
            this.deferredInstallPrompt.userChoice.then((choiceResult)=>{
                if(choiceResult.outcome==="accepted"){
                    $complete(true);
                }else{
                    $complete(false);
                }
                //@ts-ignore
                this.deferredInstallPrompt=null;
            });
        }
    }

    _onOrientationChange=()=>{
        let timeoutID:number = -1;
        //the orientation change event fires before the rotation completes, so once changed, listen for resize.
        //in case somehow the resize doesn't fire, we just wait 1 second.
        const afterOrientationChange = ()=>{
            window.removeEventListener("resize",afterOrientationChange);
            this.viewPortExplicit();
            window.clearTimeout(timeoutID);
        };

        timeoutID = window.setTimeout(()=>{
            afterOrientationChange();
        },1000);
        window.addEventListener("resize",afterOrientationChange);
    }

    forceViewPortExplicit=()=>{
        window.addEventListener("orientationchange",this._onOrientationChange);
        this.viewPortExplicit();
    }
    viewPortExplicit=()=>{
        //@ts-ignore
        //let visualViewport:any = window.visualViewport;
                
        let numW:number = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);//Math.round(visualViewport.width);
        let numH:number = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);//Math.round(visualViewport.height);

        let viewport:any = document.querySelector("meta[name=viewport]");
        let strVP:string = "";

        //if landscape, force the height to be the width
        if(numW>=numH){
            strVP = "width=device-width, height="+numW+", initial-scale=1, shrink-to-fit=no, user-scalable=no, maximum-scale=1";
        }else{
            strVP = "width=device-width, height=device-height, initial-scale=1, shrink-to-fit=no, user-scalable=no, maximum-scale=1";
        }
        viewport.setAttribute("content",strVP);

    }
    getURLParams=()=>{
        let arrParams:string[] = [];
        let strURL:string = window.location.href;

        let objParams:any = {};
        

        //remove any hash possibly sitting on the end of the params
        if(strURL.indexOf("#")!==-1){
            let arrSplitHash:string[] = strURL.split("#");
            strURL = arrSplitHash[0];
        }
        //parse url for params
        if(strURL.indexOf("?")!==-1){
            let arrSplit:string[] = strURL.split("?");
            arrParams = arrSplit[1].split("&");
            arrParams.forEach(($value:string)=>{
                let split:string[] = $value.split("=");
                let strName:string = split[0];
                let strValue:string = split[1];
                objParams[strName] = strValue;
            });
        }
        this.objURLParams = objParams;

        return objParams;
    }
    replaceState=($path:string)=>{
        window.history.replaceState({},document.title,$path);
    }

    cleanPath=($path:string)=>{
        let path:string = $path;
        if(path.indexOf("#")!==-1){
            let split1 = path.split("#");
            path = split1[0]
        }
        
        if(path.indexOf("?")!==-1){
            let split2 = path.split("?");
            path = split2[0];
        }
        return path;
    }
    getRelativeY=($target:HTMLDivElement)=>{
        let numOffSet:number = $target.offsetTop;
        if($target.offsetParent){
            numOffSet += this.getRelativeY($target.offsetParent as HTMLDivElement);
        }
        return numOffSet;
    }
    getRelativeX=($target:HTMLDivElement)=>{
        let numOffSet:number = $target.offsetLeft;
        if($target.offsetParent){
            numOffSet += this.getRelativeX($target.offsetParent as HTMLDivElement);
        }
        return numOffSet;
    }
    requestFullScreen() {
        let body:HTMLElement = document.body;
        if (body.requestFullscreen) body.requestFullscreen();        
        //@ts-ignore
        else if (body.webkitRequestFullscreen) body.webkitRequestFullscreen();        
        //@ts-ignore
        else if (body.mozRequestFullScreen) body.mozRequestFullScreen();        
        //@ts-ignore
        else if (body.msRequestFullscreen) body.msRequestFullscreen();
    }
    cancelFullScreen() {      
        if (document.exitFullscreen) document.exitFullscreen();        
        //@ts-ignore
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();        
        //@ts-ignore
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();        
        //@ts-ignore
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    isFullScreen(){        
        //@ts-ignore
        let bolFullscreen = (document.fullscreenElement && document.fullscreenElement !== null) ||        
        //@ts-ignore
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||        
        //@ts-ignore
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||        
        //@ts-ignore
        (document.msFullscreenElement && document.msFullscreenElement !== null);
        return bolFullscreen;
    }

    clearFocus(){
        
        if(document.activeElement instanceof HTMLElement){
            document.activeElement.blur();
        }
    }


    async downloadFile($url:string, $fileName:string="download", $complete?:($success:boolean)=>void){

        try{
            const response = await fetch($url);
            const fileBlob = await response.blob();
            const url = URL.createObjectURL(fileBlob);
            const ahref = document.createElement('a');
            ahref.download = $fileName;
            ahref.href = url;
            const onClick = ()=>{
                window.setTimeout(()=>{
                    URL.revokeObjectURL(url);
                    ahref.removeEventListener("click",onClick);
                },150);
            }

            ahref.addEventListener("click",onClick,false);
            ahref.click();
            if($complete){
                $complete(true);
            }

        }catch($error){
            if($complete){
                $complete(false);
            }
        }
    }

}

const BrowserUtil:BrowserUtilData = new BrowserUtilData();
export default BrowserUtil;