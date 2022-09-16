import NoteDialogService from "src/services/notedialog/notedialogservice";
import Tool from "../tool";
import ToolbarService from "../../services/toolbar/toolbarservice";
import ServicePool from "../../services/servicepool";

export default class RandomNoteTool extends Tool {
    toolbarService: ToolbarService;

    noteDialogService: NoteDialogService;

    constructor(servicePool: ServicePool) {
        super(servicePool);
        this.toolbarService = servicePool.toolbarService;
        this.noteDialogService = servicePool.noteDialogService;
        this.joplinRepo = servicePool.joplinRepo;
    }

    async start() {
    }

    async onLoaded() {
        this.toolbarService.addToolbarItem({
            name: "Daily Note",
            icon: "fa-dice",
            onClick: {
                type: "randomnote.tool.openRandomNote",
            },
            onContextMenu: {
                type: "randomnote.tool.openRandomNoteByNoteDialog",
            },
        });
    }

    get hasView() {
        return false;
    }

    get title() {
        return "randomnote.title";
    }

    get key() {
        return "randomnote";
    }

    async onMessage(message : any) {
        const { type } = message;
        switch (type) {
        case "randomnote.tool.openRandomNote":
            return this.openRandomNote();
        case "randomnote.tool.openRandomNoteByNoteDialog":
            break;
        default: break;
        }
        return undefined;
    }

    async openRandomNote() {
        const count = await this.joplinService.calcNoteCount();
        const index = Math.floor(Math.random() * count);
        await this.joplinService.openNoteByIndex(index);
    }
}
