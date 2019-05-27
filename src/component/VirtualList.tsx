import * as React from 'react';
import style from './VirtualList.scss';

export interface IVirtualListOptions {
    height: number;
    spare?: number;
    sticky?: boolean;
    startIndex?: number;
    resize?: boolean;
}

/**
 * 虚拟列表的属性
 */
export interface IVirtualListProps<T> {
    data: T[];
    options: IVirtualListOptions;
    style?: any;
}

interface IVirtualListState<T> {
    data: Array<any[]>;
    scrollHeight: number;
}

export class VirtualList<T> extends React.Component<
        Readonly<IVirtualListProps<T>>,
        IVirtualListState<T>
    > {
    render() {
        return (
            <div
                style={this.props.style}
            >

            </div>
        );
    }
}