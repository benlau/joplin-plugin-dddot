import JoplinRepo from "../src/repo/joplinrepo";
import JoplinService from "../src/services/joplin/joplinservice";

jest.mock("../src/repo/joplinrepo");

test("appendTextToNote should append text via dataPut", async () => {
    const joplinRepo = (new JoplinRepo()) as any;
    const joplinService = new JoplinService(joplinRepo);
    const noteId = "noteId";
    const text = "text";
    joplinRepo.workspaceSelectedNote.mockReturnValueOnce({ id: "another-id" });
    joplinRepo.dataGet.mockReturnValueOnce({ body: "header" });

    await joplinService.appendTextToNote(noteId, text);

    expect(joplinRepo.dataPut.mock.calls[0][2].body).toBe("headertext");
});

test("urlToId", async () => {
    const joplinRepo = (new JoplinRepo()) as any;
    const joplinService = new JoplinService(joplinRepo);

    expect(
        await joplinService.urlToId("https://www.google.com/"),
    ).toBe("d0e196a0c25d35dd0a84593cbae0f383");
});
