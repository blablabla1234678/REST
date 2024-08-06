import DocumentationParser from "./DocumentationParser.js";

export default class ValueIterator {
    constructor(){
        this.parser = new DocumentationParser();
    }
    context(context){
        this.parser.context(context);
    }
    iterate(type, value, callback){
        this.iterateNode([], this.parser.process(type), value, callback);
    }
    iterateNode(selector, definition, value, callback){
        callback(selector, definition, value);
        const nativeType = definition.type[definition.type.length-1];
        if (nativeType === "Object" && value.items)
            for (let property in definition.items)
                this.iterateNode(
                    this.pushSelector(selector, property), 
                    definition.items[property], 
                    value.items[property], 
                    callback
                );
        else if (nativeType === "Array" && value.items){
            for (let index = 0; index<value.items.length; ++index)
                this.iterateNode(
                    this.pushSelector(selector, index), 
                    definition.items, 
                    value.items[index], 
                    callback
                );
        }
        else if (nativeType === "Hyperlink"){
            let properties = {request: definition.request, response: definition.response};
            for (let property in properties)
                this.iterateNode(
                    this.pushSelector(selector, property), 
                    properties[property], 
                    value[property], 
                    callback
                );
        }
    }
    pushSelector(selector, property){
        let nestedSelector = [];
        nestedSelector.push(...selector);
        nestedSelector.push(property);
        return nestedSelector;
    }
}