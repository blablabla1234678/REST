import {
    Engine
} from '../lib/Engine.js';
import assert from 'assert';

describe('Engine.process', () => {
    const engine = new Engine({
        init: function ({value, type, context}){
            return [];
        },
        task: function ({value, type, definition, result}){
            result.push(type);
        },
        nestedInit: function ({property, nestedValue, nestedType, nestedDefinition, result, taskResult}){
            return [];
        },
        nestedTask: function ({property, value, type, definition, result, nestedResult, taskResult}){
            result.push([property, nestedResult]);
        }
    });

    it('should process native types', () => {
        engine.context({});
        const result = engine.process("String", "example string");
        assert.deepEqual(result, ["String"]);
    });

    it('should process type chains', () => {
        engine.context({
            s: {
                type: "String"
            }
        });
        const result = engine.process("s", "example string");
        assert.deepEqual(result, ["s", "String"]);
    });

    it('should process object properties', () => {
        engine.context({
            s: {type: "String"},
            o: {
                type: "Object",
                items: {p: {type: "s"}}
            }
        });
        const result = engine.process("o", {items: {p:"example string"}});
        assert.deepEqual(result, ["o", "Object", ["p", ["s", "String"]]]);
    });

    it('should process nested objects', () => {
        engine.context({
            o1: {type: "o2"},
            o2: {type: "o3"},
            o3: {
                type: "Object",
                items: {
                    x: {type: "s"},
                    y: {type: "oo"}
                }
            },
            s: {type: "String"},
            oo: {
                type: "Object",
                items: {
                    p: {type: "s"}
                }
            }
        });
        const result = engine.process("o1", {
            items: {
                x: "example string", 
                y: {
                    items: {p:"example string"}
                }
            }
        });
        assert.deepEqual(result, [
            "o1", "o2", "o3", "Object", 
            ["x", ["s", "String"]],
            ["y", ["oo", "Object",
                ["p", ["s", "String"]]
            ]]
        ]);
    });

    it('should process arrays', () => {
        engine.context({
            s: {
                type: "String"
            },
            o: {
                type: "Object",
                items: {
                    p: {
                        type: "s"
                    }
                }
            },
            a: {
                type: "Array",
                items: {
                    type: "o"
                }
            }
        });
        const result = engine.process("a", {
            items: [
                {
                    items: {
                        p:"example string"
                    }
                },
                {
                    items: {
                        p:"example string"
                    }
                }
            ]
        });
        assert.deepEqual(result, [
            "a", "Array", 
            [0, ["o", "Object",
                ["p", ["s", "String"]]
            ]],
            [1, ["o", "Object",
                ["p", ["s", "String"]]
            ]]
        ]);
    });

    it('should prevent infinite loops by simple variables', () => {
        engine.context({
            l: {
                type: "l"
            }
        });
        assert.throws(() => engine.process("l", "example string"));
    });

    it('should not prevent infinite loops by object properties', () => {
        engine.context({
            l: {
                type: "Object",
                items: {
                    p: {
                        type: "l"
                    }
                }
            }
        });
        const result = engine.process("l", {
            items: {
                p: {
                    items: {
                        p: {}
                    }
                }
            }
        });
        assert.deepEqual(result, 
            ["l", "Object", [
                "p", ["l", "Object", [
                    "p", ["l", "Object"]
                ]]
            ]
        ]);
    });
});
