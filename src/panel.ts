import joplin from "api";
import { ContentScriptType, SettingItemType } from "api/types";
import { t } from "i18next";
import ScratchPad from "./tools/scratchpad";
import RecentNotes from "./tools/recentnotes";
import Shortcuts from "./tools/shortcuts";
import Tool from "./tools/tool";
import JoplinRepo from "./repo/joplinrepo";
import ServicePool from "./services/servicepool";
import BackLinks from "./tools/backlinks";
import ThemeType from "./types/themetype";
import DailyNoteTool from "./tools/dailynote/dailynotetool";
import RandomNoteTool from "./tools/randomnote/randomnotetool";
import PlatformRepo from "./repo/platformrepo";
import { ToolInfo } from "./types/toolinfo";
import OutlineTool from "./tools/outline";

const ToolOrder = "dddot.settings.panel.toolorder";

export default class Panel {
    public view: string;

    public joplinRepo: JoplinRepo;

    public servicePool: ServicePool;

    public tools: Tool[];

    async loadResources() {
        const resources = [
            "./panel.css",
            "./sandbox/app.js",
            "./sandbox/dddot.js",
            "./sandbox/codemirror5manager.js",
            "./libs/codemirror.js",
            "./libs/codemirror.css",
            "./theme/codemirror/blackboard.css",
            "./styles/css-tooltip.css",
            "./styles/tailwind.css",
        ].concat(this.servicePool.assetFiles);

        await Promise.all(
            resources.map(
                async (resource) => joplin.views.panels.addScript(this.view, resource),
            ),
        );
        const scripts = this.tools.filter((tool) => tool.hasWorkerFunction).map((tool) => {
            const { key } = tool;
            return [
                `./tools/${key}/worker.js`,
                `./tools/${key}/style.css`,
            ];
        }).reduce((acc, val) => acc.concat(val), []);

        await Promise.all(
            scripts.map(async (script) => joplin.views.panels.addScript(this.view, script)),
        );

        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            "dddot.contentScript",
            "./sandbox/contentScriptCM6.js",
        );

        await joplin.contentScripts.register(
            ContentScriptType.CodeMirrorPlugin,
            "dddot.contentScript",
            "./sandbox/contentScriptCM5.js",
        );
    }

    async render() {
        const html = `
        <div id="dddot-app">
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
            let settings = {};
            const enabledKey = tool.genSettingKey("enabled");
            const label = t(`${tool.key}.enable`);

            settings[enabledKey] = {
                value: tool.isDefaultEnabled,
                type: SettingItemType.Bool,
                public: true,
                label,
                section: SECTION,
            };

            const toolSettings = tool.settings(SECTION);
            settings = { ...settings, ...toolSettings };

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
        const dailyNote = new DailyNoteTool(this.servicePool);
        const randomNote = new RandomNoteTool(this.servicePool);
        const outlineTool = new OutlineTool(this.servicePool);

        const tools = [
            scratchpad, outlineTool, shortcuts, recentlyNotes, backLinks,
            dailyNote, randomNote];
        this.tools = tools;

        const platformRepo = new PlatformRepo();

        let registeredCommands = [];

        await this.createSettings(tools);

        await joplin.views.panels.onMessage(this.view, async (message:any) => {
            const token = message.type.split(".");
            const target = token[0];
            if (target === "dddot" || target === "panel") {
                return this.onMessage(message);
            }
            if (this.servicePool.hasReceiver(target)) {
                return this.servicePool.onMessage(message);
            }
            const module = tools.filter((item) => item.key === target);
            return module[0].onMessage(message);
        });

        await Promise.all(tools.map((tool) => tool.start()));

        registeredCommands = registeredCommands.concat(
            await Promise.all(tools.map(async (tool) => {
                const enabled = await tool.updateEnabledFromSetting();
                if (enabled) {
                    return tool.registerCommands();
                }
                return [];
            })),
        );

        await this.render();
        await this.loadResources();
        registeredCommands = registeredCommands.concat(
            await this.servicePool.registerCommands(),
        ).flat();

        await joplinRepo.menusCreate("DDDotToolMenu", "DDDot", [
            {
                commandName: "dddot.cmd.toggleDDDot",
                accelerator: platformRepo.isMac() ? "Shift+Cmd+." : "Ctrl+Shift+.",
            },
            ...registeredCommands,
        ]);
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
        case "dddot.focusNoteBody":
            joplin.commands.execute("focusElementNoteBody");
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
        /// Triggered by DDDot.onLoad which may be called multiple times
        /// e.g when the panel is hidden and shown again
        const {
            joplinService,
            joplinRepo,
        } = this.servicePool;

        await this.servicePool.onLoaded();

        const toolIds = await this.joplinRepo.settingsLoad(ToolOrder, []);

        this.joplinRepo.panelPostMessage({
            type: "dddot.setToolOrder",
            toolIds,
        });

        const tools = await Promise.all(
            this.tools.filter(
                (tool) => tool.hasWorkerFunction,
            ).map(async (tool) => {
                const {
                    workerFunctionName,
                    containerId,
                    contentId,
                    key,
                    title,
                    hasView,
                } = tool;

                const extraButtons = await tool.queryExtraButtons();

                const enabled = await tool.updateEnabledFromSetting();

                if (enabled) {
                    await tool.onLoaded();
                }

                return {
                    title: t(title),
                    key,
                    workerFunctionName,
                    containerId,
                    contentId,
                    enabled,
                    hasView,
                    extraButtons,
                } as ToolInfo;
            }),
        );
        const currentTheme = await joplinService.queryThemeType();
        const { serviceWorkerFunctions } = this.servicePool;

        const locale = await joplinRepo.settingsLoadGlobal("locale", "en");

        this.joplinRepo.panelPostMessage({
            type: "dddot.start",
            tools,
            serviceWorkerFunctions,
            locale,
            theme: {
                name: ThemeType[currentTheme],
                isDarkTheme: ThemeType.isDarkTheme(currentTheme),
                isLightTheme: ThemeType.isLightTheme(currentTheme),
            },
        });
    }
}
