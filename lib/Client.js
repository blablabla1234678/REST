import DocumentationParser from "./DocumentationParser.js";
import ValueIterator from "./ValueIterator.js";
import DocumentationIterator from "./DocumentationIterator.js"
import UriTemplate from "./UriTemplate.js";

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
        const definition = this.parser.process(hyperlink.type);
        const mergedParameters = this.mergeParameters(hyperlink, parameters);
        const uriTemplate = new UriTemplate(definition.uri);
        const uri = uriTemplate.fill(mergedParameters);
        const uriParameters = uriTemplate.parameters();
        const request = {
            method: definition.method,
            uri: uri,
            body: this.fillBody(mergedParameters, uriParameters)
        };
        const response = await this.requestFactory.send(request);
        return response;
    }

    mergeParameters(hyperlink, parameters){
        const mergedParameters = {};
        if (hyperlink.request)
            Object.assign(mergedParameters, hyperlink.request);
        if (parameters)
            Object.assign(mergedParameters, parameters);
        return mergedParameters;
    }

    fillBody(mergedParameters, uriParameters){
        const usedParameters = {};
        for (let parameter of uriParameters)
            usedParameters[parameter] = true;
        const body = {};
        for (let parameter in mergedParameters)
            if (!usedParameters[parameter])
                body[parameter] = mergedParameters[parameter];
        return body;
    }
}
