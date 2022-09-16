import * as crypto from "crypto";
import ThemeType from "../../types/themetype";
import JoplinRepo from "../../repo/joplinrepo";
import PlatformRepo from "../../repo/platformrepo";
import Link from "../../types/link";
import TimerRepo from "../../repo/timerrepo";

export async function sha256(message) {
    return crypto.createHash("sha256").update(message).digest("hex");
}

export default class JoplinService {
    static Cancel = "Cancel";

    static OK = "OK";

    dialogHandle = "";

    repo: JoplinRepo;

    platformRepo: PlatformRepo;

    timerRepo: TimerRepo;

    constructor(
        repo: JoplinRepo,
        platformRepo: PlatformRepo = new PlatformRepo(),
        timerRepo: TimerRepo = new TimerRepo(),
    ) {
        this.repo = repo;
        this.platformRepo = platformRepo;
        this.timerRepo = timerRepo;
    }

    async createNoteLink(noteId: string): Promise<Link> {
        const note = await this.repo.dataGet(
            ["notes", noteId],
            {
                fields: ["id", "title", "is_todo", "todo_completed"],
            },
        );
        return Link.createNoteLinkFromRawData(note);
    }

    async createFolderLink(folderId: string): Promise<Link> {
        const folder = await this.repo.dataGet(
            ["folders", folderId],
            {
                fields: ["id", "title"],
            },
        );
        return Link.createFolderLink(folder.id, folder.title);
    }

    async searchBacklinks(id: string): Promise<Link[]> {
        let hasMore = true;
        let page = 1;
        let items = [];
        while (hasMore) {
            const notes = await this.repo.dataGet(
                ["search"],
                {
                    query: id,
                    fields: ["id", "title", "is_todo", "todo_completed"],
                    page,
                },
            );
            items = items.concat(notes.items);
            if (notes.has_more) { page += 1; } else { hasMore = false; }
        }

        const links = items.map(
            (item) => Link.createNoteLinkFromRawData(item),
        );
        return links;
    }

    async showMessageBox(message: string) {
        return this.platformRepo.isLinux()
            ? this.showMessageBoxCustom(message)
            : this.showMessageBoxNative(message);
    }

    async showMessageBoxCustom(message: string) {
        if (this.dialogHandle === "") {
            this.dialogHandle = await this.repo.dialogCreate("dddot.joplinservice.messageBox");
        }

        await this.repo.dialogSetHtml(this.dialogHandle, `<h3>${message}</h3>`);

        await this.repo.dialogSetButtons(this.dialogHandle, [
            {
                id: "ok",
            },
            {
                id: "cancel",
            },
        ]);

        const result = await this.repo.dialogOpen(this.dialogHandle);

        return result.id === "ok" ? JoplinService.OK : JoplinService.Cancel;
    }

    async showMessageBoxNative(message: string) {
        const result = await this.repo.dialogShowMessageBox(message);
        return result === 0 ? JoplinService.OK : JoplinService.Cancel;
    }

    async queryThemeType(): Promise<ThemeType> {
        return await this.repo.settingsLoadGlobal("theme", ThemeType.THEME_UNKNOWN) as ThemeType;
    }

    async updateNoteBody(noteId: string, body: string) {
        return this.repo.dataPut(["notes", noteId], null, { body });
    }

    async appendTextToNote(noteId: string, text: string) {
        const {
            repo,
        } = this;

        const {
            id: currentNoteId,
        } = await repo.workspaceSelectedNote();
        if (currentNoteId === noteId) {
            await repo.commandsExecute("textSelectAll");
            const selectedText = (await repo.commandsExecute("selectedText") as string);
            const newBody = selectedText + text;
            await repo.commandsExecute("replaceSelection", newBody);
            return newBody;
        }

        const note = await repo.getNote(noteId, ["body"]);
        const {
            body,
        } = note;
        const newBody = body + text;
        await this.updateNoteBody(noteId, newBody);
        return newBody;
    }

    openNote(noteId: string) {
        const {
            repo,
        } = this;
        repo.commandsExecute("openNote", noteId);
    }

    async openNoteAndWaitOpened(noteId: string, timeout: number = TimerRepo.DEFAULT_TIMEOUT) {
        const {
            repo,
            timerRepo,
        } = this;

        await timerRepo.tryWaitUntilTimeout(async () => {
            this.openNote(noteId);
            const note = await repo.workspaceSelectedNote();
            return note.id === noteId;
        }, timeout);
    }

    async urlToId(url: string): Promise<string> {
        return (await sha256(url)).slice(0, 32);
    }

    async createNoteWithIdIfNotExists(noteId: string, title: string, options: any = undefined) {
        const {
            repo,
        } = this;

        const {
            parentId,
        } = options;

        const path = ["notes", noteId];

        try {
            const node = await repo.dataGet(path);
            return node;
        } catch (e) {
            // Note does not exist, create it
        }

        return repo.dataPost(path, undefined, {
            id: noteId,
            title,
            parent_id: parentId,
        });
    }

    async queryNotebookId(name: string) {
        // @FIXME implement has more?
        const {
            repo,
        } = this;

        const query = await repo.dataGet(["folders"], { fields: ["id", "title"] });

        const notebook = query.items.find((item) => item.title === name);

        return notebook?.id ?? "";
    }
}
