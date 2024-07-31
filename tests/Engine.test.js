import {
    Engine
} from '../lib/Engine.js';
import assert from 'assert';

describe('Engine.process', () => {

    const context = {
        a: {
            type: "b"
        },
        b: {
            type: "c"
        },
        c: {
            type: "Object",
            items: {
                x: {
                    type: "d"
                },
                y: {
                    type: "e"
                }
            }
        },
        d: {
            type: "String"
        },
        e: {
            type: "Object",
            items: {
                p: {
                    type: "d"
                }
            }
        },
        f: {
            type: "Array",
            items: {
                type: "e"
            }
        },
        g: {
            type: "g"
        },
        h: {
            type: "Object",
            items: {
                i: {
                    type: "h"
                }
            }
        }
    };
    const engine = new Engine(
        context,
        function (value, type, definition, result){
            result.push(type);
        },
        function (property, value, type, definition, result, nestedResult, taskResult){
            result.push([property, nestedResult]);
        }
    );

    it('should process native types', () => {
        const result = engine.process("x", "String", []);
        assert.deepEqual(result, ["String"]);
    });

    it('should process type chains', () => {
        const result = engine.process("x", "d", []);
        assert.deepEqual(result, ["d", "String"]);
    });

    it('should process object properties', () => {
        const result = engine.process({items: {p:"x"}}, "e", []);
        assert.deepEqual(result, ["e", "Object", ["p", ["d", "String"]]]);
    });

    it('should process nested objects', () => {
        const result = engine.process({
            items: {
                x: "x", 
                y: {
                    items: {
                        p:"y"
                    }
                }
            }
        }, "a", []);
        assert.deepEqual(result, [
            "a", "b", "c", "Object", 
            ["x", ["d", "String"]],
            ["y", ["e", "Object",
                ["p", ["d", "String"]]
            ]]
        ]);
    });

    it('should process arrays', () => {
        const result = engine.process({
            items: [
                {
                    items: {
                        p:"y"
                    }
                },
                {
                    items: {
                        p:"z"
                    }
                }
            ]
        }, "f", []);
        assert.deepEqual(result, [
            "f", "Array", 
            [0, ["e", "Object",
                ["p", ["d", "String"]]
            ]],
            [1, ["e", "Object",
                ["p", ["d", "String"]]
            ]]
        ]);
    });

    it('should prevent infinite loops by simple variables', () => {
        assert.throws(() => engine.process("x", "g", []));
    });

    it('should not prevent infinite loops by properties', () => {
        const result = engine.process({
            items: {
                i: {}
            }
        }, "h", []);
        assert.deepEqual(result, [
            "h", "Object",
            [
                "i", ["h", "Object"]
            ]
        ]);
    });
});
