var context = {
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
    String: {
        native: true
    },
    Object: {
        native: true
    }
};
var value = {
    items: {
        x: "a",
        y: {items: {p: "b"}}
    }
};

class Engine {
    constructor(context, task, objectTask){
        this.context = context;
        this.task = task;
        this.objectTask = objectTask;
    }
    process(value, type, result){
        var stack = {};
        this.processVariable(value, type, stack, result);
        return result;
    }
    processVariable(value, type, stack, result){
        const definition = this.context[type];
        if (stack[type])
            throw new Error('Infinite loop');
        stack[type] = definition;
        var taskResult = this.task(value, type, definition, result);
        if (!definition.native && definition.type)
            this.processVariable(value, definition.type, stack, result);
        else if (type === "Object")
            this.processObject(value, stack, result, taskResult);
    }
    processObject(value, stack, result, taskResult){
        for (var type in stack){
            var definition = stack[type];
            if (definition.items)
                for (var property in definition.items){
                    var nestedDefinition = definition.items[property];
                    var nestedValue;
                    if (value.items)
                        nestedValue = value.items[property];
                    var nestedResult = [];
                    this.processVariable(nestedValue, nestedDefinition.type, {}, nestedResult);
                    this.objectTask(property, nestedValue, nestedDefinition.type, nestedDefinition, result, nestedResult, taskResult);
                }
        }
    }
}

var engine = new Engine(
    context,
    function (value, type, definition, result){
        result.push(type);
    },
    function (property, value, type, definition, result, nestedResult, taskResult){
        result.push([property, nestedResult]);
    }
);
console.log(engine.process(value, "a", []));
