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
                uri: "/people?{page}",
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
            },
            people: {
                type: "listPeople",
                request: {
                    items: {
                        page: 1
                    }
                }
            }
        }
    });

    service.register({method: "get", uri: "/people?page=1"}, {
        items: [
            {
                id: 1,
                name: "Carl Johnson",
                age: 56,
                gender: 1
            },
            {
                id: 2,
                name: "Susanne Morgan",
                age: 30,
                gender: 2
            }
        ],
        hyperlinks: {
            up: {
                type: "main"
            },
            self: {
                type: "listPeople",
                request: {
                    items: {
                        page: 1
                    }
                }
            },
            create: {
                type: "registerPerson"
            }
        }
    });

    service.register({method: "post", uri: "/people"}, {
        id: 3,
        name: "George Lucas",
        age: 66,
        gender: 1
    });

    it('should load the documentation', async () => {
        const client = new Client(new MockRequestFactory(service));
        assert.doesNotReject(async () => {
            await client.documentation("/doc");
        })
    });

    it('should follow a hyperlink without parameters', async () => {
        const client = new Client(new MockRequestFactory(service));
        await client.documentation("/doc");
        const main = await client.follow({type: "main"});
        assert.equal(main.hyperlinks.self.type, "main");
        const main2 = await client.follow(main.hyperlinks.self);
        assert.deepEqual(main, main2);
    });

    it('should follow a hyperlink with query parameters', async () => {
        const client = new Client(new MockRequestFactory(service));
        await client.documentation("/doc");
        const main = await client.follow({type: "main"});
        assert.equal(main.hyperlinks.people.type, "listPeople");
        const people = await client.follow(main.hyperlinks.people);
        assert.equal(people.items.length, 2);
        assert.deepEqual(people.items[0], {
            id: 1,
            name: "Carl Johnson",
            age: 56,
            gender: 1
        });
        assert.deepEqual(people.items[1], {
            id: 2,
            name: "Susanne Morgan",
            age: 30,
            gender: 2
        });
    });

    it('should follow a hyperlink with body parameters', async () => {
        const client = new Client(new MockRequestFactory(service));
        await client.documentation("/doc");
        const main = await client.follow({type: "main"});
        assert.equal(main.hyperlinks.people.type, "listPeople");
        const people = await client.follow(main.hyperlinks.people);
        assert.equal(people.items.length, 2);
        assert.equal(people.hyperlinks.create.type, "registerPerson");
        const person = await client.follow(people.hyperlinks.create, {
            name: "George Lucas",
            age: 66,
            gender: 1
        });
        assert.equal(person.id, 3);
        assert.equal(person.name, "George Lucas");
    });
});