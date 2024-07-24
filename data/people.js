export default function peoplePage(page){
    const people = JSON.parse(JSON.stringify(peopleTemplate));
    if (!page)
        page = 1;
    if (page > 3)
        throw new Error("Out of range.");
    const items = peoplePageItems[page];
    people.items = items;
    people.page.index = page;
    for (let hyperlink of people.hyperlinks)
        if (hyperlink.query || hyperlink.query.page)
            hyperlink.query.page.index = page;
    return people;
}

const peopleTemplate = {
    type: "People",
    page: {
        index: undefined,
        itemsPerPage: 3,
        count: 250
    },
    items: undefined,
    hyperlinks: [
        {
            type: "registerPerson",
            relation: "create"
        },
        {
            type: "listPeople",
            query: {page: {index:undefined, itemsPerPage:3}},
            relation: "self"
        },
        {
            type: "listPeople",
            query: {page: {index:undefined, itemsPerPage:3}},
            relation: "next"
        }
    ]
};

const peoplePageItems = {
    1: [
        {
            type: "Person",
            id: 1,
            name: "Carl Johnson",
            age: 56,
            gender: 1
        },
        {
            type: "Person",
            id: 2,
            name: "Susanne Morgan",
            age: 30,
            gender: 2
        },
        {
            type: "Person",
            id: 3,
            name: "George Lucas",
            age: 66,
            gender: 1
        }
    ],
    2: [
        {
            type: "Person",
            id: 4,
            name: "Kenny Smith",
            age: 12,
            gender: 1
        },
        {
            type: "Person",
            id: 5,
            name: "Liliana Peterson",
            age: 20,
            gender: 2
        },
        {
            type: "Person",
            id: 6,
            name: "Maria Cardenas",
            age: 33,
            gender: 2
        }
    ],
    3: [
        {
            type: "Person",
            id: 7,
            name: "Concita Wurst",
            age: 35,
            gender: 3
        },
        {
            type: "Person",
            id: 8,
            name: "Juliana Robinson",
            age: 44,
            gender: 2
        },
        {
            type: "Person",
            id: 9,
            name: "George Honduras",
            age: 78,
            gender: 1
        }
    ]   
};