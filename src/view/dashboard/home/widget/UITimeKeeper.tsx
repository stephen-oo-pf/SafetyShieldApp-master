// UITimeKeeper.tsx
// Safety Shield App: Part of Drill Component Class
// 6/22/2020

import React from 'react';
import TimeKeeper from 'react-timekeeper';

import './UITimeKeeper.sass';

export interface IUITimeKeeperProps {
}
export interface IUITimeKeeperState {
    showTime:boolean;
    time?: string;
    hour?: string;
    minute?: string;
    meridiem?: string;
}
export default class UITimeKeeper extends React.Component<IUITimeKeeperProps, IUITimeKeeperState> {
   
    constructor(props: IUITimeKeeperProps) {
        super(props);
        
        this.state = {
            showTime: false,
            time:'12:00',
            hour: '12',
            minute: '00',
            meridiem: 'PM',
         }  
    }
    componentDidMount() {

    }

    componentWillUnmount() {
    }
    
    render() {  
        return (
            <div className="timekeeper">
                {this.state.showTime &&
                    <React.Fragment>
                        <button
                            className="alarm-clock-plus-button"
                            onClick={()=> this.setState({meridiem:'AM'})}
                        >   
                            AM
                        </button>
                        <button 
                            className="alarm-clock-plus-button"
                            onClick={()=> this.setState({meridiem:'PM'})}
                        >
                            PM
                        </button>
 
                        <TimeKeeper
                            time={this.state.time}
                            hour={this.state.hour}
                            minute={this.state.minute}
                            meridiem={this.state.meridiem}
                            onChange={(newTime:any) => this.setState({time:newTime.formattedSimple})}
                            // onDoneClick={() => this.setState({showTime:false})}
                        />
                        <button
                            className="alarm-clock-plus-button"
                            onClick={() => {
                                return this.setState({ time: '12:00' });
                            }}
                        >   
                            CANCEL
                        </button>
                        <button 
                            className="alarm-clock-plus-button"
                            onClick={()=> this.setState({showTime:false})}
                        >
                            OK
                        </button>
                    </React.Fragment>
                }
                <br />
                {!this.state.showTime &&
                    <button 
                        className="alarm-clock-plus" 
                        onClick={()=> this.setState({showTime:true})}
                    >
                        Schedule Time
                    </button>
                }
                <br />
                <span className="current-time">Time is now: {this.state.time} {this.state.meridiem}</span>
            </div>  
        );
    }
}
// eof
