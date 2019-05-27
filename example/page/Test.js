import { foo } from 'test-lib';
import React from 'react';

export default class Test extends React.Component {
    render() {
        return <div>
            { foo }
        </div>
    }
}