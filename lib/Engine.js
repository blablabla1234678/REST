export class Engine {
    constructor(settings){
        this.ctx = settings.context || {};
        this.initDefinitions = settings.initDefinitions;
        this.addDefinition = settings.addDefinition;
        this.mergeDefinitions = settings.mergeDefinitions;
        this.initProperty = settings.initProperty || settings.initDefinitions;
        this.mergeProperty = settings.mergeProperty;
        this.typeAliases = Object.create(typeAliases, settings.typeAliases);
        this.nativeTypes = Object.create(nativeTypes, settings.nativeTypes);
    }
    context(context){
        this.ctx = context;
    }
    process(definition, value){
        return this.processVariable(value, definition, {}, this.initDefinitions());
    }
    processVariable(value, definition, stack, result){
        const type = this.getType(definition.type);
        if (stack[type])
            throw new Error('Infinite loop');
        stack[type] = definition;
        let nextResult = this.addDefinition({
            value, 
            type,
            definition, 
            result
        });
        if (!this.isNativeType(type))
            nextResult = this.processVariable(value, this.ctx[type], stack, nextResult);
        else if (type === "Object" && value && value.items)
            this.processObject(value, stack, nextResult);
        else if (type === "Array" && value && value.items)
            this.processArray(value, stack, nextResult);
        else if (type === "Hyperlink" && value)
            this.processHyperlink(value, stack, nextResult);
        nextResult = this.mergeDefinitions({value, result:nextResult});
        return nextResult;
    }
    processObject(value, stack, result){
        for (let type in stack){
            let definition = stack[type];
            if (definition && definition.items)
                for (let property in definition.items)
                    this.processProperty(property, definition.items[property], value, result);
        }
    }
    processArray(value, stack, result){
        for (let type in stack){
            let definition = stack[type];
            if (definition && definition.items)
                for (let index = 0; index<value.items.length; ++index)
                    this.processProperty(index, definition.items, value, result);
        }
    }
    processHyperlink(value, stack, result){
        const properties = {
            request: true,
            response: true
        };
        for (let type in stack){
            let definition = stack[type];
            if (definition)
                for (let property in properties)
                    if (definition[property])
                        this.processProperty(property, definition[property], value, result);
        }
    }
    processProperty(property, nestedDefinition, value, result){
        let nestedValue;
        if (value.items)
            nestedValue = value.items[property];
        else if (value)
            nestedValue = value[property];
        let nestedResult = this.initProperty({
            result
        });
        this.processVariable(nestedValue, nestedDefinition, {}, nestedResult);
        this.mergeProperty({
            property,
            result,
            nestedResult
        });
    }
    getType(type){
        return this.typeAliases[type] || type;
    }
    isNativeType(type){
        return this.nativeTypes[this.getType(type)];
    }
    hasNativeType(value, type){
        const valueType = this.getType(typeof(value));
        type = this.getType(type);
        if (type === "Object")
            return valueType === "Object" && (value.items instanceof Object);
        else if (type === "Array")
            return valueType === "Object" && (value.items instanceof Array);
        else if (type === "Hyperlink")
            return valueType === "Object" && (value.request instanceof Object);
        else
            return type === valueType;
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