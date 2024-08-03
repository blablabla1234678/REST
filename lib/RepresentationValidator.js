import { Engine } from "./Engine.js";

export class RepresentationValidator {
    constructor(){
        this.engine = new Engine({
            initDefinitions: function (){
                return [];
            },
            addDefinition: ({value, type, definition, result}) => {
                const validationResult = this.validateVariable({value, type, definition});
                result.push(...validationResult);
                return result;
            },
            mergeDefinitions: function ({value, result}){
                return result;
            },
            initProperty: function (){
                return [];
            },
            mergeProperty: function ({property, result, nestedResult}){
                result.push(...nestedResult);
                return result;
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
            if (!this.engine.hasNativeType(value, type))
                return [{message: `Value must be a ${type}.`}];
        }
        return [];
    }
}