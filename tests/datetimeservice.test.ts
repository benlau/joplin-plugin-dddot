import JoplinRepo from "../src/repo/joplinrepo";
import DateTimeService from "../src/services/datetime/datetimeservice";

jest.mock("../src/repo/joplinrepo");

test("normalizeDate", async () => {
    const joplinRepo = (new JoplinRepo()) as any;
    const dateTimeService = new DateTimeService(joplinRepo);

    const today = new Date();
    today.setFullYear(2022);
    today.setMonth(8);
    today.setHours(2);

    const yesterday = new Date(today.getTime());
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0);
    yesterday.setMinutes(0);
    yesterday.setMilliseconds(0);

    expect(
        dateTimeService.normalizeDate(today, 0),
    ).toStrictEqual(today);

    expect(
        dateTimeService.normalizeDate(today, 8),
    ).toStrictEqual(yesterday);
});
