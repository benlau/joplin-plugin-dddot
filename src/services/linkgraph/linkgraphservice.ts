import LinkGraphNode from "./linkgraphnode";
import JoplinService from "../joplin/joplinservice";

export default class LinkGraphService {
    joplinService: JoplinService;

    graph: Map<string, LinkGraphNode>;

    listeners: ((node: LinkGraphNode)=>void)[];

    constructor(joplinService: JoplinService) {
        this.joplinService = joplinService;
        this.graph = new Map<string, LinkGraphNode>();
        this.listeners = [];
    }

    queryBacklinks(id: string) {
        this.runQueryBacklinks(id);
        return this.graph.get(id);
    }

    onNodeUpdated(listener: (node: LinkGraphNode)=>void) {
        this.listeners.push(listener);
    }

    private async runQueryBacklinks(id: string) {
        const links = await this.joplinService.searchBacklinks(id);

        const notify = (linkage: LinkGraphNode) => {
            this.listeners.forEach((listener) => {
                listener(linkage);
            });
        };

        if (this.graph.has(id)) {
            const currentNode = this.graph.get(id);

            const newNode = { ...currentNode };
            newNode.backlinks = links;

            if (JSON.stringify(currentNode) !== JSON.stringify(newNode)) {
                this.graph.set(id, newNode);
                notify(newNode);
            }
        } else {
            const node = new LinkGraphNode();
            node.id = id;
            node.backlinks = links;
            this.graph.set(id, node);
            notify(node);
        }
    }
}
