# REST

REST API and client with HATEOAS.

### Resource representation

A resource representation contains data and hyperlink.

GET api/v0/people
```js
{
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
    registerPerson: {
        type: "Hyperlink",
        method: "post",
        href: "people",
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
        }
    },
    listPeople: {
        type: "Hyperlink",
        method: "get",
        href: "people",
        parameters: {
            page: {
                type: "number"
            }
        }
    },
    Name: {
        type: "string",
        length: {
            min: 3,
            max: 255
        }
    },
    Age: {
        type: "number",
        range: {
            min: 18,
            max: 150
        }
    },
    Gender: {
        type: "number",
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
                {
                    value: ["item","name"],
                    output: "text",
                    sortBy: true
                }
            ],
            pagination: 25
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