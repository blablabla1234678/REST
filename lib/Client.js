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
        const definition = this.parser.process(hyperlink.type);
        const mergedParameters = this.mergeParameters(hyperlink, parameters);
        const {uri,usedParameters} = this.fillUri(definition.uri, mergedParameters);
        const request = {
            method: definition.method,
            uri: uri,
            body: this.fillBody(mergedParameters, usedParameters)
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

    fillBody(mergedParameters, usedParameters){
        const body = {};
        for (let parameter in mergedParameters)
            if (!usedParameters[parameter])
                body[parameter] = mergedParameters[parameter];
        return body;
    }

    fillUri(uriTemplate, mergedParameters){
        const parameterPattern = /\{(\w+)\}/g;
        const usedParameters = {};
        let questionMarkPosition = uriTemplate.indexOf("?");
        if (questionMarkPosition === -1)
            questionMarkPosition = uriTemplate.length;
        const uri = uriTemplate.replace(parameterPattern, (match, parameter, offset) => {
            usedParameters[parameter] = true;
            if (offset < questionMarkPosition)
                return this.encodeUriPath(mergedParameters[parameter]);
            else
                return this.encodeUriQuery(mergedParameters[parameter], parameter);
        });
        return {uri,usedParameters};
    }

    encodeUriPath(value){
        return encodeURIComponent(value);
    }
    encodeUriQuery(value, parameter){
        return encodeURI(parameter)+"="+encodeURIComponent(value);
    }

}