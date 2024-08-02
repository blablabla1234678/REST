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
    process(definition, value){
        return this.processVariable(value, definition, {}, this.init());
    }
    processVariable(value, definition, stack, result){
        const type = this.getType(definition.type);
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
            this.processVariable(value, this.ctx[type], stack, result);
        else if (type === "Object" && value && value.items)
            this.processObject(value, stack, result, taskResult);
        else if (type === "Array" && value && value.items)
            this.processArray(value, stack, result, taskResult);
        else if (type === "Hyperlink" && value)
            this.processHyperlink(value, stack, result, taskResult);
       return result;
    }
    processObject(value, stack, result, taskResult){
        for (let type in stack){
            let definition = stack[type];
            if (definition && definition.items)
                for (let property in definition.items)
                    this.processProperty(property, definition.items[property], value, result, taskResult);
        }
    }
    processArray(value, stack, result, taskResult){
        for (let type in stack){
            let definition = stack[type];
            if (definition && definition.items)
                for (let index = 0; index<value.items.length; ++index)
                    this.processProperty(index, definition.items, value, result, taskResult);
        }
    }
    processHyperlink(value, stack, result, taskResult){
        const properties = {
            request: true,
            response: true
        };
        for (let type in stack){
            let definition = stack[type];
            if (definition)
                for (let property in properties)
                    if (definition[property])
                        this.processProperty(property, definition[property], value, result, taskResult);
        }
    }
    processProperty(property, nestedDefinition, value, result, taskResult){
        let nestedValue;
        if (value.items)
            nestedValue = value.items[property];
        else if (value)
            nestedValue = value[property];
        let nestedResult = this.nestedInit({
            result
        });
        this.processVariable(nestedValue, nestedDefinition, {}, nestedResult);
        this.nestedTask({
            property,
            result,
            nestedResult,
            taskResult
        });
    }
    getType(type){
        return this.typeAliases[type] || type;
    }
    isNativeType(type){
        return this.nativeTypes[this.getType(type)];
    }
    valueType(value){
        return this.getType(typeof(value));
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
    obj: "Object",
    Hyperlink: "Hyperlink",
    hyperlink: "Hyperlink",
    Link: "Hyperlink",
    link: "Hyperlink"
};

const nativeTypes = {
    String: true,
    Number: true,
    Boolean: true,
    Undefined: true,
    Pattern: true,
    Date: true,
    Array: true,
    Object: true,
    Hyperlink: true
};