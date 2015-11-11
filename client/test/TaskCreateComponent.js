import {assert} from 'chai';
import TaskCreateComponent from '../src/workflows/focus/TaskCreateComponent';
import React from 'react/addons';

const TestUtils = React.addons.TestUtils;

describe('Task Create Component', function() {
    it('<input> should be appear three times', function() {
        var renderedComponent = TestUtils.renderIntoDocument(
            <TaskCreateComponent pid={0} list={{id: 0}} tasks={[1,2,3]} />
        );

        var inputComponent = TestUtils.scryRenderedDOMComponentsWithTag(
            renderedComponent,
            'input'
        );

        assert.equal(inputComponent.length, 3);
    });
});