import * as React from 'react';
import UIScrollContainer from '../../../../ui/UIScrollContainer';

export interface IEventMapSettingsProps {
}

export default class EventMapSettings extends React.Component<IEventMapSettingsProps> {
    render() {
        return (
            <UIScrollContainer extraClassName="sidebarContentView">
                Settings
            </UIScrollContainer>
        );
    }
}
