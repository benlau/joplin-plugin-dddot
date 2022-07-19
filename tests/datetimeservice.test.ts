import DateTimeService from "../src/services/datetime/datetimeservice";

test("normalizeDate", async () => {
    const dateTimeService = new DateTimeService();

    const today = new Date(2022, 8, 2);

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
