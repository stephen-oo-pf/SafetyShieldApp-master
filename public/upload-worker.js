const ACTION_UPLOAD = "UPLOAD";
const ACTION_UPLOAD_ERROR = "UPLOAD_ERROR";
const ACTION_UPLOAD_PROGRESS = "UPLOAD_PROGRESS";
const ACTION_UPLOAD_COMPLETE = "UPLOAD_COMPLETE";

onmessage = function($event){
    /*
        $event.data.action = string (what to do)
        $event.data.file = File or null
        $event.data.id = string (id of worker instance)
        $event.data.url = string  (where to send)
        $event.data.payload = obj (what to send)
    */
    switch($event.data.action){
        case ACTION_UPLOAD:
            uploadFile($event.data.file, $event.data.id, $event.data.url, $event.data.payload);
        break;
    }

}

function uploadFile($file, $id, $url, $payload){

    var xhr = new XMLHttpRequest();

    const onProgress = ($event)=>{
        var percent = $event.loaded/$event.total;
        
        postMessage({action:ACTION_UPLOAD_PROGRESS, id:$id, percent:percent});
    }
    
    xhr.upload.addEventListener("progress", onProgress);

    var strReadyPayload = JSON.stringify($payload);
    
    var data = new FormData();
    data.append("LAASERDATA", strReadyPayload);
    if($file){
        data.append("FILECONTENTS",$file);
    }

        
    const cleanXHR = ()=>{
        xhr.upload.removeEventListener("progress",onProgress);
    }
        
    xhr.onreadystatechange = function($event){
    


        switch(xhr.readyState){
            case xhr.UNSENT:

            break;
            case xhr.OPENED:
                
            break;
            case xhr.HEADERS_RECEIVED:

            break;
            case xhr.LOADING:

            break;
            case xhr.DONE:
                
                switch(xhr.status){
                    case 200:
                        cleanXHR();

                        var objResponse = JSON.parse(xhr.response);
                        if(objResponse.summary && objResponse.summary.success && objResponse.data && objResponse.data.assetId){
                            postMessage({action:ACTION_UPLOAD_COMPLETE, id:$id, assetID:objResponse.data.assetId});
                        }else{
                            if(objResponse.summary.code===509){
                                postMessage({action:ACTION_UPLOAD_ERROR, id:$id, error:"We detected a virus or other malicious content in your uploaded file. The upload has been aborted."});
                            }else{
                                postMessage({action:ACTION_UPLOAD_ERROR, id:$id, error:"Error Saving"});
                            }
                        }

                    break;
                    default:
                        cleanXHR();
                        postMessage({action:ACTION_UPLOAD_ERROR, id:$id, error:"Error Saving"});

                }

            break;
        }
    }

    xhr.open("POST",$url,true);
    xhr.send(data);

}