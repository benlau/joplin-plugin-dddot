import { t } from "i18next";
import DateTimeService from "src/services/datetime/datetimeservice";
import Tool from "../tool";
import ToolbarService from "../../services/toolbar/toolbarservice";
import ServicePool from "../../services/servicepool";

export default class DailyNoteTool extends Tool {
    toolbarService: ToolbarService;

    dateTimeService: DateTimeService;

    constructor(servicePool: ServicePool) {
        super(servicePool);
        this.toolbarService = servicePool.toolbarService;
        this.dateTimeService = servicePool.dateTimeService;
    }

    settings(_: string) {
        return {};
    }

    async start() {
    }

    async onLoaded() {
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

    async onMessage(_: any) {
    }

    async createDailyNote() {
        const {
            joplinService,
            dateTimeService,
        } = this;

        const startHour = 7; // @FIXME read from settings

        const today = dateTimeService.getNormalizedToday(startHour);
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const day = today.getDate().toString().padStart(2, "0");
        const url = `calendar://default/day/${year}/${month}/${day}`;

        const id = await joplinService.urlToId(url);

        const title = `${year}-${month}-${day}`; // @FIXME - read format from settings

        await joplinService.createNoteWithIdIfNotExists(id, title);
    }
}
