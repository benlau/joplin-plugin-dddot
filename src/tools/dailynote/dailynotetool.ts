import { t } from "i18next";
import Tool from "../tool";
import ToolbarService from "../../services/toolbar/toolbarservice";
import ServicePool from "../../services/servicepool";

export default class DailyNoteTool extends Tool {
    toolbarService: ToolbarService;

    constructor(servicePool: ServicePool) {
        super(servicePool);
        this.toolbarService = servicePool.toolbarService;
    }

    settings(_: string) {
        return {};
    }

    async start() {
    }

    async onLoaded() {
        console.log("daily note: on loaded");
        this.toolbarService.addToolbarItem({
            name: "Daily Note",
            icon: "fa-sticky-note",
        });
    }

    get hasView() {
        return false;
    }

    get title() {
        return t("dailynote.title");
    }

    get key() {
        return "dailynote";
    }

    async onMessage(message: any) {
    }
}
