import Link from "../types/link";

export default class LinkListModel {
    links: Link[];

    constructor() {
        this.links = [];
    }

    unshift(link: Link) {
        this.remove(link.id);
        this.links.unshift(link);
    }

    push(link: Link) {
        this.remove(link.id);
        this.links.push(link);
    }

    remove(id: String) {
        this.links = this.links.filter((link) => link.id !== id);
    }

    toData() {
        return this.links.map((link) => ({ ...link }));
    }

    reorder(orderedIds: string[]) {
        const ids = this.links.map((link) => link.id);
        const weight = (id) => {
            const index = orderedIds.indexOf(id);
            return index >= 0 ? index : ids.indexOf(id) + orderedIds.length;
        };
        this.links = [...this.links].sort((a, b) => weight(a.id) - weight(b.id));
    }

    update(id: string, options) {
        const ids = this.links.map((link) => link.id);
        const index = ids.indexOf(id);
        if (index >= 0) {
            const link = this.links[index];
            const newLink = {
                ...link,
                ...options,
            };
            if (JSON.stringify(link) !== JSON.stringify(newLink)) {
                this.links[index] = newLink;
                return true;
            }
        }
        return false;
    }
}
