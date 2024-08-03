import {
    Engine
} from '../lib/Engine.js';
import assert from 'assert';

describe('Engine.process', () => {
    const engine = new Engine({
        initDefinitions: function (){
            return [];
        },
        addDefinition: function ({value, type, definition, result}){
            result.push(type);
            return result;
        },
        mergeDefinitions: function ({value, result}){
            return result;
        },
        initProperty: function (){
            return [];
        },
        mergeProperty: function ({property, result, nestedResult}){
            result.push([property, nestedResult]);
            return result;
        }
    });

    it('should process native types', () => {
        engine.context({});
        const result = engine.process({type: "String"}, "example string");
        assert.deepEqual(result, ["String"]);
    });

    it('should process native complex types', () => {
        engine.context({
            "o": {
                type: "Object",
                items: {
                    a: {
                        type: "String"
                    }
                }
            }
        });
        const result = engine.process({type: "o"}, {items:{a:"example string"}});
        assert.deepEqual(result, ["o", "Object", ["a", ["String"]]]);
    });

    it('should process type chains', () => {
        engine.context({
            s: {
                type: "String"
            }
        });
        const result = engine.process({type: "s"}, "example string");
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
        const result = engine.process({type: "o"}, {items: {p:"example string"}});
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
        const result = engine.process({type: "o1"}, {
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

    it('should process nested objects without naming the nested type', () => {
        engine.context({
            o: {
                type: "Object",
                items: {
                    x: {type: "String"},
                    y: {
                        type: "Object",
                        items: {
                            p: {type: "String"}
                        }
                    }
                }
            }
        });
        const result = engine.process({type: "o"}, {
            items: {
                x: "example string", 
                y: {
                    items: {p:"example string"}
                }
            }
        });
        assert.deepEqual(result, [
            "o", "Object", 
            ["x", ["String"]],
            ["y", ["Object",
                ["p", ["String"]]
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
        const result = engine.process({type: "a"}, {
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
        assert.throws(() => engine.process({type: "l"}, "example string"));
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
        const result = engine.process({type: "l"}, {
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

    it('should process hyperlinks', () => {
        engine.context({
            listPeople: {
                type: "Hyperlink",
                uri: "/people?{page}",
                method: "get",
                request: {
                    type: "Object",
                    items: {
                        page: {
                            type: "Number"
                        }
                    }
                },
                response: {
                    type: "Array",
                    items: {
                        type: "Person"
                    }
                }
            },
            Person: {
                type: "Object",
                items: {
                    name: {
                        type: "String"
                    }
                }
            }
        });
        const result = engine.process({type: "listPeople"}, {
            type: "listPeople",
            request: {
                items: {
                    page: 12
                }
            }
        });
        assert.deepEqual(result, 
            ["listPeople", "Hyperlink", 
                [
                    "request", ["Object", [
                        "page", ["Number"]
                    ]]
                ],
                [
                    "response", ["Array"]
                ]
            ]
        );
    });
});
