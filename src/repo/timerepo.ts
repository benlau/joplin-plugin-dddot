export default class TimeRepo {
    async sleep(ms: number) {
        await new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
