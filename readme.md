# REST

REST API and client with HATEOAS.

### Resource representation

A resource representation contains data and hyperlink.

GET api/v0/people
```js
{
    type: "People",
    page: 1,
    items: [
        {
            type: "Person",
            name: "Carl Johnson"
        },
        {
            type: "Person",
            name: "Sunny Morgan"
        },
        //...
    ],
    hyperlinks: [
        {
            type: "registerPerson",
            relation: "create"
        },
        {
            type: "listPeople",
            query: {page: 1},
            relation: "self"
        },
        {
            type: "listPeople",
            query: {page: 2},
            relation: "next"
        },
        //...
    ]
}
```

# Documentation:

A documentation contains operation, parameter, class, property descriptions.

GET api/v0/docs
```js
{
    People: {
        type: "Collection",
        page: {
            type: "Paginator",
            size: 25
        },
        items: {
            type: "Person"
        }
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

A view contains table and form descriptions for the data and hyperlinks.

GET api/v0/view
```js
{
    People: {
        label: "People",
        output: {
            type: "table",
            columns: [
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
        label: "Create Person",
        submit: "register",
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