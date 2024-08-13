export default class UriTemplate {
    constructor(uriTemplate){
        this.uriTemplate = uriTemplate;
    }
    string(){
        return this.uriTemplate;
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
        const parameterPattern = /\{(\w+)\}/img;
        let questionMarkPosition = this.uriTemplate.indexOf("?");
        if (questionMarkPosition === -1)
            questionMarkPosition = this.uriTemplate.length;
        const pattern = this.uriTemplate.replace(parameterPattern, (match, parameter, offset) => {
            if (offset < questionMarkPosition)
                return "(\\w+)";
            else
                return parameter + "=(\\w+)"
        }).replace(/([\/\?])/img, "\\$1");
        const regex = new RegExp("^"+pattern+"$", "im");
        return regex;
    }
    parameters(){
        const parameterPattern = /\{(\w+)\}/img;
        const groups = [];
        this.uriTemplate.replace(parameterPattern, (match, parameter, offset) => {
            groups.push(parameter);
        });
        return groups;
    }
    fill(parameters){
        const parameterPattern = /\{(\w+)\}/g;
        let questionMarkPosition = this.uriTemplate.indexOf("?");
        if (questionMarkPosition === -1)
            questionMarkPosition = this.uriTemplate.length;
        const uri = this.uriTemplate.replace(parameterPattern, (match, parameter, offset) => {
            if (offset < questionMarkPosition)
                return this.encodeUriPath(parameters[parameter]);
            else
                return this.encodeUriQuery(parameters[parameter], parameter);
        });
        return uri;
    }
    encodeUriPath(value){
        return encodeURIComponent(value);
    }
    encodeUriQuery(value, parameter){
        return encodeURI(parameter)+"="+encodeURIComponent(value);
    }
}