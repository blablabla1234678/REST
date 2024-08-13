import UriTemplate from "../lib/UriTemplate.js";
import assert from 'assert';

describe('UriTemplate', () => {
    describe('match', () => {
        it('should match uri and return parameters', () => {
            const template = new UriTemplate('/a/{a}?{b}&{c}');
            const uri = '/a/123?b=bbb&c=ccc';
            const parameters = template.match(uri);
            assert.deepEqual(parameters, {
                a: '123',
                b: 'bbb',
                c: 'ccc'
            });
        });
    });

    describe('fill', () => {
        it('should return the uri filled with parameters', () => {
            const template = new UriTemplate('/a/{a}?{b}&{c}');
            const parameters = {
                a: 123,
                b: 'bbb',
                c: 'ccc'
            };
            const uri = template.fill(parameters);
            assert.equal(uri, '/a/123?b=bbb&c=ccc');
        });
    });
});