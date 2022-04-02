import JoplinRepo from "src/repo/joplinrepo";
import JoplinService from "./joplin/joplinservice";
import LinkGraphService from "./linkgraph/linkgraphservice";
import RendererService from "./renderer/rendererservice";

export default class ServicePool {
    joplinService: JoplinService;

    linkGraphService: LinkGraphService;

    rendererService: RendererService;

    joplinRepo: JoplinRepo;

    constructor(joplinRepo: JoplinRepo) {
        this.joplinRepo = joplinRepo;
        this.joplinService = new JoplinService(this.joplinRepo);
        this.linkGraphService = new LinkGraphService(this.joplinService);
        this.rendererService = new RendererService();
    }
}
