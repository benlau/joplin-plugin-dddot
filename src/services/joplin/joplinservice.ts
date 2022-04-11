import JoplinRepo from "src/repo/joplinrepo";
import Link from "../../types/link";

export default class JoplinService {
    static Cancel = "Cancel";

    static OK = "OK";

    repo: JoplinRepo;

    constructor(repo: JoplinRepo) {
        this.repo = repo;
    }

    async createNoteLink(noteId: string): Promise<Link> {
        const note = await this.repo.dataGet(["notes", noteId]);
        return Link.createNoteLink(noteId, note.title);
    }

    async searchBacklinks(id: string): Promise<Link[]> {
        let hasMore = true;
        let page = 1;
        let items = [];
        while (hasMore) {
            const notes = await this.repo.dataGet(["search"], { query: id, fields: ["id", "title"], page });
            items = items.concat(notes.items);
            if (notes.has_more) { page += 1; } else { hasMore = false; }
        }

        const links = items.map((item) => Link.createNoteLink(item.id, item.title));
        return links;
    }

    async showMessageBox(message: string) {
        const result = await this.repo.dialogShowMessageBox(message);
        return result === 0 ? JoplinService.OK : JoplinService.Cancel;
    }
}
