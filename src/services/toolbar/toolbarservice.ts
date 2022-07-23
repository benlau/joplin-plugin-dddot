import JoplinService from "../joplin/joplinservice";
import RendererService from "../renderer/rendererservice";

interface ToolbarItem {
  name: string;
  icon: string;
  onClick: any; // @FIXME - message type
  onContextMenu?: any; // @FIXME - message type
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
        const buttons = this.toolbarItems.map((item) => this.renderButton(item)).join("\n");
        return `
      <div class="dddot-toolbar-content">
        ${buttons}
      </div>`;
    }

    renderButton(item: ToolbarItem) {
        const js = `onClick="${this.rendererServie.renderInlineDDDotPostMessage(item.onClick)}"`;

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
