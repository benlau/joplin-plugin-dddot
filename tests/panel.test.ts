import Panel from "../src/panel";
import JoplinRepo from "../src/repo/joplinrepo";
import JoplinService from "../src/services/joplin/joplinservice";
import ServicePool from "../src/services/servicepool";
import Tool from "../src/tools/tool";

jest.mock("../src/repo/joplinrepo");
jest.mock("../src/services/joplin/joplinservice");
jest.mock("../src/tools/tool");

test("Panel.onLoaded should post dddot.start", async () => {
    const panel = new Panel();
    const joplinRepo: any = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);
    panel.joplinRepo = joplinRepo;
    panel.tools = [];
    const joplinService = new JoplinService(joplinRepo);
    servicePool.joplinService = joplinService;

    panel.servicePool = servicePool;
    await panel.onLoaded();

    const message = joplinRepo.panelPostMessage.mock.calls.pop()[0];
    expect(message.type).toBe("dddot.start");
    expect(message.tools).toStrictEqual([]);
});

test("Panel.onLoaded should post dddot.start and ignore tool.hasView is false", async () => {
    const panel = new Panel();
    const joplinRepo: any = new JoplinRepo();
    const servicePool = new ServicePool(joplinRepo);
    const joplinService = new JoplinService(joplinRepo);
    servicePool.joplinService = joplinService;

    const tool: any = new Tool(servicePool);
    tool.hasView = false;

    panel.joplinRepo = joplinRepo;
    panel.tools = [tool];
    panel.servicePool = servicePool;
    await panel.onLoaded();

    const message = joplinRepo.panelPostMessage.mock.calls.pop()[0];
    expect(message.type).toBe("dddot.start");
    expect(message.tools).toStrictEqual([]);
});
