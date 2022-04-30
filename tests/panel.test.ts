import Panel from "../src/panel";
import JoplinRepo from "../src/repo/joplinrepo";
import ServicePool from "../src/services/servicepool";
import Tool from "../src/tools/tool";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/tools/tool");

test("Panel.onLoaded should post dddot.start", async () => {
    const panel = new Panel();
    const joplinRepo: any = new JoplinRepo();
    panel.joplinRepo = joplinRepo;
    panel.tools = [];
    await panel.onLoaded();

    expect(joplinRepo.panelPostMessage).toHaveBeenCalledWith({
        type: "dddot.start",
        tools: [],
    });
});

test("Panel.onLoaded should post dddot.start and ignore tool.hasView is false", async () => {
    const panel = new Panel();
    const joplinRepo: any = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);

    const tool: any = new Tool(servicePool);
    tool.hasView = false;

    panel.joplinRepo = joplinRepo;
    panel.tools = [tool];
    await panel.onLoaded();

    expect(joplinRepo.panelPostMessage).toHaveBeenCalledWith({
        type: "dddot.start",
        tools: [],
    });
});
