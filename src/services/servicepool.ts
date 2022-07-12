import JoplinRepo from "src/repo/joplinrepo";
import JoplinService from "./joplin/joplinservice";
import LinkGraphService from "./linkgraph/linkgraphservice";
import RendererService from "./renderer/rendererservice";
import NoteDialogService from "./notedialog/notedialogservice";

export default class ServicePool {
    joplinService: JoplinService;

    linkGraphService: LinkGraphService;

    rendererService: RendererService;

    joplinRepo: JoplinRepo;

    noteDialogService: NoteDialogService;

    constructor(joplinRepo: JoplinRepo) {
        this.joplinRepo = joplinRepo;
        this.joplinService = new JoplinService(this.joplinRepo);
        this.linkGraphService = new LinkGraphService(this.joplinService);
        this.rendererService = new RendererService();
        this.noteDialogService = new NoteDialogService(this.joplinService, this.rendererService);
    }

    get assetFiles() {
        return [
            "./services/notedialog/notedialogworker.js",
            "./services/notedialog/notedialog.css",
        ];
    }
}
