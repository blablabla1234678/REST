export default class RepresentationParser {
    constructor(){
        this.log = [];
    }
    parse(json){
        if (json.type !== undefined)
            this.logIfViolated(new TypeConstraint(json.type).check(json, [], json));
        this.raiseIfAnyViolated();
        return json;
    }

    logIfViolated(failure){
        if (failure)
            this.log.push(failure);
    }

    raiseIfAnyViolated(){
        if (!this.log.length)
            return;
        const log = this.log;
        this.log = [];
        throw new ValidationError(log);
    }
}

class TypeConstraint {
    constructor(type){
        const aliases = {
            String: "string",
            str: "string",
            Text: "string",
            text: "string",
            Number: "number",
            numeric: "number",
            num: "number",
            Boolean: "boolean",
            bool: "boolean"
        };
        if (type in aliases)
            this.type = aliases[type];
        else
            this.type = type;
    }
    check(node, selector, document){
        const valueType = this.getType(node.value);
        if (valueType === "undefined" || valueType === "null")
            return;
        if (this.type !== valueType)
            return new ConstraintViolation(selector, `Type must be a ${this.type}.`);
    }
    getType(value){
        if (value === null)
            return "null";
        else
            return typeof(value);
    }
}

class ConstraintViolation {
    constructor(selector, message){
        this.selector = selector;
        this.message = message;
    }
}

class ValidationError extends Error {
    constructor(log) {
        const message = 'Invalid document.';
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function')
            Error.captureStackTrace(this, this.constructor);
        else
            this.stack = (new Error(message)).stack; 
        this.log = log;
    }

    getConstraintViolations(){
        return this.log;
    }
}