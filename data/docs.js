export default {
    type: "Documentation",
    getMain: {
        type: "Hyperlink",
        method: "get",
        href: "/",
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
        href: "/people",
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
        href: "/people",
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
};