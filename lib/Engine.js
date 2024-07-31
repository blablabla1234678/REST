export class Engine {
    constructor(context, task, objectTask){
        this.context = context;
        this.task = task;
        this.objectTask = objectTask;
    }
    process(value, type, result){
        const stack = {};
        this.processVariable(value, this.getType(type), stack, result);
        return result;
    }
    processVariable(value, type, stack, result){
        const definition = this.context[type];
        if (stack[type])
            throw new Error('Infinite loop');
        stack[type] = definition;
        const taskResult = this.task(value, type, definition, result);
        if (!this.isNativeType(type))
            this.processVariable(value, this.getType(definition.type), stack, result);
        else if (type === "Object" && value && value.items)
            this.processObject(value, stack, result, taskResult);
        else if (type === "Array" && value && value.items)
            this.processArray(value, stack, result, taskResult);

    }
    processObject(value, stack, result, taskResult){
        for (let type in stack){
            let definition = stack[type];
            if (definition && definition.items)
                for (let property in definition.items){
                    let nestedDefinition = definition.items[property];
                    let nestedType = this.getType(nestedDefinition.type);
                    let nestedValue;
                    if (value.items)
                        nestedValue = value.items[property];
                    let nestedResult = [];
                    this.processVariable(nestedValue, nestedType, {}, nestedResult);
                    this.objectTask(property, nestedValue, nestedType, nestedDefinition, result, nestedResult, taskResult);
                }
        }
    }
    processArray(value, stack, result, taskResult){
        for (let type in stack){
            let definition = stack[type];
            if (definition && definition.items){
                let nestedDefinition = stack[type].items;
                let nestedType = this.getType(nestedDefinition.type);
                for (let index = 0; index<value.items.length; ++index){
                    let nestedValue = value.items[index];
                    let nestedResult = [];
                    this.processVariable(nestedValue, nestedType, {}, nestedResult);
                    this.objectTask(index, nestedValue, nestedType, nestedDefinition, result, nestedResult, taskResult);
                }
            }
        }
    }
    getType(type){
        return typeAliases[type] || type;
    }
    isNativeType(type){
        return !!typeAliases[type];
    }
}

const typeAliases = {
    string: "String",
    String: "String",
    str: "String",
    Text: "String",
    text: "String",
    number: "Number",
    Number: "Number",
    numeric: "Number",
    num: "Number",
    boolean: "Boolean",
    Boolean: "Boolean",
    bool: "Boolean",
    Undefined: "Undefined",
    undefined: "Undefined",
    Null: "Undefined",
    null: "Undefined",
    Pattern: "Pattern",
    pattern: "Pattern",
    RegExp: "Pattern",
    regexp: "Pattern",
    Regex: "Pattern",
    regex: "Pattern",
    Date: "Date",
    date: "Date",
    DateTime: "Date",
    datetime: "Date",
    Array: "Array",
    array: "Array",
    Object: "Object",
    object: "Object",
    Obj: "Object",
    obj: "Object"
};