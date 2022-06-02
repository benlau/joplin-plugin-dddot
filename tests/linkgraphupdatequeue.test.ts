import waitForExpect from "wait-for-expect";
import JoplinRepo from "../src/repo/joplinrepo";
import LinkGraphService from "../src/services/linkgraph/linkgraphservice";
import LinkGraphUpdateQueue from "../src/services/linkgraph/linkgraphupdatequeue";
import JoplinService from "../src/services/joplin/joplinservice";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/services/joplin/joplinservice");

test("update", async () => {
    const joplinService = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const queue = new LinkGraphUpdateQueue(
        joplinService,
        service.graph,
        0,
    );
    const node = await queue.update("1");

    expect(node.id).toBe("1");
});

test("enqueue", async () => {
    const joplinService = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const queue = new LinkGraphUpdateQueue(
        joplinService,
        service.graph,
        0,
    );
    const node = await queue.enqueue("1");

    expect(node.id).toBe("1");
});

test("enqueue should first come last serve", async () => {
    const joplinService = (new JoplinService(new JoplinRepo())) as any;
    const service = new LinkGraphService(joplinService);
    const queue = new LinkGraphUpdateQueue(
        joplinService,
        service.graph,
        100,
    );
    queue.enqueue("0");
    queue.enqueue("1");
    queue.enqueue("2");

    await waitForExpect(() => {
        expect(joplinService.searchBacklinks.mock.calls.length).toBe(3);
    });

    const args = joplinService.searchBacklinks.mock.calls.map((item) => item[0]);

    expect(
        JSON.stringify(args),
    ).toStrictEqual(
        JSON.stringify(["2", "1", "0"]),
    );
});

test("enqueue should perform deduplication", async () => {
    const joplinService = (new JoplinService(new JoplinRepo())) as any;
    const service = new LinkGraphService(joplinService);
    const queue = new LinkGraphUpdateQueue(
        joplinService,
        service.graph,
        100,
    );
    const p1 = queue.enqueue("0");
    const p2 = queue.enqueue("0");
    expect(queue.queue.length).toBe(1);
    expect(queue.queue[0].callbacks.length).toBe(2);
    await p1;
    await p2;
});
