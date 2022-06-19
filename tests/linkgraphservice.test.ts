import waitForExpect from "wait-for-expect";
import JoplinRepo from "../src/repo/joplinrepo";
import LinkGraphService, { QueryBacklinksResult } from "../src/services/linkgraph/linkgraphservice";
import Link from "../src/types/link";
import LinkGraphNode from "../src/services/linkgraph/linkgraphnode";
import JoplinService from "../src/services/joplin/joplinservice";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/services/joplin/joplinservice");
jest.mock("../src/services/linkgraph/linkgraphupdatequeue");

test("queryBacklinks should return undefined if no data available", () => {
    const joplinService = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const id = "id-not-existed";

    const result = service.queryBacklinks(id);

    expect(result).toBe(undefined);
});

test("queryBacklinks should trigger onNodeUpdated", async () => {
    const joplinService: any = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const id = "src";
    const noteLinkage = new LinkGraphNode();
    noteLinkage.id = id;
    noteLinkage.backlinks = [
        Link.createNoteLink("dst", "title"),
    ];

    joplinService.searchBacklinks.mockReturnValueOnce(noteLinkage.backlinks);

    const onNoteLinkageUpdated = jest.fn();

    service.onNodeUpdated(onNoteLinkageUpdated);

    service.queryBacklinks(id);

    await waitForExpect(() => {
        expect(
            joplinService.searchBacklinks.mock.calls.length,
        ).toBe(1);
    });

    expect(onNoteLinkageUpdated.mock.calls[0]).toEqual([noteLinkage]);
});

test("queryBacklinks should not trigger onNodeUpdate if nothing changed", async () => {
    const joplinService: any = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const id = "src";
    const noteLinkage = new LinkGraphNode();
    noteLinkage.id = id;
    noteLinkage.backlinks = [
        Link.createNoteLink("dst", "title"),
    ];
    service.graph.set(id, noteLinkage);

    joplinService.searchBacklinks.mockReturnValueOnce(noteLinkage.backlinks);

    const onNoteLinkageUpdated = jest.fn();

    service.onNodeUpdated(onNoteLinkageUpdated);
    service.queryBacklinks(id);

    await waitForExpect(() => {
        expect(
            joplinService.searchBacklinks.mock.calls.length,
        ).toBe(1);
    });

    expect(onNoteLinkageUpdated.mock.calls.length).toBe(0);
});

test("queryBaclinksAdv - returns cached result on first read", async () => {
    const joplinService: any = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const id = "1";

    const stream = service.queryBacklinksAdv(id);

    const result = (await stream.next()).value as QueryBacklinksResult;

    expect(result.backlinks).toStrictEqual([]);
});

test("queryBaclinksAdv - it should query latest backlinks", async () => {
    const joplinService: any = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const id = "1";
    const backlinkIds = ["2", "3"];
    const queue = service.updateQueue as any;
    const node = new LinkGraphNode();
    node.id = id;
    node.backlinks = [
        Link.createNoteLink("2", "2"),
        Link.createNoteLink("3", "3"),
    ];
    queue.enqueue.mockReturnValueOnce(node);

    const stream = service.queryBacklinksAdv(id);

    const cachedResult = (await stream.next()).value as QueryBacklinksResult;
    expect(cachedResult.backlinks).toStrictEqual([]);

    const nonCachedResult = (await stream.next()).value as QueryBacklinksResult;
    expect(nonCachedResult.backlinks.map((item) => item.id)).toStrictEqual(backlinkIds);

    const last = await stream.next();
    expect(last.done).toBe(true);
});

test("queryBaclinksAdv - it should deduplicate the result", async () => {
    const joplinService: any = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const id = "1";
    const backlinkIds = ["2", "3"];
    const queue = service.updateQueue as any;
    const node = new LinkGraphNode();
    node.id = id;
    node.backlinks = [
        Link.createNoteLink("2", "2"),
        Link.createNoteLink("3", "3"),
    ];
    service.graph.set(id, node);
    queue.enqueue.mockReturnValueOnce(node);

    const stream = service.queryBacklinksAdv(id);

    const cachedResult = await stream.next();

    expect((cachedResult.value as any).backlinks.map((item) => item.id)).toStrictEqual(backlinkIds);

    const nonCacheResult = await stream.next();
    expect(nonCacheResult.done).toBe(false);
    expect((nonCacheResult.value as any).backlinks.map((item) => item.id)).toStrictEqual([]);

    const last = await stream.next();
    expect(last.done).toBe(true);
});

test("queryBaclinksAdv - recursive on cached data", async () => {
    const joplinService: any = new JoplinService(new JoplinRepo());
    const service = new LinkGraphService(joplinService);
    const id = "1";
    const recursive = true;

    const queue = service.updateQueue as any;
    const node1 = new LinkGraphNode();
    node1.id = id;
    node1.backlinks = [
        Link.createNoteLink("2", "2"),
    ];

    const node2 = new LinkGraphNode();
    node2.id = "2";
    node2.backlinks = [
        Link.createNoteLink("3", "3"),
    ];

    service.graph.set(id, node1);
    service.graph.set("2", node2);

    queue.enqueue.mockReturnValueOnce(node1);

    const stream = service.queryBacklinksAdv(id, recursive);

    const blocks : any = [];

    // eslint-disable-next-line
    for await (const result of stream) {
        blocks.push(result);
    }

    expect(blocks.length).toBe(3);
});
