import { SettingItemType } from "api/types";
import Tool from "../tool";

const ScratchPadContent = "dddot.settings.scratchpad.content";

export default class ScratchPad extends Tool {
    get title() {
        return "Scratchpad";
    }

    settings(section: string) {
        return {
            [ScratchPadContent]: {
                value: "",
                type: SettingItemType.String,
                public: false,
                label: "Scratchpad content",
                section,
            },
        };
    }

    async start() {
    }

    async onMessage(message: any) {
        switch (message.type) {
        case "scratchpad.loadTextArea":
            return this.joplinRepo.settingsLoad(ScratchPadContent, "");
        case "scratchpad.saveTextArea":
            return this.joplinRepo.settingsSave(ScratchPadContent, message.value);
        case "scratchpad.onReady":
            return this.render();
        default:
            return undefined;
        }
    }

    async render() {
        return `
            <textarea id="dddot-scratchpad-textarea" rows="10"></textarea>
        `;
    }

    get key() {
        return "scratchpad";
    }
}
