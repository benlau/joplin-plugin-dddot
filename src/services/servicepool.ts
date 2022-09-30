import JoplinRepo from "src/repo/joplinrepo";
import { MenuItem } from "api/types";
import JoplinService from "./joplin/joplinservice";
import LinkGraphService from "./linkgraph/linkgraphservice";
import RendererService from "./renderer/rendererservice";
import NoteDialogService from "./notedialog/notedialogservice";
import ToolbarService from "./toolbar/toolbarservice";
import DateTimeService from "./datetime/datetimeservice";
import PlatformRepo from "../repo/platformrepo";

export default class ServicePool {
    joplinService: JoplinService;

    linkGraphService: LinkGraphService;

    rendererService: RendererService;

    joplinRepo: JoplinRepo;

    noteDialogService: NoteDialogService;

    toolbarService: ToolbarService;

    dateTimeService: DateTimeService;

    platformRepo: PlatformRepo;

    receivers: { [key: string]: any } = {};

    constructor(joplinRepo: JoplinRepo) {
        this.joplinRepo = joplinRepo;
        this.platformRepo = new PlatformRepo();
        this.joplinService = new JoplinService(this.joplinRepo, this.platformRepo);
        this.linkGraphService = new LinkGraphService(this.joplinService);
        this.rendererService = new RendererService();
        this.noteDialogService = new NoteDialogService(this.joplinService, this.rendererService);
        this.toolbarService = new ToolbarService(this.joplinService, this.rendererService);
        this.dateTimeService = new DateTimeService();

        this.receivers = {
            notedialog: this.noteDialogService,
            toolbar: this.toolbarService,
        };
    }

    get assetFiles() {
        return [
            "./services/notedialog/notedialogworker.js",
            "./services/notedialog/notedialog.css",
            "./services/toolbar/toolbarworker.js",
            "./services/toolbar/toolbar.css",
        ];
    }

    get serviceWorkerFunctions() {
        return [
            "noteDialogWorker",
            "toolbarWorker",
        ];
    }

    async onLoaded() {
        const services = [
            this.toolbarService,
        ];
        await Promise.all(services.map((service) => service.onLoaded()));
    }

    async registerCommands(): Promise<MenuItem[]> {
        let res = [];
        res = res.concat(await this.noteDialogService.registerCommands());
        return res;
    }

    hasReceiver(target: string) {
        return target in this.receivers;
    }

    async onMessage(message: any) {
        const token = message.type.split(".");
        const target = token[0];
        return this.receivers[target].onMessage(message);
    }
}
