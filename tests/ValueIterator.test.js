import ValueIterator from '../lib/ValueIterator.js';
import assert from 'assert';

describe('DocumentationIterator.iterate', () => {
    const iterator = new ValueIterator();

    it('should iterate native types', () => {
        iterator.context({});
        const result = [];
        const value = "example string";
        iterator.iterate("String", value, (selector, definition, value) => {
            result.push({selector, type: definition.type, value});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["String"], value: "example string"}
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
        const value = {
            items: {
                p: {
                    items: {
                        q: "example string",
                        r: 123
                    }
                }
            }
        };
        iterator.iterate("o", value, (selector, definition, value) => {
            result.push({selector, type: definition.type, value});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["o", "Object"], value: value},
            {selector: ["p"], type: ["Object"], value: value.items.p},
            {selector: ["p", "q"], type: ["String"], value: "example string"},
            {selector: ["p", "r"], type: ["Number"], value: 123}
        ]);
    });

    it('should iterate flat object properties', () => {
        iterator.context({
            o: {
                type: "FlatObject",
                items: {
                    p: {
                        type: "FlatObject",
                        items: {
                            q: {type: "String"},
                            r: {type: "Number"}
                        }
                    }
                }
            }
        });
        const result = [];
        const value = {
            p: {
                q: "example string",
                r: 123
            }
        };
        iterator.iterate("o", value, (selector, definition, value) => {
            result.push({selector, type: definition.type, value});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["o", "FlatObject"], value: value},
            {selector: ["p"], type: ["FlatObject"], value: value.p},
            {selector: ["p", "q"], type: ["String"], value: "example string"},
            {selector: ["p", "r"], type: ["Number"], value: 123}
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
        const value = {items: [
            {items: [1,2,3]},
            {items: [4,5,6]}
        ]};
        iterator.iterate("a", value, (selector, definition, value) => {
            result.push({selector, type: definition.type, value});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["a", "Array"], value: value},
            {selector: [0], type: ["aa", "Array"], value: value.items[0]},
            {selector: [0, 0], type: ["Number"], value: 1},
            {selector: [0, 1], type: ["Number"], value: 2},
            {selector: [0, 2], type: ["Number"], value: 3},
            {selector: [1], type: ["aa", "Array"], value: value.items[1]},
            {selector: [1, 0], type: ["Number"], value: 4},
            {selector: [1, 1], type: ["Number"], value: 5},
            {selector: [1, 2], type: ["Number"], value: 6}
        ]);
    });

    it('should iterate flat array items', () => {
        iterator.context({
            a: {
                type: "FlatArray",
                items: {type: "aa"}
            },
            aa: {
                type: "FlatArray",
                items: {type: "Number"}
            }
        });
        const result = [];
        const value = [
            [1,2,3],
            [4,5,6]
        ];
        iterator.iterate("a", value, (selector, definition, value) => {
            result.push({selector, type: definition.type, value});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["a", "FlatArray"], value: value},
            {selector: [0], type: ["aa", "FlatArray"], value: value[0]},
            {selector: [0, 0], type: ["Number"], value: 1},
            {selector: [0, 1], type: ["Number"], value: 2},
            {selector: [0, 2], type: ["Number"], value: 3},
            {selector: [1], type: ["aa", "FlatArray"], value: value[1]},
            {selector: [1, 0], type: ["Number"], value: 4},
            {selector: [1, 1], type: ["Number"], value: 5},
            {selector: [1, 2], type: ["Number"], value: 6}
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
        const value = {
            request: {
                items: {id: 123}
            },
            response: {
                items: {
                    a: "example string",
                    b: 123,
                    c: /abc/g
                }
            }
        };
        iterator.iterate("h", value, (selector, definition, value) => {
            result.push({selector, type: definition.type, value});
        });
        assert.deepEqual(result, [
            {selector: [], type: ["h", "Hyperlink"], value: value},
            {selector: ["request"], type: ["Object"], value: value.request},
            {selector: ["request", "id"], type: ["Number"], value: 123},
            {selector: ["response"], type: ["x", "Object"], value: value.response},
            {selector: ["response", "a"], type: ["String"], value: "example string"},
            {selector: ["response", "b"], type: ["Number"], value: 123},
            {selector: ["response", "c"], type: ["Pattern"], value: value.response.items.c}
        ]);
    });
});