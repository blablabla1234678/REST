export class DocumentationParser {
    parse(documentation){
        const context = {};
        for (let type in documentation)
            context[type] = this.parseVariable([], documentation[type], context);
        return context;
    }

    parseVariable(selector, variable, context){
        const constraints = [];
        if (variable.required)
            constraints.push(new RequiredConstraint(selector));
        const typeConstraint = new TypeConstraint(selector, variable.type, context);
        constraints.push(typeConstraint);
        if (variable.hasOwnProperty("length"))
            constraints.push(new StringLengthConstraint(selector, variable.length));
        if (variable.hasOwnProperty("range"))
            constraints.push(new NumberRangeConstraint(selector, variable.range));
        return constraints;
    }
}



export class RequiredConstraint {
    constructor(selector){
        this.selector = selector;
    }
    check(value){
        if (value === undefined || value === null)
            return new ConstraintViolation(this.selector, "The value is required, but undefined.");
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
    List: "Array",
    list: "Array",
    Object: "Object",
    object: "Object",
    Obj: "Object",
    obj: "Object",
    Map: "Object",
    map: "Object"
};

export class TypeConstraint {
    constructor(selector, type, context){
        this.selector = selector;
        this.type = typeAliases[type] || type;
        this.isNative = !!typeAliases[type];
        this.context = context;
    }
    check(value){
        if (this.isNative){
            const type = this.getType(value);
            if (type !== this.type)
                return new ConstraintViolation(this.selector, `Type must be ${this.type}.`);
        }
        else {
            const constraints = this.context[this.type];
            for (let constraint of constraints){
                constraint.check(value);
                // needs selector here
            }
                
        }
    }
    getType(value){
        const type = typeof(value);
        if (type !== "object")
            return typeAliases[type];
        else if (value === null)
            return "Undefined";
        else if (value instanceof RegExp)
            return "Pattern";
        else if (value instanceof Date)
            return "Date";
        else if (value.items instanceof Array)
            return "Array";
        else
            return "Object";
    }
}

export class StringLengthConstraint {
    constructor(selector, length){
        this.selector = selector;
        if (typeof(length) === "number"){
            this.min = length;
            this.max = length;
        }
        else {
            this.min = length[0];
            this.max = length[1];
        }
    }

    check(value){
        if (value.length > this.max || value.length < this.min)
            return new ConstraintViolation(this.selector, `String length must be in the range ${this.min}-${this.max}.`);
    }
}

export class NumberRangeConstraint {
    constructor(selector, range){
        this.selector = selector;
        if (typeof(range) === "number"){
            this.min = range
            this.max = range;
        }
        else {
            this.min = range[0];
            this.max = range[1];
        }
    }

    check(value){
        if (value > this.max || value < this.min)
            return new ConstraintViolation(this.selector, `Number must be in the range ${this.min}-${this.max}.`);
    }
}

export class ConstraintViolation {
    constructor(selector, message){
        this.selector = selector;
        this.message = message;
    }
}

export class ValidationError extends Error {
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