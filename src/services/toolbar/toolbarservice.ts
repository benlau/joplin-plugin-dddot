import JoplinService from "../joplin/joplinservice";

interface ToolbarItem {
  name: string;
  icon: string;
  onClick?: () => void;
  onContextMenu?: () => void;
}

export default class ToolbarService {
    joplinService: JoplinService;

    toolbarItems: ToolbarItem[] = [];

    constructor(joplinService: JoplinService) {
        this.joplinService = joplinService;
    }

    async onLoaded() {
        const home = {
            name: "home",
            icon: "fa-home",
        };
        this.toolbarItems = [home];
    }

    addToolbarItem(item: ToolbarItem) {
        this.toolbarItems.push(item);
    }

    render() {
        const buttons = this.toolbarItems.map((item) => this.renderButton(item)).join("\n");
        return `
      <div class="dddot-toolbar-content">
        ${buttons}
      </div>`;
    }

    renderButton(item: ToolbarItem) {
        return `
      <div class="dddot-toolbar-item">
        <div class="dddot-toolbar-item-icon">
          <i class="${item.icon} fas"></i>
        </div>
      </div>
    `;
    }

    async onMessage(message: any) {
        const {
            type,
        } = message;

        switch (type) {
        case "toolbar.service.onReady":
            return this.render();
        default:
            break;
        }
        return undefined;
    }
}
