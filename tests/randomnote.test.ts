import RandomNoteTool from "../src/tools/randomnote/randomnotetool";
import JoplinRepo from "../src/repo/joplinrepo";
import ServicePool from "../src/services/servicepool";

describe("RandomNoteTool", () => {
    let joplinRepo: any;
    let servicePool: ServicePool;
    let randomNoteTool: RandomNoteTool;
    let joplinService: any;

    beforeEach(() => {
        joplinRepo = new JoplinRepo();
        servicePool = new ServicePool(joplinRepo);
        servicePool.joplinService = {
            getAllNoteIds: jest.fn(),
            openNote: jest.fn(),
        } as any;
        randomNoteTool = new RandomNoteTool(servicePool);
        joplinService = servicePool.joplinService;
    });

    describe("getNoteIds", () => {
        test("should fetch note IDs from JoplinService when cache is null", async () => {
            const mockNoteIds = ["note1", "note2", "note3"];
            joplinService.getAllNoteIds.mockResolvedValueOnce(mockNoteIds);

            const result = await randomNoteTool.getNoteIds();

            expect(result).toEqual(mockNoteIds);
            expect(joplinService.getAllNoteIds).toHaveBeenCalledTimes(1);
        });

        test("should use cached note IDs when cache is valid", async () => {
            const mockNoteIds = ["note1", "note2", "note3"];
            joplinService.getAllNoteIds.mockResolvedValueOnce(mockNoteIds);

            await randomNoteTool.getNoteIds();

            const result = await randomNoteTool.getNoteIds();

            expect(result).toEqual(mockNoteIds);
            expect(joplinService.getAllNoteIds).toHaveBeenCalledTimes(1);
        });

        test("should refresh cache in background when cache is expired", async () => {
            const mockNoteIds = ["note1", "note2", "note3"];
            const newMockNoteIds = ["note4", "note5", "note6"];

            joplinService.getAllNoteIds.mockResolvedValueOnce(mockNoteIds);

            await randomNoteTool.getNoteIds();

            const originalDateNow = Date.now;
            Date.now = jest.fn(() => originalDateNow() + 6 * 60 * 1000); // 6 minutes later

            joplinService.getAllNoteIds.mockResolvedValueOnce(newMockNoteIds);

            const result = await randomNoteTool.getNoteIds();

            expect(result).toEqual(mockNoteIds);
            expect(joplinService.getAllNoteIds).toHaveBeenCalledTimes(2);

            Date.now = originalDateNow;
        });

        test("should handle errors when fetching note IDs", async () => {
            joplinService.getAllNoteIds.mockRejectedValueOnce(new Error("Test error"));

            await expect(randomNoteTool.getNoteIds()).rejects.toThrow("Test error");
        });
    });

    describe("openRandomNote", () => {
        test("openRandomNote should handle empty note list", async () => {
            joplinService.getAllNoteIds.mockResolvedValueOnce([]);

            await randomNoteTool.openRandomNote();

            expect(joplinService.openNote).not.toHaveBeenCalled();
        });

        test("openRandomNote should open a random note", async () => {
            const mockNoteIds = ["note1", "note2", "note3"];
            joplinService.getAllNoteIds.mockResolvedValueOnce(mockNoteIds);

            const mathRandomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5);

            await randomNoteTool.openRandomNote();

            expect(joplinService.openNote).toHaveBeenCalledWith("note2");

            mathRandomSpy.mockRestore();
        });
    });
});
