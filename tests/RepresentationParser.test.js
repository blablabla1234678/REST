import RepresentationParser from '../lib/RepresentationParser.js';
import assert from 'assert';

describe('RepresentationParser.parse', function (){

    const parser = new RepresentationParser();
    it('should be possible to pass a value without passing its type', () => {
        const document = parser.parse({
            value: "abc"
        });
        assert.equal(document.value, "abc");
    });

    it('should be possible to pass a value along with a type', () => {
        const document = parser.parse({
            value: "abc",
            type: "String"
        });
        assert.equal(document.type, "String");
        assert.equal(document.value, "abc");
    });

    it('should throw an error when the type constraint is violated by the value constraint', () => {
        assert.throws(() => parser.parse({
            value: "abc",
            type: "Number"
        }));
    });

    it('should throw an error when the value is required but it is undefined', () => {
        assert.throws(() => parser.parse({
            value: null,
            required: true
        }));
    });
});
