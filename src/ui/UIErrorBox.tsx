import React from 'react';
import UICenterBox from './UICenterBox';
import './UIErrorBox.scss';

export interface IUIErrorBoxProps {
    error:string | JSX.Element;
}

export default class UIErrorBox extends React.Component<IUIErrorBoxProps> {
    render() {
        let strCN:string = "errorBox";

        return (
            <UICenterBox extraClassName={strCN}>
                {this.props.error}
            </UICenterBox>
        );
    }
}
