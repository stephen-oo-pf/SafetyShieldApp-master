// TimeKeeperFC.tsx
// 6/17/2020

import React, {useState} from 'react';
import TimeKeeper from 'react-timekeeper';

import './UITimeKeeper.sass';

export default function TimekeeperFC() {
    const [time, setTime] = useState('9:39 PM')
    const [showTime, setShowTime] = useState(false);
    
    return (
        <div className="timekeeper">
            {showTime &&
                <TimeKeeper
                    time={time}
                    onChange={(newTime:any) => setTime(newTime.Simple)}
                    onDoneClick={() => setShowTime(false)}
                    switchToMinuteOnHourSelect
                />
            }
            <br /><br />          
            <span className="current-time">The current time is: {time}</span>
            <br /><br />
            {!showTime &&
                <button 
                    className="alarm-clock-plus" 
                    onClick={()=> setShowTime(true)}
                    onChange={(newTime:any) => setTime(newTime.formatted12)}
                >
                    Show
                </button>
            }
        </div>  
    )
}

// eof