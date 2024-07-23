# REST

REST API and client with HATEOAS.

### Client usage

```js
import {Client, Bookmark} from './rest';
import {View} from './rest-view';
import viewSettings from './view.json';

async () => {
    const view = new View({
        settings: viewSettings,
        container: "#container"
    });
    const client = new Client()
    const docs = await client.follow(new Bookmark("http://localhost:3000/api/v0/docs"));
    const main = await client.follow(docs.getMain);
    let peoplePage = await client.follow(main.hyperlinks.listPeople);
    view.append(peoplePage);
    while (peoplePage.relations.next && peoplePage.relations.next.parameters.page.index <= 5){
        let peoplePage = await client.follow(peoplePage.relations.next)
        view.append(peoplePage);
    }
}

```

### Resource representation

A resource representation contains data and hyperlink.

GET api/v0/people
```js
{
    type: "People",
    page: {
        index: 1,
        itemsPerPage: 3,
        count: 250
    },
    items: [
        {
            type: "Person",
            name: "Carl Johnson",
            age: 56,
            gender: 1
        },
        {
            type: "Person",
            name: "Susanne Morgan",
            age: 30,
            gender: 2
        },
        {
            type: "Person",
            name: "George Lucas",
            age: 66,
            gender: 1
        }
    ],
    hyperlinks: [
        {
            type: "registerPerson",
            relation: "create"
        },
        {
            type: "listPeople",
            query: {page: {index:1, itemsPerPage:3}},
            relation: "self"
        },
        {
            type: "listPeople",
            query: {page: {index:2, itemsPerPage:3}},
            relation: "next"
        }
    ]
}
```

# Documentation:

A documentation contains operation, parameter, class, property descriptions.

GET api/v0/docs
```js
{
    type: "Documentation",
    getMain: {
        type: "Hyperlink",
        method: "get",
        href: "/api/v0",
        returns: {
            200: {
                type: "Resource"
            }
        }
    },
    People: {
        type: "Collection",
        page: {
            type: "Paginator"
        },
        items: [{type: "Person"}]
    },
    registerPerson: {
        type: "Hyperlink",
        method: "post",
        href: "/api/v0/people",
        parameters: {
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
        },
        returns: {
            201: {
                type: "Person"
            }
        }
    },
    listPeople: {
        type: "Hyperlink",
        method: "get",
        href: "/api/v0/people",
        parameters: {
            page: {
                type: "Paginator"
            }
        },
        returns: {
            200: {
                type: "People"
            }
        }
    },
    Person: {
        type: "Resource",
        id: {type: "Id"},
        name: {type: "Name"},
        age: {type: "Age"},
        gender: {type: "Gender"}
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
        range: [1,2,3]
    }
}
```

# View

A view settings contains table and form descriptions for the data and hyperlinks.

./view.json
```js
{
    People: {
        label: "People",
        output: {
            type: "Table",
            columns: [
                "id",
                "name",
                "age",
                "gender"
            ]
        },
    },
    listPeople: {
        label: "List People"
    },
    Person: {
        label: "Person",
        name: {
            value: ["name"]
        }
    },
    registerPerson: {
        type: "Form",
        label: "Create Person",
        inputs: [
            "name",
            "age",
            "gender"
        ],
        submit: "register"
    },
    Name: {
        label: "Name",
        input: "text",
        output: "text"
    },
    Age: {
        label: "Age"
        input: "number",
        output: "text"
    },
    Gender: {
        label: "Gender",
        input: "select",
        output: "text",
        alternatives: [
            {value: 1, label: "Male"},
            {value: 2, label: "Female"},
            {value: 3, label: "Other"}
        ]
    }
}
```