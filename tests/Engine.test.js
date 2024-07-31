import {
    Engine
} from '../lib/Engine.js';
import assert from 'assert';

describe('Engine.process', () => {
    const engine = new Engine({
        init: function (){
            return [];
        },
        task: function ({value, type, definition, result}){
            result.push(type);
        },
        nestedTask: function ({property, value, type, definition, result, nestedResult, taskResult}){
            result.push([property, nestedResult]);
        }
    });

    it('should process native types', () => {
        engine.context({});
        const result = engine.process("x", "String");
        assert.deepEqual(result, ["String"]);
    });

    it('should process type chains', () => {
        engine.context({
            s: {
                type: "String"
            }
        });
        const result = engine.process("x", "s");
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
        const result = engine.process({items: {p:"x"}}, "o");
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
        const result = engine.process({
            items: {
                x: "x", 
                y: {
                    items: {p:"y"}
                }
            }
        }, "o1");
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
        }, "a");
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
        assert.throws(() => engine.process("x", "l"));
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
        const result = engine.process({
            items: {
                p: {
                    items: {
                        p: {}
                    }
                }
            }
        }, "l");
        assert.deepEqual(result, 
            ["l", "Object", [
                "p", ["l", "Object", [
                    "p", ["l", "Object"]
                ]]
            ]
        ]);
    });
});
