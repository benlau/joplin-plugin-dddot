import Shortcuts from "../src/tools/shortcuts";
import JoplinRepo from "../src/repo/joplinrepo";
import ServicePool from "../src/services/servicepool";
import { LinkMonad } from "../src/types/link";
import { ShortcutsStorageValidator } from "../src/tools/shortcuts/types";
import LinkListModel from "../src/models/linklistmodel";

jest.mock("../src/repo/joplinrepo");
// eslint-disable-next-line func-names
jest.mock("../src/repo/platformrepo", () => function () {
    this.isLinux = () => true;
});

describe("Shortcuts Tool", () => {
    test("removeNote - it should ask for confirmation", async () => {
        const joplinRepo: any = new JoplinRepo();
        const servicePool = new ServicePool(joplinRepo);
        const tool = new Shortcuts(servicePool);

        const ids = ["1", "2", "3"];
        const model = new LinkListModel();
        ids.forEach((id) => {
            const link = LinkMonad.createNoteLink(id, `title:${id}`);
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
            const link = LinkMonad.createNoteLink(id, `title:${id}`);
            model.push(link);
        });

        tool.linkListModel = model;
        joplinRepo.dialogOpen.mockReturnValue({ id: "cancel" });

        await tool.removeLink("1");

        expect(tool.linkListModel.links.length).toBe(ids.length);
    });
});

describe("shortcuts storage", () => {
    test("validate - it should return true if the link is valid", () => {
        const storage = {
            version: 1,
            shortcuts: [
                {
                    id: "123",
                    title: "123",
                    type: "note",
                    isTodo: false,
                    isTodoCompleted: false,
                },
                { // isTodo and isTodoCompleted is optional fields
                    id: "fd43ba75224e4475b2a8a29662e1c008",
                    title: "Inbox",
                    type: "FolderLink",
                },
                {
                    id: "ffc86962b2d34474bb774b52d3f07373",
                    title: "Test Note",
                    type: "NoteLink",
                },
            ],
        };

        const validator = new ShortcutsStorageValidator();
        const result = validator.validate(storage);
        expect(result).toBe(true);
    });

    test("validate - it should return false for invalid format", () => {
        const validator = new ShortcutsStorageValidator();
        expect(validator.validate({})).toBe(false);
        expect(validator.validate(undefined)).toBe(false);
    });
});
