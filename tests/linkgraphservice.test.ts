import waitForExpect from "wait-for-expect";
import JoplinRepo from "../src/repo/joplinrepo";
import LinkGraphService from "../src/services/linkgraph/linkgraphservice";
import Link from "../src/types/link";
import LinkGraphNode from "../src/services/linkgraph/linkgraphnode";
import JoplinService from "../src/services/joplin/joplinservice";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/services/joplin/joplinservice");

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
