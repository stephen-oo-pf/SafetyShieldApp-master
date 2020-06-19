import * as React from 'react';
import UIIcon from './UIIcon';
import commentText from '@iconify/icons-mdi/comment-text';
import './UICommentBox.scss';

export interface IUICommentBoxProps {
    comment:string;
}

export default class UICommentBox extends React.Component<IUICommentBoxProps> {
    render() {
        let strCN:string = "commentBox";
        return (
            <div className={strCN}>
                <UIIcon icon={commentText}/>
                {this.props.comment}
            </div>
        );
    }
}
