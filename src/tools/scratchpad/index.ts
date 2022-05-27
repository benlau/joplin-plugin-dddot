import { SettingItemType } from "api/types";
import { t } from "i18next";
import Tool from "../tool";

const ScratchPadContent = "dddot.settings.scratchpad.content";
const ScratchPadHeight = "dddot.settings.scratchpad.height";

export default class ScratchPad extends Tool {
    get title() {
        return t("scratchpad.title");
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
            [ScratchPadHeight]: {
                value: 200,
                type: SettingItemType.Int,
                public: true,
                label: "Scratchpad Height(px)", // @FIXME translate
                minValue: 50,
                step: 10,
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
            return this.onReady();
        case "scratchpad.tool.setHeight":
            return this.setHeight(message.height);
        default:
            return undefined;
        }
    }

    async setHeight(height: Number) {
        const {
            joplinRepo,
        } = this;

        await joplinRepo.settingsSave(ScratchPadHeight, height);
    }

    async onReady() {
        const {
            joplinRepo,
        } = this;

        const content = this.render();
        const height = await joplinRepo.settingsLoad(ScratchPadHeight, 200);
        return { content, height };
    }

    render() {
        return `
            <div>
                <textarea id="dddot-scratchpad-textarea" rows="10"></textarea>
                <div class="fas fa-ellipsis-h dddot-scratchpad-handle"></div>
            </div>
        `;
    }

    get key() {
        return "scratchpad";
    }
}
