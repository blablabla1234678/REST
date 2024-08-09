export default class MockServiceAdapter {
    constructor(){
        this.uriTemplates = {};
        this.routes = {};
    }
    add(method, uriTemplate, callback){
        const key = method.toUpperCase()+" "+uriTemplate;
        this.routes[key] = callback;
        const parameterPattern = /\{(\w+)\}/img;
        const groups = [];
        let questionMarkPosition = uriTemplate.indexOf("?");
        if (questionMarkPosition === -1)
            questionMarkPosition = uriTemplate.length;
        const pattern = uriTemplate.replace(parameterPattern, (match, parameter, offset) => {
            groups.push(parameter);
            if (offset < questionMarkPosition)
                return "(\\w+)";
            else
                return parameter + "=(\\w+)"
        }).replace(/([\/\?])/img, "\\$1");
        const regex = new RegExp("^"+pattern+"$", "im");
        this.uriTemplates[uriTemplate] = {regex,groups};
    }
    handle(request){
        const method = request.method.toUpperCase();
        let actualTemplate;
        let actualRegex;
        let actualGroups;
        for (let uriTemplate in this.uriTemplates){
            let {regex,groups} = this.uriTemplates[uriTemplate];
            if (regex.test(request.uri)){
                actualTemplate = uriTemplate;
                actualRegex = regex;
                actualGroups = groups;
                break;
            }
        }
        if (!actualTemplate)
            throw new Error('404 - Not found: ' + method + " " + request.uri);
        const key = method + " " + actualTemplate;
        const callback = this.routes[key];
        if (!callback)
            throw new Error('404 - No callback for route: '+ method + " " + request.uri);
        const params = Array.from(request.uri.match(actualRegex)).slice(1, actualGroups.length+1);
        const paramsObject = {};
        for (let index in actualGroups)
            paramsObject[actualGroups[index]] = params[index];
        const response = callback(request, paramsObject);
        return response;
    }
}