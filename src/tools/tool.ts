import { MenuItem } from "api/types";
import JoplinRepo from "../repo/joplinrepo";
import JoplinService from "../services/joplin/joplinservice";
import ServicePool from "../services/servicepool";
import { ToolButton } from "../types/toolinfo";

export function blockDisabled(_target, _name, descriptor) {
    const original = descriptor.value;
    // eslint-disable-next-line
    descriptor.value = function(...args) {
        return this.isEnabled ? original.apply(this, args) : undefined;
    };
}

export default class Tool {
    joplinRepo: JoplinRepo;

    joplinService: JoplinService;

    servicePool: ServicePool;

    isEnabled: Boolean = true;

    constructor(servicePool: ServicePool) {
        const {
            joplinService,
        } = servicePool;
        this.joplinRepo = joplinService.joplinRepo;
        this.joplinService = joplinService;
        this.servicePool = servicePool;
    }

    get containerId() {
        return `dddot-${this.key}-tool-container`;
    }

    get contentId() {
        return `dddot-${this.key}-tool-content`;
    }

    get key() {
        return "";
    }

    get title() {
        return "";
    }

    get workerFunctionName() {
        return `${this.key}Worker`;
    }

    get isDefaultEnabled() {
        return true;
    }

    get hasView() {
        return true;
    }

    get hasWorkerFunction() {
        return true;
    }

    get extraButtons(): ToolButton[] {
        return [];
    }

    async updateEnabledFromSetting() {
        const res = await this.joplinRepo.settingsLoad(this.genSettingKey("enabled"), true);
        this.isEnabled = res as Boolean;
        return res;
    }

    genSettingKey(key: string) {
        return `dddot.settings.${this.key}.${key}`;
    }

    settings(_: string) {
        return {};
    }

    async start() {
    }

    async registerCommands(): Promise<MenuItem[]> {
        return [];
    }

    async onLoaded() {
    }
}
