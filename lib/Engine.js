export class Engine {
    constructor(settings){
        this.ctx = settings.context || {};
        this.init = settings.init;
        this.nestedInit = settings.nestedInit || settings.init;
        this.task = settings.task;
        this.nestedTask = settings.nestedTask;
        this.typeAliases = Object.create(typeAliases, settings.typeAliases);
        this.nativeTypes = Object.create(nativeTypes, settings.nativeTypes);
    }
    context(context){
        this.ctx = context;
    }
    process(type, value){
        const stack = {};
        const result = this.init({value, type, context: this.ctx});
        this.processVariable(value, this.getType(type), stack, result);
        return result;
    }
    processVariable(value, type, stack, result){
        const definition = this.ctx[type];
        if (stack[type])
            throw new Error('Infinite loop');
        stack[type] = definition;
        const taskResult = this.task({
            value, 
            type, 
            definition, 
            result
        });
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
                    let nestedResult = this.nestedInit({
                        property, 
                        nestedValue, 
                        nestedType, 
                        nestedDefinition, 
                        result,
                        taskResult
                    });
                    this.processVariable(nestedValue, nestedType, {}, nestedResult);
                    this.nestedTask({
                        property, 
                        nestedValue, 
                        nestedType, 
                        nestedDefinition, 
                        result, 
                        nestedResult, 
                        taskResult
                    });
                }
        }
    }
    processArray(value, stack, result, taskResult){
        for (let type in stack){
            let definition = stack[type];
            if (definition && definition.items){
                let nestedDefinition = stack[type].items;
                let nestedType = this.getType(nestedDefinition.type);
                for (let property = 0; property<value.items.length; ++property){
                    let nestedValue = value.items[property];
                    let nestedResult = this.nestedInit({
                        property, 
                        nestedValue, 
                        nestedType, 
                        nestedDefinition, 
                        result,
                        taskResult
                    });
                    this.processVariable(nestedValue, nestedType, {}, nestedResult);
                    this.nestedTask({
                        property, 
                        nestedValue, 
                        nestedType, 
                        nestedDefinition, 
                        result, 
                        nestedResult, 
                        taskResult
                    });
                }
            }
        }
    }
    getType(type){
        return this.typeAliases[type] || type;
    }
    isNativeType(type){
        return this.nativeTypes[this.getType(type)];
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
    Arr: "Array",
    arr: "Array",
    Object: "Object",
    object: "Object",
    Obj: "Object",
    obj: "Object"
};

const nativeTypes = {
    String: true,
    Number: true,
    Boolean: true,
    Undefined: true,
    Pattern: true,
    Date: true,
    Array: true,
    Object: true
};