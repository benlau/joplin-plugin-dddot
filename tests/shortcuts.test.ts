import Shortcuts from "../src/tools/shortcuts";
import JoplinRepo from "../src/repo/joplinrepo";
import ServicePool from "../src/services/servicepool";
import Link from "../src/types/link";
import LinkListModel from "../src/models/linklistmodel";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/repo/platformrepo", () => ({
    default: jest.fn().mockImplementation(() => ({ isLinux: () => true })),
}));

test("removeNote - it should ask for confirmation", async () => {
    const joplinRepo: any = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);
    const tool = new Shortcuts(servicePool);

    const ids = ["1", "2", "3"];
    const model = new LinkListModel();
    ids.forEach((id) => {
        const link = Link.createNoteLink(id, `title:${id}`);
        model.push(link);
    });

    tool.linkListModel = model;
    joplinRepo.dialogOpen.mockReturnValue({ id: "ok" });

    await tool.removeLink("1");

    expect(tool.linkListModel.links.length).toBe(ids.length - 1);
});

test("removeNote - user could refuse to remove", async () => {
    const joplinRepo: any = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);
    const tool = new Shortcuts(servicePool);

    const ids = ["1", "2", "3"];
    const model = new LinkListModel();
    ids.forEach((id) => {
        const link = Link.createNoteLink(id, `title:${id}`);
        model.push(link);
    });

    tool.linkListModel = model;
    joplinRepo.dialogOpen.mockReturnValue({ id: "cancel" });

    await tool.removeLink("1");

    expect(tool.linkListModel.links.length).toBe(ids.length);
});
