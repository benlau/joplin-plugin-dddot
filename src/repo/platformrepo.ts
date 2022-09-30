import { platform } from "os";

export default class PlatformRepo {
    isLinux() {
        return platform() === "linux";
    }

    isMac() {
        return platform() === "darwin";
    }
}
