export default {
    type: "Resource",
    hyperlinks: [
        {
            type: "listPeople",
            query: {page: {index:1, itemsPerPage:3}},
            relation: "category"
        }
    ]
};
