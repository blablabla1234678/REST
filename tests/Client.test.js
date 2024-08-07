import Client from '../lib/Client.js';
import MockRequestFactory from '../lib/MockHttpRequestFactory.js';
import MockService from '../lib/MockService.js';
import assert from 'assert';

describe('Client.request', () => {
    const service = new MockService();

    service.register({method: "get", uri: "/doc"}, {
        main: {
            type: "Hyperlink",
            request: {
                type: "Object",
                method: "get",
                uri: "/"
            },
            response: {
                type: "Object"
            }
        },
        registerPerson: {
            type: "Hyperlink",
            request: {
                type: "Object",
                method: "post",
                uri: "/people",
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
            request: {
                type: "Object",
                method: "get",
                uri: "/people",
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
    });
    
    service.register({method: "get", uri: "/"}, {
        hyperlinks: {
            self: {
                type: "main"
            }
        }
    });

    it('should load the documentation', async () => {
        const client = new Client(new MockRequestFactory(service));
        assert.doesNotReject(async () => {
            await client.documentation("/doc");
        })
    });

    it('should follow a simple hyperlink without parameters', async () => {
        const client = new Client(new MockRequestFactory(service));
        await client.documentation("/doc");
        const main = await client.follow({type: "main"});
        assert.equal(main.hyperlinks.self.type, "main");
        const main2 = await client.follow(main.hyperlinks.self);
        assert.deepEqual(main, main2);
    });


});