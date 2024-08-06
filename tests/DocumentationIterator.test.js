import DocumentationIterator from '../lib/DocumentationIterator.js';
import assert from 'assert';

describe('DocumentationIterator.iterate', () => {
    const iterator = new DocumentationIterator();

    it('should iterate native types', () => {
        iterator.context({});
        const result = [];
        iterator.iterate("String", (selector, definition) => {
            result.push({selector, type: definition.type});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["String"]}
        ]);
    });

    it('should iterate object properties', () => {
        iterator.context({
            o: {
                type: "Object",
                items: {
                    p: {
                        type: "Object",
                        items: {
                            q: {type: "String"},
                            r: {type: "Number"}
                        }
                    }
                }
            }
        });
        const result = [];
        iterator.iterate("o", (selector, definition) => {
            result.push({selector, type: definition.type});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["o", "Object"]},
            {selector: ["p"], type: ["Object"]},
            {selector: ["p", "q"], type: ["String"]},
            {selector: ["p", "r"], type: ["Number"]}
        ]);
    });

    it('should iterate array items', () => {
        iterator.context({
            a: {
                type: "Array",
                items: {type: "aa"}
            },
            aa: {
                type: "Array",
                items: {type: "Number"}
            }
        });
        const result = [];
        iterator.iterate("a", (selector, definition) => {
            result.push({selector, type: definition.type});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["a", "Array"]},
            {selector: ["items"], type: ["aa", "Array"]},
            {selector: ["items", "items"], type: ["Number"]}
        ]);
    });

    it('should iterate hyperlink request and response', () => {
        iterator.context({
            h: {
                type: "Hyperlink",
                method: "get",
                uri: "/x/{id}",
                request: {
                    type: "Object",
                    items: {
                        id: {type: "Number"}
                    }
                },
                response: {
                    type: "x"
                }
            },
            x: {
                type: "Object",
                items: {
                    a: {type: "String"},
                    b: {type: "Number"},
                    c: {type: "Pattern"}
                }
            }
        });
        const result = [];
        iterator.iterate("h", (selector, definition) => {
            result.push({selector, type: definition.type});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["h", "Hyperlink"]},
            {selector: ["request"], type: ["Object"]},
            {selector: ["request", "id"], type: ["Number"]},
            {selector: ["response"], type: ["x", "Object"]},
            {selector: ["response", "a"], type: ["String"]},
            {selector: ["response", "b"], type: ["Number"]},
            {selector: ["response", "c"], type: ["Pattern"]}
        ]);
    });
});