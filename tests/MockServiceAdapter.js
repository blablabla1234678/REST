export default class MockServiceAdapter {
    constructor(){
        this.uriTemplates = {};
        this.routes = {};
    }
    add(method, uriTemplate, callback){
        const key = method.toUpperCase()+" "+uriTemplate.string();
        this.routes[key] = callback;
        this.uriTemplates[uriTemplate.string()] = uriTemplate;
    }
    handle(request){
        const method = request.method.toUpperCase();
        let params;
        let actualTemplate;
        for (let uriTemplate in this.uriTemplates){
            actualTemplate = this.uriTemplates[uriTemplate];
            params = actualTemplate.match(request.uri);
            if (params)
                break;
        }
        if (!actualTemplate)
            throw new Error('404 - Not found: ' + method + " " + request.uri);
        const key = method + " " + actualTemplate.string();
        const callback = this.routes[key];
        if (!callback)
            throw new Error('404 - No callback for route: '+ method + " " + request.uri);
        const response = callback(request, params);
        return response;
    }
}