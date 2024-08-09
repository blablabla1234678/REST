
import assert from 'assert';
import Service from '../lib/Service.js';
import MockServiceAdapter from './MockServiceAdapter.js';

describe('Service.iterate', () => {

    const docs = {
        main: {
            type: "Hyperlink",
            method: "get",
            uri: "/",
            response: {
                type: "Object"
            }
        },
        registerPerson: {
            type: "Hyperlink",
            method: "post",
            uri: "/people",
            request: {
                type: "FlatObject",
                items: {
                    name: {
                        type: "Name",
                        required: true
                    },
                    age: {
                        type: "Age",
                        required: true
                    },
                    gender: {
                        type: "Gender"
                    }
                }
            },
            response: {
                type: "Person"
            }
        },
        listPeople: {
            type: "Hyperlink",
            method: "get",
            uri: "/people?{page}",
            request: {
                type: "FlatObject",
                items: {
                    page: {
                        type: "Number"
                    }
                }
            },
            response: {
                type: "People"
            }
        },
        People: {
            type: "Array",
            items: {type: "Person"}
        },
        Person: {
            type: "Object",
            items: {
                id: {type: "Number"},
                name: {type: "Name"},
                age: {type: "Age"},
                gender: {type: "Gender"}
            }
        },
        Name: {
            type: "String",
            length: {
                min: 3,
                max: 255
            }
        },
        Age: {
            type: "Number",
            range: {
                min: 18,
                max: 150
            }
        },
        Gender: {
            type: "Number",
            alternatives: [1,2,3]
        }
    };

    it('should handle a hyperlink without parameters', () => {
        const adapter = new MockServiceAdapter();
        const service = new Service(adapter);
        service.documentation(docs);
        let request;
        let params;
        service.register("main", (r, p) => {
            request = r;
            params = p;
        });
        service.handle({
            method: "get",
            uri: "/"
        });
        assert.equal(request.method, "get");
        assert.equal(request.uri, "/");
        assert.deepEqual(params, {});
    });

    it('should handle a hyperlink with query parameters', () => {
        const adapter = new MockServiceAdapter();
        const service = new Service(adapter);
        service.documentation(docs);
        let request;
        let params;
        service.register("listPeople", (r, p) => {
            request = r;
            params = p;
        });
        service.handle({
            method: "get",
            uri: "/people?page=1"
        });
        assert.equal(request.method, "get");
        assert.equal(request.uri, "/people?page=1");
        assert.deepEqual(params, {page:'1'});
    });

    it('should handle a hyperlink with body parameters', () => {
        const adapter = new MockServiceAdapter();
        const service = new Service(adapter);
        service.documentation(docs);
        let request;
        let params;
        service.register("registerPerson", (r, p) => {
            request = r;
            params = p;
        });
        service.handle({
            method: "post",
            uri: "/people",
            body: {
                name: "John Doe",
                age: 21,
                gender: 1
            }
        });
        assert.equal(request.method, "post");
        assert.equal(request.uri, "/people");
        assert.deepEqual(params, {});
    });

});