import JoplinService from "../joplin/joplinservice";
import RendererService from "../renderer/rendererservice";

interface ToolbarItem {
  name: string;
  icon: string;
  onClick: any;
  onContextMenu?: any;
}

export default class ToolbarService {
    joplinService: JoplinService;

    rendererServie: RendererService;

    toolbarItems: ToolbarItem[] = [];

    constructor(joplinService: JoplinService, rendererService: RendererService) {
        this.joplinService = joplinService;
        this.rendererServie = rendererService;
    }

    async onLoaded() {
        this.toolbarItems = [];
    }

    addToolbarItem(item: ToolbarItem) {
        this.toolbarItems.push(item);
    }

    render() {
        if (this.toolbarItems.length === 0) {
            return undefined;
        }
        const buttons = this.toolbarItems.map((item) => this.renderButton(item)).join("\n");
        return `
      <div class="dddot-toolbar-content">
        ${buttons}
      </div>`;
    }

    renderButton(item: ToolbarItem) {
        const events = ["onClick", "onContextMenu"];

        const listeners = events.map((event) => {
            if (item[event] !== undefined) {
                return `${event.toLocaleLowerCase()}="${this.rendererServie.renderInlineDDDotPostMessage(item[event])}; return false;"`;
            }
            return undefined;
        }).filter((listener) => listener !== undefined);
        const js = listeners.join(" ");

        return `
      <div class="dddot-toolbar-item" ${js}>
        <div class="dddot-toolbar-item-icon dddot-clickable">
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
