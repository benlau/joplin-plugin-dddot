import RecentNotes from "../src/tools/recentnotes";
import JoplinRepo from "../src/repo/joplinrepo";
import ServicePool from "../src/services/servicepool";
import { LinkMonad } from "../src/types/link";
import LinkListModel from "../src/models/linklistmodel";

jest.mock("../src/repo/joplinrepo");

test("truncate - it should remove items more than maxnotes value", async () => {
    const joplinRepo: any = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);
    const tool = new RecentNotes(servicePool);

    const ids = ["1", "2", "3"];
    const model = new LinkListModel();
    ids.forEach((id) => {
        const link = LinkMonad.createNoteLink(id, "title");
        model.push(link);
    });
    const max = 1;

    tool.linkListModel = model;

    joplinRepo.settingsLoad.mockReturnValue(max);

    await tool.truncate();

    expect(tool.linkListModel.links.length).toBe(max);
});
