import React from 'react';

export interface IUIFileViewerProps {
    url:string;
}

export interface IUIFileViewerState {
}

export default class UIFileViewer extends React.Component<IUIFileViewerProps, IUIFileViewerState> {
    constructor(props: IUIFileViewerProps) {
        super(props);

        this.state = {

        }
    }
    _onError=()=>{

    }

    render() {
        let strCN:string = "fileViewer";
        return (
            <div className={strCN}>
            </div>
        );
    }
}
