import { t } from "i18next";
import { SettingItemType } from "api/types";
import ServicePool from "src/services/servicepool";
import { Outline } from "src/types/outline";
import Tool, { blockDisabled } from "../tool";
import { debouncer } from "../../utils/debouncer";

const OutlineLineHeight = 28;
const OutlineHeightMargin = 10;
const MinHeight = OutlineLineHeight + OutlineHeightMargin;
const OutlineHeight = "dddot.settings.outline.height";

export default class OutlineTool extends Tool {
    get title() {
        return t("outline.title");
    }

    get key() {
        return "outline";
    }

    deboucnedRefresh: Function;

    lastOutlines?: Outline[];

    constructor(servicePool: ServicePool) {
        super(servicePool);

        this.deboucnedRefresh = debouncer(() => {
            this.refreshNow();
        }, 200);
    }

    async start() {
        await this.joplinRepo.workspaceOnNoteSelectionChange(() => {
            this.onNoteSelectionChanged();
        });

        await this.joplinRepo.workspaceOnNoteChange(() => {
            this.onNoteChanged();
        });
    }

    settings(section: string) {
        return {
            [OutlineHeight]: {
                value: MinHeight,
                type: SettingItemType.Int,
                public: true,
                label: t("outline.settings.height"),
                minValue: MinHeight,
                step: OutlineLineHeight,
                section,
            },
        };
    }

    get extraButtons() {
        return [
            {
                tooltip: t("outline.resize_to_fit_tooltip"),
                icon: "fas fa-expand-arrows-alt",
                message: {
                    type: "outline.onAutoResizeClicked",
                },
            },
        ];
    }

    @blockDisabled
    async onNoteSelectionChanged() {
        this.refresh();
    }

    @blockDisabled
    async onNoteChanged() {
        this.refresh();
    }

    @blockDisabled
    refresh() {
        this.deboucnedRefresh();
    }

    @blockDisabled
    async refreshNow() {
        try {
            const {
                id,
                title,
                outlines,
            } = await this.query();

            const message = {
                type: "outline.refresh",
                id,
                title,
                outlines,
            };

            await this.joplinRepo.panelPostMessage(message);
        } catch (e) {
            console.error(e);
            await this.joplinRepo.panelPostMessage({
                type: "dddot.logError",
                error: e,
            });
        }
    }

    async onMessage(message: any) {
        switch (message.type) {
        case "outline.onReady":
            return this.onReady();
        case "outline.openOutline":
            return this.openOutline(message.slug, message.lineno);
        case "outline.copyOutlineLink":
            return this.copyOutlineLink(
                message.link,
            );
        case "outline.setHeight":
            return this.setHeight(message.height);
        case "outline.onAutoResizeClicked":
            return this.onAutoResizeClicked();
        default:
            break;
        }
        return undefined;
    }

    async onReady() {
        const height = await this.joplinRepo.settingsLoad(OutlineHeight, MinHeight);
        const content = await this.query();
        return { height, ...content };
    }

    async query() {
        const activeNote = await this.joplinRepo.workspaceSelectedNote();

        if (!activeNote || activeNote.body == null) {
            return {
                outlines: [],
                id: "",
                title: "",
            };
        }
        const markdownParser = this.servicePool.markdownParserService;
        const headings = markdownParser.parseHeadings(activeNote.body);

        const convert = (heading: any) => {
            const link = markdownParser.genMarkdownLink(
                `${heading.title} @ ${activeNote.title}`,
                activeNote.id,
                heading.slug,
            );
            const children = heading.children.map(convert);

            return {
                ...heading,
                link,
                children,
            };
        };

        const outlines: Outline[] = headings.map(convert);

        outlines.unshift(
            {
                title: activeNote.title,
                level: 0,
                slug: "",
                children: [],
                lineno: 0,
                link: markdownParser.genMarkdownLink(
                    activeNote.title,
                    activeNote.id,
                ),
            },
        );

        this.lastOutlines = [...outlines];

        return {
            outlines,
            id: activeNote.id,
            title: activeNote.title,
        };
    }

    async openOutline(slug: string, lineno: number) {
        const {
            joplinRepo,
        } = this.servicePool;

        // Ref&Credit: joplin-outline project
        // https://github.com/cqroot/joplin-outline

        const editorCodeView = await joplinRepo.settingsLoadGlobal("editor.codeView", undefined);
        const noteVisiblePanes = await joplinRepo.settingsLoadGlobal("noteVisiblePanes", undefined);
        if (editorCodeView && noteVisiblePanes.includes("editor")) {
            // Markdown editor available
            await joplinRepo.commandsExecute("editor.execCommand", {
                name: "dddot.contentScript.scrollToLine",
                args: [lineno],
            });
        } else {
            // RTF Editor
            const hash = slug === "" ? "rendered-md" : slug;
            await joplinRepo.commandsExecute("scrollToHash", hash);
        }
    }

    copyOutlineLink(link: string) {
        const elem = document.createElement("textarea");
        document.body.appendChild(elem);
        elem.value = link;
        elem.focus();
        elem.select();
        document.execCommand("copy");
        elem.remove();
    }

    async setHeight(height: number) {
        const {
            joplinRepo,
        } = this;

        await joplinRepo.settingsSave(OutlineHeight, height);
    }

    onAutoResizeClicked() {
        const {
            joplinRepo,
        } = this;

        let counter = 0;
        const count = (outlines: Outline[]) => {
            counter += outlines.length;
            outlines.forEach((outline) => count(outline.children));
        };

        count(this.lastOutlines);
        const newHeight = counter * OutlineLineHeight + OutlineHeightMargin;

        joplinRepo.panelPostMessage({
            type: "outline.autoResize",
            newHeight,
        });
        this.setHeight(newHeight);
    }
}
