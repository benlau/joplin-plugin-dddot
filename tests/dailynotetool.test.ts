import JoplinRepo from "../src/repo/joplinrepo";
import ServicePool from "../src/services/servicepool";
import DailyNoteTool from "../src/tools/dailynote/dailynotetool";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/services/joplin/joplinservice");
jest.mock("../src/services/linkgraph/linkgraphupdatequeue");

test("createDailyNote should create note", async () => {
    const joplinRepo = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);
    const dailyNoteTool = new DailyNoteTool(servicePool);
    const joplinService = servicePool.joplinService as any;

    joplinService.urlToId.mockReturnValueOnce("hashId");

    await dailyNoteTool.createDailyNote();

    expect(joplinService.createNoteWithId.mock.calls.length).toBe(1);
    expect(joplinService.createNoteWithId.mock.calls[0][0]).toBe(
        "hashId",
    );
    // FIXME: month and day must be padded with zero
});
