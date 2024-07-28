export class RepresentationParser {
    parse(json){
        this.selector = [];
        this.node = json;
        this.constraints = [];
        this.parseNode();
        return this.constraints;
    }

    parseNode(){
        if (this.node.required)
            this.push(new RequiredConstraint(this.selector));
        if (this.node.type)
            this.push(new TypeConstraint(this.selector, typeAliases[this.node.type]));
        if (this.node.hasOwnProperty("length"))
            this.push(new StringLengthConstraint(this.selector, this.node.length));
        if (this.node.hasOwnProperty("value"))
            this.push(new ValueConstraint(this.selector, this.node.value));
    }

    push(constraint){
        this.constraints.push(constraint);
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

const typeAliases = {
    string: "string",
    String: "string",
    str: "string",
    Text: "string",
    text: "string",
    number: "number",
    Number: "number",
    numeric: "number",
    num: "number",
    boolean: "boolean",
    Boolean: "boolean",
    bool: "boolean"
};

export class TypeConstraint {
    constructor(selector, type){
        this.selector = selector;
        this.type = type;
    }
    check(value){
        const type = this.getType(value);
        if (type === "undefined")
            return;
        else if (this.type !== type)
            return new ConstraintViolation(this.selector, `Type must be ${this.type}.`);
    }
    getType(value){
        if (value === null)
            return "undefined";
        else
            return typeof(value);
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

export class ValueConstraint {
    constructor(selector, value){
        this.selector = selector;
        this.value = value;
    }
    check(value){
        if (value !== this.value)
            return new ConstraintViolation(this.selector, `The value must be ${JSON.stringify(this.value)}.`);
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