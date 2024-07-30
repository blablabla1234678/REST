import {
    DocumentationParser,
    RequiredConstraint,
    TypeConstraint,
    StringLengthConstraint
} from '../lib/DocumentationParser.js';
import assert from 'assert';

describe('DocumentationParser.parse', function (){

    const parser = new DocumentationParser();

    it('should be possible to have multiple constraints for a type', () => {
        const context = parser.parse({
            A: {
                type: "String",
                required: true,
                length: [1,255]
            }
        });
        const A = context.A;
        assert.equal(A.length, 3);
        assert.ok(A[0] instanceof RequiredConstraint);
        assert.ok(A[1] instanceof TypeConstraint);
        assert.equal(A[1].type, "String");
        assert.ok(A[2] instanceof StringLengthConstraint);
        assert.equal(A[2].min, 1);
        assert.equal(A[2].max, 255);
        for (let constraint of A)
            assert.deepEqual(constraint.selector, []);
    });

    it('should be possible to have multiple types', () => {
        const context = parser.parse({
            A: {
                type: "str"
            },
            B: {
                type: "num",
            },
            C: {
                type: "obj"
            }
        });
        assert.ok(context.A[0] instanceof TypeConstraint);
        assert.equal(context.A[0].type, "String");
        assert.ok(context.B[0] instanceof TypeConstraint);
        assert.equal(context.B[0].type, "Number");
        assert.ok(context.C[0] instanceof TypeConstraint);
        assert.equal(context.C[0].type, "Object");
    });

    it('should be possible to reuse custom types', () => {
        const context = parser.parse({
            A: {
                type: "String"
            },
            B: {
                type: "A"
            },
            C: {
                type: "B"
            }
        });
        assert.ok(context.A[0] instanceof TypeConstraint);
        assert.equal(context.A[0].type, "String");
        assert.ok(context.B[0] instanceof TypeConstraint);
        assert.equal(context.B[0].type, "A");
        assert.ok(context.C[0] instanceof TypeConstraint);
        assert.equal(context.C[0].type, "B");
    });

    it('should be possible to reuse custom types with other constraints', () => {
        const context = parser.parse({
            A: {
                type: "String"
            },
            B: {
                type: "A",
                length: [0,255]
            },
            C: {
                type: "B",
                required: true
            }
        });
        
        assert.equal(context.A.length, 1);
        assert.ok(context.A[0] instanceof TypeConstraint);
        assert.equal(context.A[0].isNative, true);
        assert.equal(context.A[0].type, "String");

        assert.equal(context.B.length, 2);
        assert.ok(context.B[0] instanceof TypeConstraint);
        assert.equal(context.B[0].isNative, false);
        assert.equal(context.B[0].type, "A");
        assert.ok(context.B[1] instanceof StringLengthConstraint);

        assert.equal(context.C.length, 2);
        assert.ok(context.C[0] instanceof RequiredConstraint);
        assert.ok(context.C[1] instanceof TypeConstraint);
        assert.equal(context.C[1].isNative, false);
        assert.equal(context.C[1].type, "B");
    });
});
