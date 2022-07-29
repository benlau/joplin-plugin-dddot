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
            icon: "fa-home",
            onClick: {
                type: "dailynote.service.createAndOpenDailyNote",
            },
        });
    }

    get hasView() {
        return false;
    }

    get title() {
        return "dailynote.title";
    }

    get key() {
        return "dailynote";
    }

    async onMessage(message : any) {
        const { type } = message;
        switch (type) {
        case "dailynote.service.createAndOpenDailyNote":
            this.createAndOpenDailyNote();
            break;
        default: break;
        }
    }

    breakdownDate(date: Date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return {
            year, month, day,
        };
    }

    async genNoteId(date: Date) {
        const {
            joplinService,
        } = this;

        const { year, month, day } = this.breakdownDate(date);

        const url = `calendar://default/day/${year}/${month}/${day}`;

        return joplinService.urlToId(url);
    }

    async createAndOpenDailyNote() {
        const {
            noteId,
        } = await this.createDailyNote();

        await this.joplinService.openNoteAndWaitOpened(noteId);
    }

    async createDailyNote() {
        const {
            joplinService,
            dateTimeService,
        } = this;

        const startHour = 7; // @FIXME read from settings

        const today = dateTimeService.getNormalizedToday(startHour);
        const { year, month, day } = this.breakdownDate(today);

        const noteId = await this.genNoteId(today);

        const title = `${year}-${month}-${day}`; // @FIXME - read format from settings

        joplinService.createNoteWithIdIfNotExists(noteId, title);

        return {
            noteId,
        };
    }
}
