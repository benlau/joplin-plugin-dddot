export default class DateTimeService {
    normalizeDate(date: Date, startHour: number): Date {
        if (date.getHours() < startHour) {
            const newDate = new Date(date.getTime());
            newDate.setDate(date.getDate() - 1);
            newDate.setHours(0);
            newDate.setMinutes(0);
            newDate.setMilliseconds(0);
            return newDate;
        }
        return date;
    }

    getNormalizedToday(startHour: number) {
        const today = new Date();
        return this.normalizeDate(today, startHour);
    }
}
