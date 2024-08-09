import DocumentationIterator from "./DocumentationIterator.js";
import DocumentationParser from "./DocumentationParser.js";

export default class Service {
    constructor(serviceAdapter){
        this.serviceAdapter = serviceAdapter;
        this.callbacks = {};
    }

    register(type, callback){
        this.callbacks[type] = callback;
    }

    documentation(documentation){
        for (let type in documentation){
            let definition = documentation[type];
            if (definition.type === "Hyperlink")
                this.serviceAdapter.add(definition.method, definition.uri, ((type) => (request, parameters) => {
                    const callback = this.callbacks[type];
                    if (!callback)
                        throw new Error('404 - No callback for type: '+ type);
                    return callback(request, parameters);
                })(type));
        }
    }

    handle(request){
        return this.serviceAdapter.handle(request);
    }
}