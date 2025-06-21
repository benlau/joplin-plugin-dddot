import JoplinRepo from "../src/repo/joplinrepo";
import ServicePool from "../src/services/servicepool";
import DailyNoteTool from "../src/tools/dailynote/dailynotetool";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/services/joplin/joplinservice");
jest.mock("../src/services/linkgraph/linkgraphupdatequeue");
jest.mock("../src/services/datetime/datetimeservice");

test("getOrCreateDailyNote should create note", async () => {
    const joplinRepo = new JoplinRepo() as any;
    const servicePool = new ServicePool(joplinRepo);
    const dailyNoteTool = new DailyNoteTool(servicePool);
    const joplinService = servicePool.joplinService as any;
    const dateTimeService = servicePool.dateTimeService as any;

    dateTimeService.getNormalizedToday.mockReturnValueOnce(new Date(2020, 0, 1));
    joplinService.searchNoteByTitle.mockReturnValueOnce([]);
    joplinService.urlToId.mockReturnValueOnce("hashId");
    joplinService.queryNotebookId.mockReturnValueOnce("notebookId");
    joplinRepo.settingsLoadGlobal.mockReturnValueOnce("YYYY-MM-DD");
    joplinRepo.settingsLoad.mockReturnValue("default");

    await dailyNoteTool.getOrCreateDailyNote();

    expect(joplinService.urlToId).toHaveBeenLastCalledWith("calendar://default/day/2020/01/01");
    expect(joplinService.createNoteWithIdIfNotExists.mock.calls.length).toBe(1);
    expect(joplinService.createNoteWithIdIfNotExists.mock.calls[0][0]).toBe(
        "hashId",
    );
    expect(joplinService.searchNoteByTitle.mock.calls[0][0]).toBe(
        "2020-01-01",
    );
});

test("getOrCreateDailyNote should show toast if default notebook is not found", async () => {
    const joplinRepo = new JoplinRepo() as any;
    const servicePool = new ServicePool(joplinRepo);
    const dailyNoteTool = new DailyNoteTool(servicePool);
    const joplinService = servicePool.joplinService as any;
    const dateTimeService = servicePool.dateTimeService as any;

    dateTimeService.getNormalizedToday.mockReturnValueOnce(new Date(2020, 0, 1));
    joplinService.searchNoteByTitle.mockReturnValueOnce([]);
    joplinService.urlToId.mockReturnValueOnce("hashId");
    joplinService.queryNotebookId.mockReturnValueOnce(null); // Default notebook not found
    joplinRepo.settingsLoadGlobal.mockReturnValueOnce("YYYY-MM-DD");
    joplinRepo.settingsLoad.mockReturnValue("default");

    await dailyNoteTool.getOrCreateDailyNote();

    expect(joplinService.queryNotebookId).toHaveBeenCalledWith("default");
    expect(joplinRepo.toast).toHaveBeenCalledTimes(1);
    expect(joplinService.createNoteWithIdIfNotExists).not.toHaveBeenCalled();
});
