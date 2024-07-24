import Client from '../lib/Client';
import MockApiResolver from '../lib/MockApiResolver';
import ConsoleView from '../lib/ConsoleView';
import docsData from '../data/docs';
import mainData from '../data/main';
import peopleData from '../data/people';

async () => {
    const view = new ConsoleView();
    const client = new Client({
        resolver: new MockApiResolver([
            {method: "get", path: "/docs", status: 200, body: docsData},
            {method: "get", path: "/main", status: 200, body: mainData},
            {method: "get", path: "/people", query: {page: {index:1, itemsPerPage:3}}, status: 200, body: peopleData},
            {method: "get", path: "/people", query: {page: {index:2, itemsPerPage:3}}, status: 200, body: peopleData},
            {method: "get", path: "/people", query: {page: {index:3, itemsPerPage:3}}, status: 200, body: peopleData},
        ])
    });
    const docs = await client.follow(client.bookmark("/docs"));
    const main = await client.follow(docs.find({operation: "getMain"}));
    let peoplePage = await client.follow(main.find({operation: "listPeople"}));
    view.append(peoplePage);
    let next;
    while (next = peoplePage.find({relation: "next"})){
        if (next.query.page.index > 3)
            break;
        let peoplePage = await client.follow(next);
        view.append(peoplePage);
    }
}