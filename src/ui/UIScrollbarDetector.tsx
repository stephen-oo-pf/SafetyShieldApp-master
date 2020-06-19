import * as React from 'react';
import { dispatch } from '../dispatcher/Dispatcher';
import AppEvent from '../event/AppEvent';
import TimerUtil from '../util/TimerUtil';

export interface UIScrollbarDetectorProps {
    
}
/**
 * This class's main purpose is to detect when a scrollbar appears (monitoring the width) on a container
 * It does so by adding an iframe and listening for  its own window resize event.
 * if the container holding the iframe ever adds or removes a scrollbar (by adding or removing content), the width of the iframe with slightly change
 * and the resize listener will fire
 */
export default class UIScrollbarDetector extends React.Component<UIScrollbarDetectorProps> {

    frame:React.RefObject<HTMLIFrameElement> = React.createRef();

    componentDidMount(){

        if(this.frame.current){
            this.frame.current.contentWindow?.addEventListener("resize", this._onResize);
        }

    }
    componentWillUnmount(){

        if(this.frame.current){
            this.frame.current.contentWindow?.removeEventListener("resize", this._onResize);
        }
    }
    _onResize=()=>{
        TimerUtil.debounce("pageResize",()=>{
            dispatch(new AppEvent(AppEvent.PAGE_SIZE_CHANGE));
        },100);
    }

    render() {
        let styles:React.CSSProperties = {
            height: 0,
            margin: 0,
            padding: 0,
            overflow: "hidden",
            borderWidth: 0,
            position: "absolute",
            backgroundColor: "transparent",
            width: "100%"
        };

        return (
            <iframe className="ScrollBarAdapter" ref={this.frame} style={styles} />
        );
    }
}
