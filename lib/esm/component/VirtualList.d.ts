import * as React from "react";
import { Observable } from 'rxjs';
/**
 * 组件配置
 */
export interface IVirtualListOptions {
    height: number;
    spare?: number;
    sticky?: boolean;
    startIndex?: number;
    resize?: boolean;
}
/**
 * 组件属性
 */
export interface IVirtualListProps<T> {
    data$: Observable<T[]>;
    options$: Observable<IVirtualListOptions>;
    style?: any;
}
/**
 * 组件状态
 */
interface IVirtualListState<T> {
    data: Array<IDataItem<T>>;
    scrollHeight: number;
}
interface IDataItem<T> {
    origin: T;
    $index: number;
    $pos: number;
}
export declare class VirtualList<T> extends React.Component<Readonly<IVirtualListProps<T>>, IVirtualListState<T>> {
    state: {
        data: IDataItem<T>[];
        scrollHeight: number;
    };
    private stateDataSnapshot;
    private displayedRowsSnapshot;
    private dataReference;
    private virtualListRef;
    private containerHeight$;
    private lastFirstIndex;
    private lastScrollPos;
    private options$;
    private subs;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    private getDifferenceIndexes;
}
export {};
