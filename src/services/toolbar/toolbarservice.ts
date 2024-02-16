import JoplinService from "../joplin/joplinservice";

interface ToolbarItem {
  name: string;
  icon: string;
  tooltip: string;
  onClick: object;
  onContextMenu?: object;
}

export default class ToolbarService {
    joplinService: JoplinService;

    toolbarItems: ToolbarItem[] = [];

    constructor(joplinService: JoplinService) {
        this.joplinService = joplinService;
    }

    async onLoaded() {
        this.toolbarItems = [];
    }

    addToolbarItem(item: ToolbarItem) {
        this.toolbarItems.push(item);
    }

    async onMessage(message: any) {
        const {
            type,
        } = message;

        switch (type) {
        case "toolbar.service.onReady":
            return this.toolbarItems;
        default:
            break;
        }
        return undefined;
    }
}
