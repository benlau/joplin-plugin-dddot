import LinkGraphNode from "./linkgraphnode";
import JoplinService from "../joplin/joplinservice";
import LinkGraphUpdateQueue from "./linkgraphupdatequeue";
import Link from "../../types/link";

const UpdateInterval = 100;

export interface QueryBacklinksResult {
    isCache: boolean;
    backlinks: Link[];
}

async function* bfs(start: string, fetch: (id: string) => Promise<LinkGraphNode>) {
    const added = new Set<string>();
    const queue: string[] = [];
    queue.push(start);
    added.add(start);

    while (queue.length > 0) {
        const current = queue.shift();
        const node = await fetch(current);
        yield node;
        const backlinks = node?.backlinks ?? [];
        backlinks.forEach((link) => {
            if (!added.has(link.id)) {
                added.add(link.id);
                queue.push(link.id);
            }
        });
    }
}

export default class LinkGraphService {
    joplinService: JoplinService;

    graph: Map<string, LinkGraphNode>;

    listeners: ((node: LinkGraphNode)=>void)[];

    updateQueue: LinkGraphUpdateQueue;

    constructor(joplinService: JoplinService) {
        this.joplinService = joplinService;
        this.graph = new Map<string, LinkGraphNode>();
        this.listeners = [];
        this.updateQueue = new LinkGraphUpdateQueue(
            this.joplinService,
            this.graph,
            UpdateInterval,
        );
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

    async* queryBacklinksAdv(id: string, recursive = false) {
        const backlinks = this.graph.has(id) ? this.graph.get(id).backlinks : [];
        const backlinksSet = new Set<string>(backlinks.map((link) => link.id));
        backlinksSet.add(id);

        const deduplicate = (links: Link[], isCache: boolean) => {
            const filterLinks = links.filter((link) => !backlinksSet.has(link.id));
            const set = new Set<string>(filterLinks.map((link) => link.id));
            set.forEach(backlinksSet.add, set);
            return {
                isCache,
                backlinks: filterLinks,
            };
        };

        yield {
            isCache: true,
            backlinks,
        };

        const node = await this.updateQueue.enqueue(id);
        const updates = node.backlinks.filter(
            (link) => backlinks.findIndex((item) => item.id === link.id) < 0,
        );

        yield deduplicate(updates, false);

        if (!recursive) {
            return;
        }

        // eslint-disable-next-line
        for await (const travlingNode of bfs(id, async (nodeId: string) => {
            return this.graph.get(nodeId);
        })) {
            if (travlingNode !== undefined && travlingNode.id !== id) {
                yield deduplicate(travlingNode?.backlinks ?? [], true);
            }
        }

        // eslint-disable-next-line
        for await (const travlingNode of bfs(id, async (nodeId: string) => {
            return this.updateQueue.enqueue(nodeId);
        })) {
            if (travlingNode !== undefined && travlingNode.id !== id) {
                yield deduplicate(travlingNode?.backlinks ?? [], false);
            }
        }
    }
}
