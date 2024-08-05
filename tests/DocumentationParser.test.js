import DocumentationParser from '../lib/DocumentationParser.js';
import assert from 'assert';

describe('DocumentationParser.process', () => {
    const parser = new DocumentationParser();

    it('should process native types', () => {
        parser.context({});
        const result = parser.process("String");
        assert.deepEqual(result, {type: ["String"]});
    });

    it('should process native complex types', () => {
        parser.context({
            "o": {
                type: "Object",
                items: {
                    a: {
                        type: "String"
                    }
                }
            }
        });
        const result = parser.process("o");
        assert.deepEqual(result, {type:["o", "Object"], items: {a: {type: ["String"]}}});
    });

    it('should process type chains', () => {
        parser.context({
            s: {
                type: "String"
            }
        });
        const result = parser.process("s");
        assert.deepEqual(result, {type:["s", "String"]});
    });

    it('should process object properties', () => {
        parser.context({
            s: {type: "String"},
            o: {
                type: "Object",
                items: {p: {type: "s"}}
            }
        });
        const result = parser.process("o");
        assert.deepEqual(result, {type:["o", "Object"], items: {p: {type: ["s", "String"]}}});
    });

    it('should process nested objects', () => {
        parser.context({
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
        const result = parser.process("o1");
        assert.deepEqual(result, {
            type: ["o1", "o2", "o3", "Object"],
            items: {
                x: {type: ["s", "String"]},
                y: {
                    type: ["oo", "Object"],
                    items: {
                        p: {type: ["s", "String"]}
                    }
                }
            }
        });
    });

    it('should process nested objects without naming the nested type', () => {
        parser.context({
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
        const result = parser.process("o");
        assert.deepEqual(result, {
            type: ["o", "Object"],
            items: {
                x: {type: ["String"]},
                y: {
                    type: ["Object"],
                    items: {
                        p: {type: ["String"]}
                    }
                }
            }
        });
    });

    it('should process properties defined in multiple types', () => {
        parser.context({
            o: {
                type: "oo",
                items: {
                    x: {
                        type: "String",
                        min: 1
                    }
                }
            },
            oo: {
                type: "ooo",
                items: {
                    y: {
                        type: "Number",
                        min: 0
                    }
                }
            },
            ooo: {
                type: "Object",
                items: {
                    x: {
                        max: 127
                    },
                    y: {
                        max: 255
                    }
                }
            }
        });

        const result = parser.process("o", {
            items: {
                x: "example string",
                y: 123
            }
        });
        assert.deepEqual(result, {
            type: ["o", "oo", "ooo", "Object"],
            items: {
                x: {
                    type: ["String"],
                    min: 1,
                    max: 127
                },
                y: {
                    type: ["Number"],
                    min: 0,
                    max: 255
                }
            }
        });
    });

    it('should process arrays', () => {
        parser.context({
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
        const result = parser.process("a");
        assert.deepEqual(result, {
            type: ["a", "Array"],
            items: {
                type: ["o", "Object"],
                items: {
                    p: {type: ["s", "String"]}
                }
            }
        });
    });
    it('should prevent infinite loops by simple variables', () => {
        parser.context({
            l: {
                type: "l"
            }
        });
        assert.throws(() => parser.process("l"));
    });

    it('should prevent infinite loops by object properties', () => {
        parser.context({
            l: {
                type: "Object",
                items: {
                    p: {
                        type: "l"
                    }
                }
            }
        });
        assert.throws(() => parser.process("l"));
    });

    it('should process hyperlinks', () => {
        parser.context({
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
        const result = parser.process("listPeople");
        assert.deepEqual(result, {
            type: ["listPeople", "Hyperlink"],
            uri: "/people?{page}",
            method: "get",
            request: {
                type: ["Object"],
                items: {
                    page: {type: ["Number"]}
                }
            },
            response: {
                type: ["Array"],
                items: {
                    type: ["Person", "Object"],
                    items: {
                        name: {type: ["String"]}
                    }
                }
            }
        });
    });
});
