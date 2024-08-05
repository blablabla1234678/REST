import DocumentationParser from "./DocumentationParser.js";

export default class DocumentationIterator {
    constructor(){
        this.parser = new DocumentationParser();
    }
    context(context){
        this.parser.context(context);
    }
    iterate(type, callback){
        this.iterateNode([], this.parser.process(type), callback);
    }
    iterateNode(selector, definition, callback){
        const nativeType = definition.type[definition.type.length-1];
        callback(selector, definition);
        if (nativeType === "Object")
            for (let property in definition.items){
                let nestedSelector = [];
                nestedSelector.push(...selector);
                nestedSelector.push(property);
                this.iterateNode(nestedSelector, definition.items[property], callback);
            }
        else if (nativeType === "Array"){
            let nestedSelector = [];
            nestedSelector.push(...selector);
            nestedSelector.push("items");
            this.iterateNode(nestedSelector, definition.items, callback);
        }
        else if (nativeType === "Hyperlink"){
            let properties = {request: definition.request, response: definition.response};
            for (let property in properties){
                let nestedSelector = [];
                nestedSelector.push(...selector);
                nestedSelector.push(property);
                this.iterateNode(nestedSelector, properties[property], callback);
            }
        }
    }
}