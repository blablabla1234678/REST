import {
    RepresentationParser,
    TypeConstraint,
    RequiredConstraint,
    StringLengthConstraint,
    ValueConstraint
} from '../lib/RepresentationParser.js';
import assert from 'assert';

describe('RepresentationParser.parse', function (){

    const parser = new RepresentationParser();
    it('should be possible to parse multiple constraints for the root node', () => {
        const constraints = parser.parse({
            type: "String",
            required: true,
            length: [1,255],
            value: "abc"
        });
        assert.equal(constraints.length, 4);
        assert.ok(constraints[0] instanceof RequiredConstraint);
        assert.ok(constraints[1] instanceof TypeConstraint);
        assert.equal(constraints[1].type, "string");
        assert.ok(constraints[2] instanceof StringLengthConstraint);
        assert.equal(constraints[2].min, 1);
        assert.equal(constraints[2].max, 255);
        assert.ok(constraints[3] instanceof ValueConstraint);
        assert.equal(constraints[3].value, "abc");
        for (let constraint of constraints)
            assert.deepEqual(constraint.selector, []);
    });
});
