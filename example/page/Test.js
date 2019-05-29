import { VirtualList } from 'test-lib';
import React from 'react';
import { of } from 'rxjs';
export default class Test extends React.Component {
    constructor(prop) {
        super(prop);
        const list = Array.from({ length: 5000 }).map((_, i) => i);
        console.log(list);
        this.state = {
            list: of(list)
        }
    }

    render() {
        return <div>
            <VirtualList
                data$={this.state.list}
                options$={of({ height: 100 })}
                style={{ height: 600, border: '1px solid black' }}
            >
                {(item, index) => <div style={{ height: 100, borderBottom: '1px solid green' }}>No. {index} - {item}</div>}
            </VirtualList>
        </div>
    }
}
