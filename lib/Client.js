import DocumentationParser from "./DocumentationParser.js";
import ValueIterator from "./ValueIterator.js";
import DocumentationIterator from "./DocumentationIterator.js"

export default class Client {
    constructor(requestFactory){
        this.requestFactory = requestFactory;
        this.parser = new DocumentationParser();
    }
    async documentation(uri){
        const response = await this.requestFactory.send({method: "get", uri});
        this.parser.context(response);
    }
    async follow(hyperlink, parameters){
        const link = this.parser.process(hyperlink.type);
        const response = await this.requestFactory.send(link.request);
        return response;
    }

}