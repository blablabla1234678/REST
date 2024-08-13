export default class UriTemplate {
    constructor(uriTemplate){
        this.uriTemplate = uriTemplate;
        const {slices,parameters} = new TemplateParser().parse(uriTemplate);
        this.slices = slices;
        this.params = parameters;
        this.pattern = new RegexBuilder().build(this.slices);
    }
    string(){
        return this.uriTemplate;
    }
    array(){
        return this.slices;
    }
    match(uri){
        const groups = this.parameters();
        const regex = this.regex();
        if (!regex.test(uri))
            return;
        const values = Array.from(uri.match(regex)).slice(1, groups.length+1);
        const parameters = {};
        for (let index in groups)
            parameters[groups[index]] = values[index];
        return parameters;
    }
    regex(){
        return this.pattern;
    }
    parameters(){
        return this.params;
    }
    fill(parameters){
        let uri = "";
        for (let slice of this.slices)
            if (typeof(slice) === "string")
                uri += slice;
            else if (slice.isQueryStart)
                uri += "?";
            else if (slice.isQueryParameter)
                uri += slice.parameter + "=" + encodeURIComponent(parameters[slice.parameter]);
            else
                uri += encodeURIComponent(parameters[slice.parameter]);
        return uri;
    }
    encodeUriPath(value){
        return encodeURIComponent(value);
    }
    encodeUriQuery(value, parameter){
        return encodeURI(parameter)+"="+encodeURIComponent(value);
    }
}

class RegexBuilder {
    build(slices){
        let pattern = "^";
        for (let slice of slices)
            if (typeof(slice) === "string")
                pattern += slice;
            else if (slice.isQueryStart)
                pattern += "\\?";
            else if (slice.isQueryParameter)
                pattern += slice.parameter + "=(\\w+)";
            else
                pattern += "(\\w+)";
        pattern += "$";
        const regex = new RegExp(pattern, "im");
        return regex;
    }
}

class TemplateParser {
    parse(uriTemplate){
        const parameterPattern = /\{(\w+)\}/img;
        let queryStart = uriTemplate.indexOf("?");
        if (queryStart === -1)
            queryStart = uriTemplate.length;
        const slices = [];
        const parameters = [];
        const matches = uriTemplate.matchAll(parameterPattern);
        let lastIndex = 0;
        for (let match of matches){
            if (lastIndex <= queryStart && match.index > queryStart){
                slices.push(uriTemplate.slice(lastIndex, queryStart));
                slices.push({
                    isQueryStart: true
                });
                slices.push(uriTemplate.slice(queryStart + 1, match.index));
            }
            else
                slices.push(uriTemplate.slice(lastIndex, match.index));
            slices.push({
                parameter: match[1],
                isQueryParameter: match.index > queryStart
            });
            parameters.push(match[1]);
            lastIndex = match.index + match[0].length;
        }
        slices.push(uriTemplate.slice(lastIndex));
        return {slices,parameters};
    }
}