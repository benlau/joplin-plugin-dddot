import JoplinService from "../joplin/joplinservice";
import LinkGraphNode from "./linkgraphnode";

interface LinkGraphUpdateQueueItem {
    id: string;

    callbacks: ((value: LinkGraphNode | PromiseLike<LinkGraphNode>) => void)[];
}

async function sleep(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default class LinkGraphUpdateQueue {
    graph: Map<string, LinkGraphNode>;

    internal = 100;

    queue: LinkGraphUpdateQueueItem[];

    joplinService: JoplinService;

    isRunning: Boolean = false;

    constructor(joplinService: JoplinService, graph: Map<string, LinkGraphNode>, internal: number) {
        this.joplinService = joplinService;
        this.graph = graph;
        this.internal = internal;
        this.queue = [];
    }

    // Update a node immediately
    async update(id: string): Promise<LinkGraphNode> {
        const links = await this.joplinService.searchBacklinks(id);
        if (!this.graph.has(id)) {
            const node = new LinkGraphNode();
            node.id = id;
            this.graph.set(id, node);
        }

        const currentNode = this.graph.get(id);
        currentNode.backlinks = links;
        return currentNode;
    }

    async enqueue(id: string): Promise<LinkGraphNode> {
        return new Promise((resolve) => {
            const index = this.queue.findIndex((item) => item.id === id);
            if (index >= 0) {
                const item = this.queue[index];
                this.queue.splice(index, 1);
                item.callbacks.push(resolve);
                this.queue.push(item);
            } else {
                const item : LinkGraphUpdateQueueItem = {
                    id,
                    callbacks: [resolve],
                };

                this.queue.push(item);
            }

            this.run();
        });
    }

    private async run() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;

        for (;;) {
            await sleep(this.internal);

            if (this.queue.length === 0) {
                break;
            }

            const next = this.queue.pop();
            const result = await this.update(next.id);
            next.callbacks.forEach((callback) => callback(result));
        }

        this.isRunning = false;
    }
}
