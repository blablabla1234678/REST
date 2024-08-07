export default class MockService {
    constructor(){
        this.store = {};
    }
    register(request, response){
        this.store[this.key(request)] = response;
    }
    handle(request){
        const key = this.key(request);
        if (!this.store.hasOwnProperty(key))
            throw new Error(`404 - not found: ${key}`);
        return this.store[key];
    }
    key(request){
        return request.method.toUpperCase() + " " + request.uri;
    }
}