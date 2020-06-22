// UITimeKeeper.tsx
// Safety Shield App: Part of Drill Component Class
// 6/18/2020

import React from 'react';
import TimeKeeper from 'react-timekeeper';

import './UITimeKeeper.sass';

export interface IUITimeKeeperProps {
}
export interface IUITimeKeeperState {
    showTime:boolean;
    time?: string;
    hour?: number;
    minute?: number;
    meridiem?: string;
}
export default class UITimeKeeper extends React.Component<IUITimeKeeperProps, IUITimeKeeperState> {
   
    constructor(props: IUITimeKeeperProps) {
        super(props);
        this.state = {
            showTime:true,
            time:'12:34',
            hour: 12,
            minute: 34,
            meridiem: 'pm',
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
                    <TimeKeeper
                        time={this.state.time}
                        meridiem={this.state.meridiem}
                        onChange={ (newTime:any) => this.setState({time:newTime.formattedSimple}) }
                        onDoneClick={ () => this.setState({showTime:false}) }
                    />
                }
                
                <br /><br />  
                <span className="current-time">Time is now: {this.state.time} {this.state.meridiem}</span>
                
                <br /><br />  
                <form className="current-time-form">
                    <input type="text" value={this.state.hour} />
                    <input type="text" value={this.state.minute} />
                    <input type="text" value={this.state.meridiem} />
               </form>        
​
                <br /><br />
                {!this.state.showTime &&
                    <button 
                        className="alarm-clock-plus" 
                        onClick={()=> this.setState({showTime:true})}
                        onChange={(newTime:any) => this.setState({time:newTime.formatted12})}
                    >
                        Show Time
                    </button>
                }
            </div>  
        );
    }
}
// eof
