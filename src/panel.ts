import joplin from "api";
import { SettingItemType } from "api/types";
import ScratchPad from "./tools/scratchpad";
import RecentNotes from "./tools/recentnotes";
import Shortcuts from "./tools/shortcuts";
import Tool from "./tools/tool";
import JoplinRepo from "./repo/joplinrepo";
import ServicePool from "./services/servicepool";
import BackLinks from "./tools/backlinks";
import TextSorter from "./tools/textsorter";
import ThemeType from "./types/themetype";

const ToolOrder = "dddot.settings.panel.toolorder";

export default class Panel {
    public view: string;

    public joplinRepo: JoplinRepo;

    public servicePool: ServicePool;

    public tools: Tool[];

    async loadResources() {
        const resources = [
            "./panel.css",
            "./dddot.js",
            "./libs/jquery.min.js",
            "./libs/codemirror.js",
            "./libs/codemirror.css",
            "./libs/Sortable.min.js",
            "./theme/codemirror/blackboard.css",
        ];

        await Promise.all(
            resources.map(
                async (resource) => joplin.views.panels.addScript(this.view, resource),
            ),
        );
        const scripts = this.tools.filter((tool) => tool.hasView).map((tool) => {
            const { key } = tool;
            return [
                `./tools/${key}/worker.js`,
                `./tools/${key}/style.css`,
            ];
        }).reduce((acc, val) => acc.concat(val), []);

        await Promise.all(
            scripts.map(async (script) => joplin.views.panels.addScript(this.view, script)),
        );
    }

    async render() {
        const toolHtmls = this.tools.filter((tool) => tool.hasView).map((tool: Tool) => {
            const content = `
            <div class="dddot-tool dddot-hidden" data-id="${tool.key}" id="${tool.containerId}">
            <div class="dddot-tool-header">
                <h3><i class="fas fa-bars"></i> ${tool.title}</h3>
                <h3 class="dddot-expand-button dddot-expand-button-active"><i class="fas fa-play"></i></h3>
            </div>
                <div id="${tool.contentId}"></div>
            </div>
            `;
            return content;
        }).join("\n");
        const html = `
        <div id="dddot-panel-container">
            ${toolHtmls}
        </div>
        `;
        await joplin.views.panels.setHtml(this.view, html);
    }

    async createSettings(tools: any) {
        const SECTION = "dddot.settings";

        await joplin.settings.registerSection("dddot.settings", {
            label: "DDDot",
            iconName: "fas fa-braille",
        });

        const allSettings = tools.reduce((acc, tool) => {
            const settings = tool.settings(SECTION);
            const enabledKey = tool.genSettingKey("enabled");
            settings[enabledKey] = {
                value: tool.isDefaultEnabled,
                type: SettingItemType.Bool,
                public: true,
                label: `Enable ${tool.title}`,
                section: SECTION,
            };
            return {
                ...acc,
                ...settings,
            };
        }, {});

        allSettings[ToolOrder] = {
            value: [],
            type: SettingItemType.Object,
            public: false,
            label: "Tool Order",
            SECTION,
        };

        await joplin.settings.registerSettings(allSettings);
    }

    async start() {
        this.view = await joplin.views.panels.create("dddot.panel");
        const joplinRepo = new JoplinRepo(this.view);
        this.joplinRepo = joplinRepo;
        this.servicePool = new ServicePool(joplinRepo);

        const scratchpad = new ScratchPad(this.servicePool);
        const recentlyNotes = new RecentNotes(this.servicePool);
        const shortcuts = new Shortcuts(this.servicePool);
        const backLinks = new BackLinks(this.servicePool);
        const textSorter = new TextSorter(this.servicePool);

        const tools = [scratchpad, shortcuts, recentlyNotes, backLinks, textSorter];
        this.tools = tools;

        await this.createSettings(tools);

        await joplin.views.panels.onMessage(this.view, async (message:any) => {
            const token = message.type.split(".");
            const target = token[0];
            if (target === "dddot" || target === "panel") {
                return this.onMessage(message);
            }
            const module = tools.filter((item) => item.key === target);
            return module[0].onMessage(message);
        });

        await Promise.all(tools.map((tool) => tool.start()));

        await Promise.all(tools.map(async (tool) => {
            const enabled = await tool.updateEnabledFromSetting();
            if (enabled) {
                await tool.registerCommands();
            }
        }));

        await this.render();
        await this.loadResources();
    }

    async toggleVisibility() {
        const isVisible: boolean = await joplin.views.panels.visible(this.view);
        await joplin.views.panels.show(this.view, (!isVisible));
    }

    async onMessage(message: any) {
        const { noteId } = message;

        switch (message.type) {
        case "dddot.onLoaded":
            return this.onLoaded();
        case "dddot.onToolOrderChanged":
            return this.onToolOrderChanged(message.toolIds);
        case "dddot.getNote":
            return { note: await joplin.data.get(["notes", noteId]) };
        case "dddot.openNote":
            joplin.commands.execute("openNote", noteId);
            break;
        case "panel.openFolder":
            this.openFolder(message.folderId);
            break;
        default:
            break;
        }
        return undefined;
    }

    openFolder(folderId: string) {
        joplin.commands.execute("openFolder", folderId);
    }

    async onToolOrderChanged(toolIds) {
        return joplin.settings.setValue(ToolOrder, toolIds);
    }

    async onLoaded() {
        const {
            joplinService,
        } = this.servicePool;

        const toolIds = await this.joplinRepo.settingsLoad(ToolOrder, []);
        this.joplinRepo.panelPostMessage({
            type: "dddot.setToolOrder",
            toolIds,
        });

        const tools = await Promise.all(
            this.tools.filter(
                (tool) => tool.hasView,
            ).map(async (tool) => {
                const {
                    workerFunctionName,
                    containerId,
                    contentId,
                } = tool;

                const enabled = await tool.updateEnabledFromSetting();

                return {
                    workerFunctionName,
                    containerId,
                    contentId,
                    enabled,
                };
            }),
        );
        const currentTheme = await joplinService.queryThemeType();

        this.joplinRepo.panelPostMessage({
            type: "dddot.start",
            tools,
            theme: {
                name: ThemeType[currentTheme],
                isDarkTheme: ThemeType.isDarkTheme(currentTheme),
                isLightTheme: ThemeType.isLightTheme(currentTheme),
            },
        });
    }
}
