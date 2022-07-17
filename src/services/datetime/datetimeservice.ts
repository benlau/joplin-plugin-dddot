import JoplinRepo from "src/repo/joplinrepo";

export default class DateTimeService {

    joplinRepo: JoplinRepo;

    constructor(joplinRepo: JoplinRepo) {
        this.joplinRepo = joplinRepo;
    }

    normalizeDate(date: Date, startHour: number): Date {
      if (date.getHours() < startHour) {
        const newDate = new Date(date.getTime());
        newDate.setDate(date.getDate() - 1);
        newDate.setHours(0);
        newDate.setMinutes(0);
        return newDate;
      }
      return date;
    }

    async getToday(): Promise<Date> {
      // FIXME: get start date from setting
      const startHour = 8;
      const today = new Date();
      return this.normalizeDate(today, startHour);
    }
}