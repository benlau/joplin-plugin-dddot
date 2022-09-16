export default class TimerRepo {
    static DEFAULT_TIMEOUT = 3000;

    static DEFAULT_INTERVAL = 100;

    async sleep(ms: number) {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async tryWaitUntilTimeout(
        condition: () => Promise<boolean>,
        timeout: number = TimerRepo.DEFAULT_TIMEOUT,
    ) {
        const start = Date.now();
        while (!await condition()) {
            if (Date.now() - start > timeout) {
                throw new Error("Timeout");
            }
            await this.sleep(TimerRepo.DEFAULT_INTERVAL);
        }
    }
}
