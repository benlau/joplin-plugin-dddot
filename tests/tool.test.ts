import ScratchPad from "../src/tools/scratchpad";
import RecentNotes from "../src/tools/recentnotes";
import Shortcuts from "../src/tools/shortcuts";
import JoplinRepo from "../src/repo/joplinrepo";
import ServicePool from "../src/services/servicepool";
import Tool, { blockDisabled } from "../src/tools/tool";

jest.mock("../src/repo/joplinrepo");

test("containerId", () => {
    const joplinRepo = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);

    const scratchpad = new ScratchPad(servicePool);
    expect(scratchpad.containerId).toBe("dddot-scratchpad-tool-container");
    expect(scratchpad.contentId).toBe("dddot-scratchpad-tool-content");

    const recentNotes = new RecentNotes(servicePool);
    expect(recentNotes.containerId).toBe("dddot-recentnotes-tool-container");
    expect(recentNotes.contentId).toBe("dddot-recentnotes-tool-content");

    const shortcuts = new Shortcuts(servicePool);
    expect(shortcuts.containerId).toBe("dddot-shortcuts-tool-container");
    expect(shortcuts.contentId).toBe("dddot-shortcuts-tool-content");
});

test("@blockDisabled", () => {
    class TestClass {
        isEnabled: Boolean = true;

        arg1 = "";

        @blockDisabled
        test(arg1) {
            this.arg1 = arg1;
            return true;
        }
    }

    const object1 = new TestClass();
    expect(object1.test("a")).toBe(true);
    expect(object1.arg1).toBe("a");

    const object2 = new TestClass();
    object2.isEnabled = false;
    expect(object2.test("a")).toBe(undefined);
});

test("updateEnabledFromSetting", async () => {
    const joplinRepo: any = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);

    const tool = new Tool(servicePool);
    expect(tool.isEnabled).toBe(true);

    joplinRepo.settingsLoad.mockReturnValue(false);

    expect(await tool.updateEnabledFromSetting()).toBe(false);
    expect(tool.isEnabled).toBe(false);
});
