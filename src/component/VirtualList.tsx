import * as React from "react";
import { BehaviorSubject, combineLatest, Observable, ReplaySubject, Subscription, fromEvent } from 'rxjs';
import { map, tap, withLatestFrom, skipWhile, startWith, debounceTime, filter, pairwise } from 'rxjs/operators';
import style from "./VirtualList.scss";

/**
 * 组件配置
 */
export interface IVirtualListOptions {
  // height of item, required 
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

export class VirtualList<T> extends React.Component<
  Readonly<IVirtualListProps<T>>,
  IVirtualListState<T>
> {
  // 初始状态
  state = {
    data: [] as Array<IDataItem<T>>,
    scrollHeight: 0
  };

  // 虚拟列表显示的data列表快照
  private stateDataSnapshot: Array<IDataItem<T>> = [];

  // 当前显示条目数量的快照
  private displayedRowsSnapshot: number = 0;

  // 记录引用数据
  private dataReference: T[] = [];

  // DOM引用
  private virtualListRef = React.createRef<HTMLDivElement>();

  // 容器高度
  private containerHeight$ = new BehaviorSubject<number>(0);

  // 最近一次 列表首元素的下标
  private lastFirstIndex = -1;

  // 记录上次滚动位置
  private lastScrollPos = 0;

  // 初始化配置
  private options$ = new ReplaySubject<IVirtualListOptions>(1);

  private subs = new Subscription();

  public componentDidMount() {
    const virtualListElm = this.virtualListRef.current as HTMLElement;

    this.subs.add(
      this.props.options$
        .pipe(
          tap(options => {
            if (options.height === undefined) {
              throw new Error('VirturalList need a height property in options$');
            }
          }),
          map(options => {
            const opt: IVirtualListOptions = Object.assign({}, options);
            opt.sticky = opt.sticky === undefined ? true : opt.sticky;
            opt.spare = opt.spare === undefined ? 3 : opt.spare;
            opt.startIndex = opt.startIndex === undefined ? 0 : opt.startIndex;
            opt.resize = opt.resize === undefined ? true : opt.resize;

            return opt;
          })
        ).subscribe(opt => this.options$.next(opt))
    );  
    
    // window resize event
    this.subs.add(
      fromEvent(window, 'resize')
        .pipe(
          // mixin event and options$ as an array;
          withLatestFrom(this.options$),
          // if options.resize = false, skip the rest
          skipWhile(([_, options]) => !options.resize),
          startWith(null),
          // throttling function
          debounceTime(200),
          map(() => this.containerHeight$.next(virtualListElm.clientHeight))
        )
        .subscribe()
    );

    const scrollEvent$ = fromEvent(virtualListElm, 'scroll')
      .pipe(
        startWith({ target: { scrollTop: this.lastScrollPos } })
      );

    const scrollTop$ = scrollEvent$.pipe(map(e => (e.target as HTMLElement).scrollTop));

    this.subs.add(
      this.options$
      .pipe(
        filter(option => option.startIndex !== undefined),
        map(option => option.startIndex! * option.height)
      )
      .subscribe(scrollTop => setTimeout(() => virtualListElm.scrollTop = scrollTop))
    );

    this.subs.add(
      this.props.data$
        .pipe(
          withLatestFrom(this.options$),
          filter(([_, options]) => Boolean(options.sticky))
        )
        .subscribe(() => setTimeout(() => virtualListElm.scrollTop = 0))
    );

    // 容器中实际可显示的条数
    const displayedRows$ = combineLatest(this.containerHeight$, this.options$)
      .pipe(map(([ch, { height }]) => Math.ceil(ch / height) + 3));

    const indexes$ = combineLatest(scrollTop$, this.options$).pipe(
      // the index of the top elements of the current list
      map(([st, options]) => Math.floor((st as any) / options.height))
    );

    const shouldUpdate$ = combineLatest(
      indexes$,
      this.props.data$,
      displayedRows$
    )
    .pipe(
      map(([curIndex, data, displayedRows]) => {
        const maxIndex = data.length - displayedRows < 0 ? 0 : data.length - displayedRows;
        return [Math.min(curIndex, maxIndex), displayedRows];
      }),
      filter(([curIndex, displayedRows]) => curIndex !== this.lastFirstIndex || displayedRows !== this.displayedRowsSnapshot),
      tap(([curIndex]) => this.lastFirstIndex = curIndex),
      map(([firstIndex, displayedRows]) => {
        const lastIndex = firstIndex + displayedRows - 1;
        return [firstIndex, lastIndex];
      })
    );

    const scrollDirection$ = scrollTop$.pipe(
      pairwise(),
      map(([p, n]) => (n - p > 0 ? 1 : -1)),
      startWith(1)
    );

    // 容器中实际显示的数据数组
    const dataInDisplayed$ = combineLatest(this.props.data$, this.options$, shouldUpdate$)
      .pipe(
        withLatestFrom(scrollDirection$, displayedRows$),
        map(([[data, { height }, [firstIndex, lastIndex]], dir, displayedRows]) => {
          const dataSlice = this.stateDataSnapshot;
          // compare data reference, if not the same, then update the list
          const dataReferenceIsSame = data === this.dataReference;
          // fill the list
          if (!dataSlice.length || !dataReferenceIsSame || displayedRows !== this.displayedRowsSnapshot) {
            if (!dataReferenceIsSame) {
              this.dataReference = data;
            }
            if (displayedRows !== this.displayedRowsSnapshot) {
              this.displayedRowsSnapshot = displayedRows;
            }

            return (this.stateDataSnapshot = data.slice(firstIndex, lastIndex + 1).map(item => ({
              origin: item,
              $pos: firstIndex * height,
              $index: firstIndex++
            })));
          }

          const diffSliceIndexes = this.getDifferenceIndexes(dataSlice, firstIndex, lastIndex);
          let newIndex = dir > 0 ? lastIndex - diffSliceIndexes.length + 1 : firstIndex;

          diffSliceIndexes.forEach(index => {
            const item = dataSlice[index];
            item.origin = data[newIndex];
            item.$pos = newIndex * height;
            item.$index = newIndex++;
          });
  
          return (this.stateDataSnapshot = dataSlice);
        })
      );

    const scrollHeight$ = combineLatest(this.props.data$, this.options$)
      .pipe(
        map(([data, option]) => data.length * option.height)
      );

    this.subs.add(
      combineLatest(dataInDisplayed$, scrollHeight$)
        .subscribe(([data, scrollHeight]) => this.setState({ data, scrollHeight }))
    );
  }

  componentWillUnmount() {
    this.subs.unsubscribe();
    this.containerHeight$.complete();
    this.options$.complete();
  }

  render() {
    return (
      // wrapper
      <div 
        className={style['virtual-list']}
        ref={this.virtualListRef}
        style={this.props.style}
      >
        <div
          style={{ height: this.state.scrollHeight }}
          className={style['virtual-list_container']}
        >
          {this.state.data.map((data, i) => (
            <div 
              key={i}
              className={style['virtual-list_placeholder']}
              style={{ top: data.$pos + 'px' }}
            >
              { data.origin !== undefined ? (this.props.children as any)(data.origin, data.$index) : null }
            </div>
          ))
          }
        </div>
      </div>
    );
  }

  private getDifferenceIndexes(slice: Array<IDataItem<T>>, firstIndex: number, lastIndex: number): number[] {
    const indexes: number[] = [];

    slice.forEach((item, i) => {
      if (item.$index < firstIndex || item.$index > lastIndex) {
        indexes.push(i);
      }
    });

    return indexes;
  }
}
