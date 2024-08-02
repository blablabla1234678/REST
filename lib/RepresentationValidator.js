import { Engine } from "./Engine.js";

export class RepresentationValidator {
    constructor(){
        this.engine = new Engine({
            init: function (){
                return [];
            },
            task: ({value, type, definition, result}) => {
                const taskResult = this.validateVariable({value, type, definition});
                result.push(...taskResult);
                return taskResult;
            },
            nestedInit: function ({result}){
                return result;
            },
            nestedTask: function ({property, result, nestedResult, taskResult}){
            }
        });
    }

    documentation(documentation){
        this.engine.context(documentation);
    }

    validate(definition, value){
        return this.engine.process(definition, value);
    }

    validateVariable({value, type, definition}){
        if (this.engine.isNativeType(type)){
            const valueType = this.engine.valueType(value);
            if (type === "String"){
                if (valueType !== "String")
                    return [{message: "Value must be a string."}];
            }
        }
        return [];
    }
}